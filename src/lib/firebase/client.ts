import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFunctions, type Functions } from "firebase/functions";

/**
 * Firebase web configuration.
 * These values are publishable by design (they identify the project, they do not
 * grant access). All real authorization happens in Firestore Security Rules and
 * Cloud Functions.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyDAnsbiuQ8kLQQhfjUIWT8oMlWZ7qie3ks",
  authDomain: "digitalfoodstreet.firebaseapp.com",
  projectId: "digitalfoodstreet",
  storageBucket: "digitalfoodstreet.firebasestorage.app",
  messagingSenderId: "187111141625",
  appId: "1:187111141625:web:e1a3415835c764e208b228",
};

let app: FirebaseApp | null = null;

export const getFirebaseApp = (): FirebaseApp => {
  if (app) return app;
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
};

export const getDb = (): Firestore => {
  try {
    const app = getFirebaseApp();
    return getFirestore(app);
  } catch (err) {
    console.error("Failed to get Firestore instance:", err);
    return getFirestore(getFirebaseApp());
  }
};
export const getFirebaseAuth = (): Auth => getAuth(getFirebaseApp());
export const getFns = (): Functions => getFunctions(getFirebaseApp());

/** Firestore/Auth listeners must only ever be created in the browser. */
export const isBrowser = typeof window !== "undefined";
