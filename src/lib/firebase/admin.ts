import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Server-only. Never import this file from a Client Component.
// Requires FIREBASE_ADMIN_* env vars from a service account JSON.
function getAdminApp(): App {
  if (getApps().length) return getApps()[0]!;

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

export const adminApp = getAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

/**
 * Verifies a session/ID token from the client and returns the decoded claims,
 * including the custom `role` claim used for role-protected routes.
 */
export async function verifySessionToken(idToken: string) {
  return adminAuth.verifyIdToken(idToken);
}
