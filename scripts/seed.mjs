// One-off seed script for local/dev Firestore.
// Run with: node scripts/seed.mjs
// Requires the same FIREBASE_ADMIN_* env vars as the app (load via `node --env-file=.env.local scripts/seed.mjs`
// on Node 20+, or export them in your shell first).

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey,
  }),
});

const db = getFirestore();

async function seed() {
  const categories = [
    { id: "soups", name: "Soups", sortOrder: 1, isActive: true },
    { id: "bush-meat", name: "Bush Meat", sortOrder: 2, isActive: true },
    { id: "drinks", name: "Drinks", sortOrder: 3, isActive: true },
  ];

  for (const cat of categories) {
    await db.collection("categories").doc(cat.id).set(cat);
  }

  const proteinModifier = {
    id: "protein-choice",
    name: "Choice of protein",
    required: true,
    maxSelect: 1,
    options: [
      { id: "fish", name: "Fish", priceDelta: 0 },
      { id: "goat-meat", name: "Goat meat", priceDelta: 5 },
      { id: "grasscutter", name: "Grasscutter", priceDelta: 10 },
    ],
  };
  await db.collection("modifierGroups").doc(proteinModifier.id).set(proteinModifier);

  const menuItems = [
    {
      id: "light-soup",
      categoryId: "soups",
      name: "Light Soup",
      description: "Spicy tomato-based soup, served with your choice of protein.",
      basePrice: 35,
      isAvailable: true,
      modifierGroupIds: ["protein-choice"],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    {
      id: "sobolo",
      categoryId: "drinks",
      name: "Sobolo",
      description: "Chilled hibiscus drink with ginger and pineapple.",
      basePrice: 8,
      isAvailable: true,
      modifierGroupIds: [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
  ];

  for (const item of menuItems) {
    await db.collection("menuItems").doc(item.id).set(item);
  }

  console.log("Seed complete: categories, modifierGroups, menuItems.");
}

seed().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
