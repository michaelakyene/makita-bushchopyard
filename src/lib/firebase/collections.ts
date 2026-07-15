import {
  collection,
  type CollectionReference,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
} from "firebase/firestore";
import { db } from "./client";
import type {
  UserDoc,
  CategoryDoc,
  MenuItemDoc,
  ModifierGroupDoc,
  OrderDoc,
} from "@/types";

// Generic converter: Firestore stores plain objects, this keeps reads/writes typed.
function converter<T extends DocumentData>(): FirestoreDataConverter<T> {
  return {
    toFirestore: (data: T) => data,
    fromFirestore: (snap: QueryDocumentSnapshot, options: SnapshotOptions) =>
      snap.data(options) as T,
  };
}

function typedCollection<T extends DocumentData>(path: string): CollectionReference<T> {
  return collection(db, path).withConverter(converter<T>());
}

// Collection root names — the single source of truth for Firestore paths.
export const usersCol = () => typedCollection<UserDoc>("users");
export const categoriesCol = () => typedCollection<CategoryDoc>("categories");
export const menuItemsCol = () => typedCollection<MenuItemDoc>("menuItems");
export const modifierGroupsCol = () => typedCollection<ModifierGroupDoc>("modifierGroups");
export const ordersCol = () => typedCollection<OrderDoc>("orders");
