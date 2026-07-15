// scripts/reset-admin.ts
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Missing Firebase Admin credentials in .env.local");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

async function resetAdmin() {
  const auth = getAuth();
  const db = getFirestore();

  console.log("🔍 Looking for admin account...");

  try {
    // Check if admin exists in Firestore
    const adminQuery = await db
      .collection("users")
      .where("email", "==", "admin@makita.com")
      .limit(1)
      .get();

    if (adminQuery.empty) {
      console.error("❌ No admin account found in Firestore.");
      console.log("   Run: npm run create-admin");
      process.exit(1);
    }

    // ✅ Get the document reference and data
    const adminDoc = adminQuery.docs[0];
    const adminData = adminDoc.data();
    const uid = adminData.uid;

    console.log(`✅ Found admin in Firestore: ${adminData.email}`);
    console.log(`   UID: ${uid}`);

    // Try to find the user in Auth
    try {
      const userRecord = await auth.getUser(uid);
      console.log(`✅ User exists in Auth: ${userRecord.email}`);

      // Reset password
      const newPassword = "Admin@123456";
      await auth.updateUser(uid, {
        password: newPassword,
      });

      console.log(`\n✅ Password reset successfully!`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📧 Email: admin@makita.com");
      console.log(`🔑 New Password: ${newPassword}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // ✅ Update Firestore using the document reference
      await adminDoc.ref.update({
        isDefaultAdmin: true,
        passwordChanged: false,
        updatedAt: new Date(),
      });

      console.log(
        "✅ Firestore updated to require password change on next login.",
      );
    } catch (authError: any) {
      if (authError.code === "auth/user-not-found") {
        console.log(`⚠️  User ${adminData.email} not found in Auth.`);
        console.log("📝 Recreating the user...");

        // Recreate the user
        const user = await auth.createUser({
          uid: uid,
          email: "admin@makita.com",
          password: "Admin@123456",
          displayName: "Makita Admin",
        });

        console.log(`✅ User recreated: ${user.email}`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📧 Email: admin@makita.com");
        console.log("🔑 Password: Admin@123456");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      } else {
        console.error("❌ Auth error:", authError.message);
        process.exit(1);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

resetAdmin();
