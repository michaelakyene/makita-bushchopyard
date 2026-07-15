import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Check if we have the required env vars
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Missing Firebase Admin environment variables!");
  console.error("Make sure these are set in .env.local:");
  console.error("  - FIREBASE_ADMIN_PROJECT_ID");
  console.error("  - FIREBASE_ADMIN_CLIENT_EMAIL");
  console.error("  - FIREBASE_ADMIN_PRIVATE_KEY");
  process.exit(1);
}

// Initialize Firebase Admin
try {
  // Only initialize if not already initialized
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
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin:", error);
  process.exit(1);
}

const db = getFirestore();

// Categories
const categories = [
  {
    id: "soups-stews",
    name: "Soups & Stews",
    kind: "food" as const,
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "rice-swallow",
    name: "Rice & Swallow",
    kind: "food" as const,
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "bush-meat",
    name: "Bush Meat",
    kind: "food" as const,
    displayOrder: 3,
    isActive: true,
  },
  {
    id: "drinks",
    name: "Drinks",
    kind: "drink" as const,
    displayOrder: 4,
    isActive: true,
  },
];

// Menu Items
const menuItems = [
  // Soups & Stews
  {
    name: "Palava Sauce",
    description:
      "Traditional Ghanaian palm nut stew with smoked fish and spinach",
    price: 35.0,
    categoryId: "soups-stews",
    imageUrl: "/menu/Palava.jpg",
    isActive: true,
    isAvailable: true,
    isFeatured: true,
    isSpicy: false,
    isVegetarian: false,
    prepTimeMinutes: 25,
  },
  {
    name: "Palava Mixed",
    description: "Rich palm nut stew with assorted meats and seafood",
    price: 45.0,
    categoryId: "soups-stews",
    imageUrl: "/menu/palavamixed.jpg",
    isActive: true,
    isAvailable: true,
    isFeatured: true,
    isSpicy: false,
    isVegetarian: false,
    prepTimeMinutes: 30,
  },
  {
    name: "Yam Stew",
    description: "Hearty yam stew with tender beef and aromatic spices",
    price: 38.0,
    categoryId: "soups-stews",
    imageUrl: "/menu/yamstew.jpg",
    isActive: true,
    isAvailable: true,
    isFeatured: false,
    isSpicy: true,
    isVegetarian: false,
    prepTimeMinutes: 35,
  },

  // Rice & Swallow
  {
    name: "Jollof Rice",
    description: "Classic Ghanaian jollof rice with chicken and vegetables",
    price: 42.0,
    categoryId: "rice-swallow",
    imageUrl: "/menu/jollof.jpg",
    isActive: true,
    isAvailable: true,
    isFeatured: true,
    isSpicy: true,
    isVegetarian: false,
    prepTimeMinutes: 20,
  },
  {
    name: "Fried Rice",
    description:
      "Savory fried rice with mixed vegetables and choice of protein",
    price: 40.0,
    categoryId: "rice-swallow",
    imageUrl: "/menu/friedrice.jpg",
    isActive: true,
    isAvailable: true,
    isFeatured: false,
    isSpicy: false,
    isVegetarian: true,
    prepTimeMinutes: 15,
  },
  {
    name: "Plain Rice",
    description: "Steamed white rice served with your choice of stew",
    price: 25.0,
    categoryId: "rice-swallow",
    imageUrl: "/menu/plain-rice.jpg",
    isActive: true,
    isAvailable: true,
    isFeatured: false,
    isSpicy: false,
    isVegetarian: true,
    prepTimeMinutes: 15,
  },
  {
    name: "Banku",
    description: "Fermented corn and cassava dough, served with soup or stew",
    price: 30.0,
    categoryId: "rice-swallow",
    imageUrl: "/menu/banku.jpg",
    isActive: true,
    isAvailable: true,
    isFeatured: false,
    isSpicy: false,
    isVegetarian: true,
    prepTimeMinutes: 10,
  },
  {
    name: "Fufu",
    description: "Pounded cassava and plantain, served with soup or stew",
    price: 32.0,
    categoryId: "rice-swallow",
    imageUrl: "/menu/fufu.jpg",
    isActive: true,
    isAvailable: true,
    isFeatured: false,
    isSpicy: false,
    isVegetarian: true,
    prepTimeMinutes: 10,
  },
  {
    name: "Rice Ball",
    description: "Rice balls served with groundnut soup",
    price: 28.0,
    categoryId: "rice-swallow",
    imageUrl: "/menu/riceball.webp",
    isActive: true,
    isAvailable: true,
    isFeatured: false,
    isSpicy: false,
    isVegetarian: true,
    prepTimeMinutes: 12,
  },

  // Bush Meat
  {
    name: "Goat Meat",
    description: "Tender goat meat stew with traditional Ghanaian spices",
    price: 48.0,
    categoryId: "bush-meat",
    imageUrl: "/menu/goat.jpg",
    isActive: true,
    isAvailable: true,
    isFeatured: true,
    isSpicy: true,
    isVegetarian: false,
    prepTimeMinutes: 40,
  },
  {
    name: "Tripe",
    description: "Traditional tripe stew with aromatic herbs and spices",
    price: 42.0,
    categoryId: "bush-meat",
    imageUrl: "/menu/tripe.jpg",
    isActive: true,
    isAvailable: true,
    isFeatured: false,
    isSpicy: true,
    isVegetarian: false,
    prepTimeMinutes: 45,
  },
  {
    name: "Pork",
    description: "Succulent pork stew with traditional Ghanaian seasoning",
    price: 44.0,
    categoryId: "bush-meat",
    imageUrl: "/menu/pork.jpg",
    isActive: true,
    isAvailable: true,
    isFeatured: false,
    isSpicy: false,
    isVegetarian: false,
    prepTimeMinutes: 35,
  },
  {
    name: "Wings",
    description: "Spicy grilled chicken wings with special bush sauce",
    price: 38.0,
    categoryId: "bush-meat",
    imageUrl: "/menu/wings.jpg",
    isActive: true,
    isAvailable: true,
    isFeatured: false,
    isSpicy: true,
    isVegetarian: false,
    prepTimeMinutes: 25,
  },

  // Drinks
  {
    name: "Coke",
    description: "Classic Coca-Cola, served chilled",
    price: 8.0,
    categoryId: "drinks",
    imageUrl: "/menu/coke.jpg",
    isActive: true,
    isAvailable: true,
    isFeatured: false,
    isSpicy: false,
    isVegetarian: true,
    prepTimeMinutes: 2,
  },
  {
    name: "Fanta",
    description: "Orange Fanta, served chilled",
    price: 8.0,
    categoryId: "drinks",
    imageUrl: "/menu/fanta.jpg",
    isActive: true,
    isAvailable: true,
    isFeatured: false,
    isSpicy: false,
    isVegetarian: true,
    prepTimeMinutes: 2,
  },
  {
    name: "Club Beer",
    description: "Ghana's favorite lager beer, served chilled",
    price: 12.0,
    categoryId: "drinks",
    imageUrl: "/menu/club.jpg",
    isActive: true,
    isAvailable: true,
    isFeatured: false,
    isSpicy: false,
    isVegetarian: true,
    prepTimeMinutes: 2,
  },
  {
    name: "Heineken",
    description: "Premium Dutch lager, served chilled",
    price: 14.0,
    categoryId: "drinks",
    imageUrl: "/menu/heineken.jpg",
    isActive: true,
    isAvailable: true,
    isFeatured: false,
    isSpicy: false,
    isVegetarian: true,
    prepTimeMinutes: 2,
  },
  {
    name: "Gulder",
    description: "Rich Nigerian lager beer, served chilled",
    price: 12.0,
    categoryId: "drinks",
    imageUrl: "/menu/gulder.webp",
    isActive: true,
    isAvailable: true,
    isFeatured: false,
    isSpicy: false,
    isVegetarian: true,
    prepTimeMinutes: 2,
  },
];

async function seed() {
  console.log("🌱 Seeding database...");

  // Check if data already exists
  const existingCategories = await db.collection("categories").limit(1).get();
  if (!existingCategories.empty) {
    console.log(
      "⚠️  Database already has categories. Skipping seed to avoid duplicates.",
    );
    console.log(
      "   If you want to re-seed, delete the data from Firebase Console first.",
    );
    process.exit(0);
  }

  // Add categories
  console.log("📁 Adding categories...");
  for (const category of categories) {
    await db.collection("categories").doc(category.id).set(category);
    console.log(`  ✅ ${category.name}`);
  }

  // Add menu items
  console.log("🍽️ Adding menu items...");
  for (const item of menuItems) {
    const docRef = db.collection("menuItems").doc();
    await docRef.set(item);
    console.log(`  ✅ ${item.name}`);
  }

  console.log("✅ Seeding complete!");
  console.log(`   📊 Added ${categories.length} categories`);
  console.log(`   🍽️ Added ${menuItems.length} menu items`);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
