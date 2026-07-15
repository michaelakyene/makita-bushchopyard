import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { MenuItemDoc, CategoryDoc } from "@/types";

export interface MenuItemView {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId: string;
  kind: "food" | "drink";
  image: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  prepTimeMinutes?: number;
}

export async function fetchMenuItems(): Promise<MenuItemView[]> {
  try {
    // Fetch categories first
    const categoriesSnap = await getDocs(collection(db, "categories"));
    const categories: CategoryDoc[] = categoriesSnap.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as CategoryDoc,
    );

    // Fetch active menu items
    const menuItemsQuery = query(
      collection(db, "menuItems"),
      where("isActive", "==", true),
    );
    const menuItemsSnap = await getDocs(menuItemsQuery);
    const menuItems: MenuItemDoc[] = menuItemsSnap.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as MenuItemDoc,
    );

    // Map to view model
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return menuItems
      .filter((item) => item.isAvailable !== false)
      .map((item) => {
        const category = categoryMap.get(item.categoryId);
        // Use basePrice or price, whichever is available
        const price = item.price || item.basePrice || 0;
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          price: price,
          category: category?.name || "Uncategorized",
          categoryId: item.categoryId,
          kind: category?.kind || "food",
          image: item.imageUrl || "/menu/placeholder.jpg",
          isAvailable: item.isAvailable !== false,
          isFeatured: item.isFeatured || false,
          isSpicy: item.isSpicy || false,
          isVegetarian: item.isVegetarian || false,
          prepTimeMinutes: item.prepTimeMinutes || 15,
        };
      });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }
}

export async function fetchFeaturedItems(): Promise<MenuItemView[]> {
  const allItems = await fetchMenuItems();
  return allItems.filter((item) => item.isFeatured);
}

export async function fetchItemsByCategory(
  kind: "food" | "drink",
): Promise<MenuItemView[]> {
  const allItems = await fetchMenuItems();
  return allItems.filter((item) => item.kind === kind);
}
