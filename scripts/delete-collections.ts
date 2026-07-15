import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Missing Firebase Admin environment variables!");
  process.exit(1);
}

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
  console.log("✅ Firebase Admin initialized");
}

const db = getFirestore();

async function deleteCollection(
  collectionPath: string,
  batchSize: number = 100,
) {
  console.log(`🗑️ Deleting ${collectionPath}...`);

  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.limit(batchSize).get();

  if (snapshot.empty) {
    console.log(`  ✅ ${collectionPath} is already empty`);
    return;
  }

  // Delete documents in batches
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recursively delete remaining documents
  await deleteCollection(collectionPath, batchSize);
}

async function deleteAllData() {
  console.log(
    "⚠️  WARNING: This will delete ALL data from the following collections:",
  );
  console.log("   - categories");
  console.log("   - menuItems");
  console.log("   - modifierGroups");
  console.log("");
  console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...");

  await new Promise((resolve) => setTimeout(resolve, 5000));

  try {
    await deleteCollection("categories");
    await deleteCollection("menuItems");
    await deleteCollection("modifierGroups");

    console.log("✅ All collections deleted successfully!");
  } catch (error) {
    console.error("❌ Error deleting collections:", error);
    process.exit(1);
  }
}

deleteAllData();
