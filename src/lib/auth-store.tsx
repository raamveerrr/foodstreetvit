import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import type { UserDoc, UserRole } from "./firebase/types";

interface AuthValue {
  ready: boolean;
  firebaseUser: { uid: string; email?: string | null } | null;
  profile: UserDoc | null;
  role: UserRole | null;
  isStudent: boolean;
  isOwner: boolean;
  signUp: (input: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<UserDoc | null>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  updateOwnProfile: (patch: { name?: string; phone?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<{ uid: string; email?: string | null } | null>(null);
  const [profile, setProfile] = useState<UserDoc | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user ?? null;
      setFirebaseUser(user ? { uid: user.id, email: user.email ?? null } : null);
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("uid", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Profile fetch error:", profileError);
        }
        setProfile((profileData as UserDoc) ?? null);
      } else {
        setProfile(null);
      }
      setReady(true);
    };

    void loadSession();
    const { data: sub } = supabase.auth.onAuthStateChange(async (_, session) => {
      const user = session?.user ?? null;
      setFirebaseUser(user ? { uid: user.id, email: user.email ?? null } : null);
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("uid", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Profile fetch error:", profileError);
        }
        setProfile((profileData as UserDoc) ?? null);
      } else {
        setProfile(null);
      }
      setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = useCallback<AuthValue["signUp"]>(async ({ name, email, password, phone }) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);

    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) throw new Error("Account created but user record is unavailable.");

    const { error: insertError } = await supabase.from("users").insert({
      uid,
      name,
      email: email.trim().toLowerCase(),
      phone: phone?.trim() ?? "",
      role: "STUDENT",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) throw new Error(insertError.message);
  }, []);

  const signIn = useCallback(async (emailOrPhone: string, password: string) => {
    let response;
    const cleanInput = emailOrPhone.trim();
    const isPhone = /^\+?[0-9\s-]{10,15}$/.test(cleanInput.replace(/[\s-]/g, ""));

    if (isPhone) {
      response = await supabase.auth.signInWithPassword({ phone: cleanInput, password });
    } else {
      response = await supabase.auth.signInWithPassword({ email: cleanInput, password });
    }
    const { data, error } = response;
    if (error) throw new Error(error.message);

    const uid = data.user.id;
    const userEmail = data.user.email;
    console.log("signIn: authenticated user email:", userEmail, "uid:", uid);

    // Try to fetch by uid first
    const { data: row, error: rowError } = await supabase.from("users").select("*").eq("uid", uid).single();

    if (rowError && rowError.code === "PGRST116") {
      // No row found with this uid, try fetching by email
      console.log("signIn: uid not found, trying to fetch by email");
      const { data: emailRow, error: emailError } = await supabase.from("users").select("*").eq("email", userEmail).single();

      if (!emailError && emailRow) {
        // Row exists with different uid, update it to match the current auth uid
        console.log("signIn: found existing user with email but different uid, updating uid from", emailRow.uid, "to", uid);
        const { data: updatedRow, error: updateError } = await supabase
          .from("users")
          .update({ uid })
          .eq("email", userEmail)
          .select()
          .single();

        if (updateError) {
          console.error("signIn: failed to update uid:", updateError);
          throw new Error("Failed to update user record: " + updateError.message);
        }

        console.log("signIn: updated user profile:", updatedRow);
        return (updatedRow as UserDoc) ?? null;
      } else if (emailError && emailError.code === "PGRST116") {
        // No user found at all, create new
        console.log("signIn: user not found, inserting new record");
        const { data: insertData, error: insertError } = await supabase.from("users").insert({
          uid,
          name: userEmail?.split("@")[0] ?? "Unknown",
          email: userEmail ?? "",
          phone: "",
          role: "STUDENT",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).select().single();

        if (insertError) {
          console.error("signIn: failed to insert user:", insertError);
          throw new Error("Failed to create user profile: " + insertError.message);
        }

        console.log("signIn: inserted new user profile:", insertData);
        return (insertData as UserDoc) ?? null;
      } else {
        console.error("signIn: error fetching by email:", emailError);
        throw new Error("Failed to fetch user profile: " + emailError?.message);
      }
    } else if (rowError) {
      console.error("signIn: error fetching by uid:", rowError);
      throw new Error("Failed to fetch user profile: " + rowError.message);
    }

    console.log("signIn: profile data returned:", row);
    return (row as UserDoc) ?? null;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) throw new Error(error.message);
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      } // In extreme test cases this might not map the public profiles correctly automatically, but Supabase Edge functions map them to `users` table via triggerr or next login
    });
    if (error) throw new Error(error.message);
  }, []);

  const changePassword = useCallback(async (newPassword: string) => {
    if (!firebaseUser) throw new Error("Please sign in and try again.");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);

    const { error: updateError } = await supabase.from("users").update({ must_change_password: false, updated_at: new Date().toISOString() }).eq("uid", firebaseUser.uid);
    if (updateError) throw new Error(updateError.message);
  }, [firebaseUser]);

  const updateOwnProfile = useCallback<AuthValue["updateOwnProfile"]>(async (patch) => {
    if (!firebaseUser) throw new Error("Please sign in and try again.");
    const { error } = await supabase.from("users").update({ ...patch, updated_at: new Date().toISOString() }).eq("uid", firebaseUser.uid);
    if (error) throw new Error(error.message);
  }, [firebaseUser]);

  const value = useMemo<AuthValue>(
    () => ({
      ready,
      firebaseUser,
      profile,
      role: profile?.role ?? null,
      isStudent: profile?.role === "STUDENT",
      isOwner: profile?.role === "SHOP_OWNER" || profile?.role === "SUPER_ADMIN",
      signUp,
      signIn,
      signInWithGoogle,
      resetPassword,
      changePassword,
      logout,
      updateOwnProfile,
    }),
    [ready, firebaseUser, profile, signUp, signIn, signInWithGoogle, resetPassword, changePassword, logout, updateOwnProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
