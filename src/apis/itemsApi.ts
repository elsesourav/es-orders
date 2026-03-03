import type { ApiUpdate, VisibilityStatus } from "@/types/api";
import { supabase } from "@lib/supabaseClient";
import {
  getSharedOwnerIds,
  getVisibleRows,
  mapLegacyVisibilityRows,
} from "./_visibility";
import { getUserId } from "./usersApi";

function requireUserId() {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

function getNowIso() {
  return new Date().toISOString();
}

function normalizeItemSku(value: string) {
  return value.trim().toUpperCase();
}

async function assertBaseItemLink(
  userId: string,
  categoryId: string,
  itemSku: string,
) {
  const normalizedItemSku = normalizeItemSku(itemSku);
  const { data, error } = await supabase
    .from("base_items")
    .select("id, created_by, status")
    .eq("category_id", categoryId)
    .eq("item_sku", normalizedItemSku);

  if (error) throw new Error(error.message);
  if (!data?.length) {
    throw new Error(
      `Base item SKU ${normalizedItemSku} is not found for the selected category`,
    );
  }

  const sharedOwnerIds = await getSharedOwnerIds(userId);
  const visible = data.some(
    (row) =>
      row.status === "public" ||
      row.created_by === userId ||
      (row.status === "shared" && sharedOwnerIds.includes(row.created_by)),
  );

  if (!visible) {
    throw new Error(
      `Base item SKU ${normalizedItemSku} is not visible for your account`,
    );
  }
}

export async function createItem(input: {
  name: string;
  label?: string;
  status?: VisibilityStatus;
  vertical_id?: string | null;
  category_id?: string | null;
  price?: number | null;
  quantity_per_kg?: number | null;
  self_life?: number | null;
  item_sku: string;
  increment_per_rupee?: number | null;
}) {
  const userId = requireUserId();
  if (!input.category_id) {
    throw new Error("Category is required to create an item");
  }
  if (!input.item_sku?.trim()) {
    throw new Error("Item SKU is required");
  }
  await assertBaseItemLink(userId, input.category_id, input.item_sku);

  const now = getNowIso();
  const { data, error } = await supabase
    .from("items")
    .insert([
      {
        name: input.name,
        label: input.label || null,
        status: input.status || "shared",
        vertical_id: input.vertical_id || null,
        category_id: input.category_id || null,
        price: input.price ?? null,
        quantity_per_kg: input.quantity_per_kg ?? null,
        self_life: input.self_life ?? null,
        item_sku: normalizeItemSku(input.item_sku),
        increment_per_rupee: input.increment_per_rupee ?? null,
        created_by: userId,
        created_at: now,
        updated_at: now,
      },
    ])
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows([data], "created_by")[0];
}

export async function updateItem(id: string, updates: ApiUpdate) {
  const userId = requireUserId();

  const { data: existingItem, error: existingItemError } = await supabase
    .from("items")
    .select("id, category_id, item_sku")
    .eq("id", id)
    .eq("created_by", userId)
    .single();

  if (existingItemError) {
    throw new Error(existingItemError.message);
  }

  const patch = { ...updates } as ApiUpdate;
  if (typeof patch.item_sku === "string") {
    patch.item_sku = normalizeItemSku(patch.item_sku as string);
  }

  const nextCategoryId =
    typeof patch.category_id === "undefined"
      ? existingItem.category_id
      : (patch.category_id as string | null);
  const nextItemSku =
    typeof patch.item_sku === "undefined"
      ? existingItem.item_sku
      : (patch.item_sku as string | null);

  if (nextItemSku && !nextCategoryId) {
    throw new Error("Category is required when item SKU is set");
  }

  if (nextCategoryId && nextItemSku) {
    await assertBaseItemLink(userId, nextCategoryId, nextItemSku);
  }

  patch.updated_at = getNowIso();

  const { data, error } = await supabase
    .from("items")
    .update(patch)
    .eq("id", id)
    .eq("created_by", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows([data], "created_by")[0];
}

export async function deleteItem(id: string) {
  const userId = requireUserId();
  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", id)
    .eq("created_by", userId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function listItems() {
  const rows = await getVisibleRows({
    table: "items",
    ownerColumn: "created_by",
    currentUserId: getUserId(),
    orderBy: "created_at",
    ascending: false,
  });
  return mapLegacyVisibilityRows(rows, "created_by");
}

export async function getItemBySku(item_sku: string) {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("item_sku", normalizeItemSku(item_sku))
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapLegacyVisibilityRows([data], "created_by")[0] : null;
}

export async function getItemsBySkus(item_skus: string[]) {
  if (!Array.isArray(item_skus) || !item_skus.length) return [];

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .in(
      "item_sku",
      item_skus.map((value) => normalizeItemSku(value)).filter(Boolean),
    );

  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows(data || [], "created_by");
}

export async function getItemsByIds(itemIds: string[]) {
  if (!Array.isArray(itemIds) || !itemIds.length) return [];

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .in("id", itemIds.map((value) => String(value).trim()).filter(Boolean));

  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows(data || [], "created_by");
}
