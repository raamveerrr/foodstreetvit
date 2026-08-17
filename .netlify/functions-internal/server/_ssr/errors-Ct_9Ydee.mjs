import { a as getApp, o as getApps, s as initializeApp } from "../_libs/@firebase/app+[...].mjs";
import { s as getFirestore } from "../_libs/@firebase/firestore+[...].mjs";
import "../_libs/firebase.mjs";
import { t as getFunctions } from "../_libs/firebase__functions.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/errors-Ct_9Ydee.js
/**
* Firebase web configuration.
* These values are publishable by design (they identify the project, they do not
* grant access). All real authorization happens in Firestore Security Rules and
* Cloud Functions.
*/
var firebaseConfig = {
	apiKey: "AIzaSyDAnsbiuQ8kLQQhfjUIWT8oMlWZ7qie3ks",
	authDomain: "digitalfoodstreet.firebaseapp.com",
	projectId: "digitalfoodstreet",
	storageBucket: "digitalfoodstreet.firebasestorage.app",
	messagingSenderId: "187111141625",
	appId: "1:187111141625:web:e1a3415835c764e208b228"
};
var app = null;
var getFirebaseApp = () => {
	if (app) return app;
	app = getApps().length ? getApp() : initializeApp(firebaseConfig);
	return app;
};
var getDb = () => {
	const app = getFirebaseApp();
	return getFirestore(app, "default");
};
var getFns = () => getFunctions(getFirebaseApp(), "us-central1");
/** Maps backend errors to calm, non-technical messages. Never leak raw errors. */
var AUTH_MESSAGES = {
	"auth/invalid-email": "That email address doesn't look right.",
	"auth/user-not-found": "We couldn't find an account with those details.",
	"auth/wrong-password": "That email or password isn't correct.",
	"auth/invalid-credential": "That email or password isn't correct.",
	"auth/email-already-in-use": "An account already exists with that email.",
	"auth/weak-password": "Please choose a password with at least 6 characters.",
	"auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
	"auth/network-request-failed": "You appear to be offline. Please check your connection.",
	"auth/requires-recent-login": "Please sign in again to continue."
};
var CODE_MESSAGES = {
	"permission-denied": "You don't have access to do that.",
	unauthenticated: "Please sign in and try again.",
	"not-found": "We couldn't find that any more.",
	unavailable: "The service is busy right now. Please try again.",
	"already-exists": "That already exists.",
	"failed-precondition": "That action can't be completed right now."
};
function friendlyError(error, fallback = "Something went wrong.") {
	if (typeof error === "string") return error;
	if (error && typeof error === "object") {
		const code = String(error.code ?? "");
		if (AUTH_MESSAGES[code]) return AUTH_MESSAGES[code];
		const short = code.includes("/") ? code.split("/")[1] : code;
		if (CODE_MESSAGES[short]) return CODE_MESSAGES[short];
		const message = error.message;
		if (message && !message.includes("Firebase") && !message.includes("(")) return message;
	}
	return fallback;
}
//#endregion
export { getDb as n, getFns as r, friendlyError as t };
