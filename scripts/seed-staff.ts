// scripts/seed-staff.ts
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

async function seedStaff() {
  console.log("🌱 Seeding staff accounts...");

  const staffData = [
    {
      email: "staff1@makita.com",
      displayName: "Staff One",
      role: "staff",
    },
    {
      email: "staff2@makita.com",
      displayName: "Staff Two",
      role: "staff",
    },
  ];

  // Note: You'd also need to create Auth users for these
  // This just seeds Firestore docs
  for (const staff of staffData) {
    try {
      // Check if exists
      const snapshot = await db
        .collection("users")
        .where("email", "==", staff.email)
        .get();

      if (snapshot.empty) {
        // Create placeholder - you'd need to create Auth user first
        console.log(`⚠️  User ${staff.email} doesn't exist in Auth.`);
        console.log("   Run: npm run create-user");
      } else {
        // Update role
        const doc = snapshot.docs[0];
        await doc.ref.update({ role: staff.role });
        console.log(`✅ Updated ${staff.email} to ${staff.role}`);
      }
    } catch (error) {
      console.error(`Error with ${staff.email}:`, error);
    }
  }
}

seedStaff();
