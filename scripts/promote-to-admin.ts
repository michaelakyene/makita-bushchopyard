// scripts/promote-to-admin.ts
import { initializeApp, cert, getApps } from "firebase-admin/app";
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

async function promoteToAdmin() {
  const db = getFirestore();
  const email = process.argv[2];

  if (!email) {
    console.error(
      "❌ Please provide an email: npm run promote-to-admin your@email.com",
    );
    console.log("\n📋 Usage: npm run promote-to-admin user@example.com");
    process.exit(1);
  }

  try {
    // Find user by email
    const usersRef = db.collection("users");
    const userQuery = await usersRef.where("email", "==", email).get();

    if (userQuery.empty) {
      console.error(`❌ No user found with email: ${email}`);
      console.log("\n📋 Available users:");
      const allUsers = await usersRef.get();
      if (allUsers.empty) {
        console.log("   No users found in Firestore.");
        console.log("   Try running: npm run create-admin");
      } else {
        allUsers.forEach((doc) => {
          const data = doc.data();
          console.log(`   - ${data.email} (role: ${data.role || "no role"})`);
        });
      }
      process.exit(1);
    }

    // ✅ Get the document reference
    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // Update the user's role
    await userDoc.ref.update({
      role: "admin",
      updatedAt: new Date(),
    });

    console.log(`\n✅ ${email} has been promoted to admin!`);
    console.log(`   👤 Name: ${userData.displayName || "N/A"}`);
    console.log(`   📧 Email: ${userData.email}`);
    console.log(`   🆔 Document ID: ${userDoc.id}`);
    console.log(`   🔑 Role: ${userData.role || "no role"} → admin`);
    console.log(
      "\n🔄 Please log out and log back in for changes to take effect.",
    );
  } catch (error) {
    console.error("❌ Error promoting user:", error);
    process.exit(1);
  }
}

promoteToAdmin();
