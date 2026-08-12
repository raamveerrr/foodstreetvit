import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { getDb, getFirebaseAuth, isBrowser } from "./firebase/client";
import { friendlyError } from "./firebase/errors";
import type { UserDoc, UserRole } from "./firebase/types";

interface AuthValue {
  /** false until Firebase has restored the persisted session. */
  ready: boolean;
  firebaseUser: FirebaseUser | null;
  profile: UserDoc | null;
  role: UserRole | null;
  isStudent: boolean;
  isOwner: boolean;
  signUp: (input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: Exclude<UserRole, "SUPER_ADMIN">;
  }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<UserDoc | null>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateOwnProfile: (patch: { name?: string; phone?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserDoc | null>(null);

  // Session restore. Auth state drives one profile listener, nothing else.
  useEffect(() => {
    if (!isBrowser) return;
    const auth = getFirebaseAuth();
    void setPersistence(auth, browserLocalPersistence).catch(() => undefined);
    const stop = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) setProfile(null);
      setReady(true);
    });
    return stop;
  }, []);

  // Realtime profile (role changes take effect without a reload).
  useEffect(() => {
    if (!isBrowser || !firebaseUser) return;
    const ref = doc(getDb(), "users", firebaseUser.uid);
    const stop = onSnapshot(
      ref,
      (snap) => setProfile(snap.exists() ? (snap.data() as UserDoc) : null),
      () => setProfile(null),
    );
    return stop;
  }, [firebaseUser]);

  const signUp = useCallback<AuthValue["signUp"]>(async ({ name, email, password, phone, role }) => {
    const auth = getFirebaseAuth();
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      // The role is written once, at creation. Security rules make it immutable
      // from the client afterwards, so nobody can promote themselves.
      await setDoc(doc(getDb(), "users", cred.user.uid), {
        uid: cred.user.uid,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() ?? "",
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      throw new Error(friendlyError(err, "We couldn't create your account."));
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
      const snap = await getDoc(doc(getDb(), "users", cred.user.uid));
      return snap.exists() ? (snap.data() as UserDoc) : null;
    } catch (err) {
      throw new Error(friendlyError(err, "We couldn't sign you in."));
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
    } catch (err) {
      throw new Error(friendlyError(err, "We couldn't send the reset email."));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(getFirebaseAuth());
    } catch (err) {
      throw new Error(friendlyError(err, "We couldn't sign you out."));
    }
  }, []);

  const updateOwnProfile = useCallback<AuthValue["updateOwnProfile"]>(
    async (patch) => {
      if (!firebaseUser) throw new Error("Please sign in and try again.");
      try {
        await updateDoc(doc(getDb(), "users", firebaseUser.uid), {
          ...patch,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        throw new Error(friendlyError(err, "Unable to save your changes."));
      }
    },
    [firebaseUser],
  );

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
      logout,
      updateOwnProfile,
    }),
    [ready, firebaseUser, profile, signUp, signIn, resetPassword, logout, updateOwnProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
