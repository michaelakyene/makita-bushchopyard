import { Timestamp } from "firebase/firestore";

// ============ USER ============
export type UserRole = "customer" | "staff" | "admin";

export interface UserDoc {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============ CATEGORIES ============
export interface CategoryDoc {
  id: string;
  name: string; // e.g. "Bush Meat", "Soups", "Drinks"
  kind: "food" | "drink"; // NEW: for grouping in the UI
  sortOrder: number;
  isActive: boolean;
}

// ============ MENU ITEMS ============
export interface MenuItemDoc {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  basePrice: number; // in GHS
  price: number; // alias for basePrice for convenience
  imageUrl: string;
  isAvailable: boolean;
  isActive: boolean; // NEW: for soft delete
  modifierGroupIds: string[];
  // NEW: display metadata for the shop UI
  isFeatured?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  prepTimeMinutes?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============ MODIFIERS ============
export interface ModifierOptionDoc {
  id: string;
  name: string; // e.g. "Extra fish"
  priceDelta: number; // added/subtracted from base item price
}

export interface ModifierGroupDoc {
  id: string;
  name: string; // e.g. "Add-ons", "Size"
  selectionType: "single" | "multiple";
  options: ModifierOptionDoc[];
  isActive: boolean;
}

// ============ ORDERS ============
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export interface OrderLineItem {
  menuItemId: string;
  name: string;
  price: number; // snapshot at order time
  quantity: number;
  modifierChoices?: {
    modifierGroupId: string;
    optionId: string;
    name: string;
    priceDelta: number;
  }[];
}

export interface OrderDoc {
  id: string;
  userId: string;
  items: OrderLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: "card" | "mobile" | "cash";
  deliveryMethod: "dine-in" | "takeaway" | "delivery";
  customerName: string;
  customerPhone?: string;
  deliveryAddress?: string;
  specialInstructions?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============ CART (client-side only) ============
export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  modifierChoices?: {
    modifierGroupId: string;
    optionId: string;
    name: string;
    priceDelta: number;
  }[];
}

export interface StaffDoc {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  role: "admin" | "manager" | "chef" | "delivery" | "staff";
  isActive: boolean;
  orderCount: number;
  lastOrderAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WhatsAppLogDoc {
  id: string;
  orderId: string;
  staffId: string;
  message: string;
  status: "pending" | "sent" | "delivered" | "failed";
  sentAt: Timestamp;
  deliveredAt?: Timestamp;
  errorMessage?: string;
  fallbackUsed?: boolean;
}
