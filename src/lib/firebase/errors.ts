/** Maps backend errors to calm, non-technical messages. Never leak raw errors. */

const AUTH_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/user-not-found": "We couldn't find an account with those details.",
  "auth/wrong-password": "That email or password isn't correct.",
  "auth/invalid-credential": "That email or password isn't correct.",
  "auth/email-already-in-use": "An account already exists with that email.",
  "auth/weak-password": "Please choose a password with at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "You appear to be offline. Please check your connection.",
  "auth/requires-recent-login": "Please sign in again to continue.",
};

const CODE_MESSAGES: Record<string, string> = {
  "permission-denied": "You don't have access to do that.",
  unauthenticated: "Please sign in and try again.",
  "not-found": "We couldn't find that any more.",
  unavailable: "The service is busy right now. Please try again.",
  "already-exists": "That already exists.",
  "failed-precondition": "That action can't be completed right now.",
};

export function friendlyError(error: unknown, fallback = "Something went wrong."): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const code = String((error as { code?: string }).code ?? "");
    if (AUTH_MESSAGES[code]) return AUTH_MESSAGES[code]!;
    const short = code.includes("/") ? code.split("/")[1]! : code;
    if (CODE_MESSAGES[short]) return CODE_MESSAGES[short]!;
    const message = (error as { message?: string }).message;
    // Only surface messages we raised ourselves (plain sentences, no codes).
    if (message && !message.includes("Firebase") && !message.includes("(")) return message;
  }
  return fallback;
}
