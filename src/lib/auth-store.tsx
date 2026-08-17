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
      setFirebaseUser(user ? { uid: user.id, email: user.email } : null);
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
      setFirebaseUser(user ? { uid: user.id, email: user.email } : null);
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

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const uid = data.user.id;
    const { data: row, error: rowError } = await supabase.from("users").select("*").eq("uid", uid).single();
    if (rowError && rowError.code !== "PGRST116") throw new Error(rowError.message);
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
      resetPassword,
      changePassword,
      logout,
      updateOwnProfile,
    }),
    [ready, firebaseUser, profile, signUp, signIn, resetPassword, changePassword, logout, updateOwnProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
