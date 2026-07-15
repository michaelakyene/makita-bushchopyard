// scripts/create-admin.ts
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

async function createDefaultAdmin() {
  const auth = getAuth();
  const db = getFirestore();

  console.log("🔍 Checking for existing admin...");

  try {
    // Check if any admin exists
    const adminCheck = await db
      .collection("users")
      .where("role", "==", "admin")
      .limit(1)
      .get();

    const existingAdmin = adminCheck.docs[0];

    if (existingAdmin) {
      const adminData = existingAdmin.data();
      console.log("✅ Admin already exists.");
      console.log(`   👤 Email: ${adminData.email}`);
      console.log(`   📅 Created: ${adminData.createdAt?.toDate?.() || "N/A"}`);
      console.log("\n⚠️  To reset admin password, run:");
      console.log("   firebase auth:update <uid> --password NewPassword123");
      return;
    }

    console.log("📝 Creating default admin account...");

    // Create the admin user in Firebase Auth
    const user = await auth.createUser({
      email: "admin@makita.com",
      password: "Admin@123456",
      displayName: "Makita Admin",
    });

    // Create the user document in Firestore
    await db.collection("users").doc(user.uid).set({
      uid: user.uid,
      email: "admin@makita.com",
      displayName: "Makita Admin",
      role: "admin",
      isDefaultAdmin: true,
      passwordChanged: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("\n✅ Default admin created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email: admin@makita.com");
    console.log("🔑 Password: Admin@123456");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  IMPORTANT SECURITY NOTICE:");
    console.log("   You MUST change this password immediately");
    console.log("   You will be prompted to change it on first login");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (error: any) {
    console.error("❌ Failed to create admin:", error.message);
    if (error.code === "auth/email-already-exists") {
      console.log("   An account with admin@makita.com already exists.");
      console.log("   Try logging in with that email first.");
    }
    process.exit(1);
  }
}

createDefaultAdmin();
