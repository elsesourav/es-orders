import { supabase } from "../lib/supabaseClient";
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

function normalizeItemSku(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

async function assertBaseItemLink(userId, categoryId, itemSku) {
  const normalizedSku = normalizeItemSku(itemSku);
  const { data, error } = await supabase
    .from("base_items")
    .select("id, created_by, status")
    .eq("category_id", categoryId)
    .eq("item_sku", normalizedSku);

  if (error) throw new Error(error.message);
  if (!data?.length) {
    throw new Error(
      `Base item SKU ${normalizedSku} is not found for the selected category`,
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
      `Base item SKU ${normalizedSku} is not visible for your account`,
    );
  }
}

export async function createItem({
  name,
  label,
  status = "shared",
  vertical_id,
  category_id,
  price,
  quantity_per_kg,
  self_life,
  item_sku,
  increment_per_rupee,
}) {
  const userId = requireUserId();
  if (!category_id) throw new Error("Category is required to create an item");
  if (!String(item_sku || "").trim()) throw new Error("Item SKU is required");

  await assertBaseItemLink(userId, category_id, item_sku);
  const now = getNowIso();

  const { data, error } = await supabase
    .from("items")
    .insert([
      {
        name,
        label: label || null,
        status,
        vertical_id: vertical_id || null,
        category_id: category_id || null,
        price: price ?? null,
        quantity_per_kg: quantity_per_kg ?? null,
        self_life: self_life ?? null,
        item_sku: normalizeItemSku(item_sku),
        increment_per_rupee: increment_per_rupee ?? null,
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

export async function updateItem(id, updates) {
  const userId = requireUserId();

  const { data: existingItem, error: existingError } = await supabase
    .from("items")
    .select("id, category_id, item_sku")
    .eq("id", id)
    .eq("created_by", userId)
    .single();

  if (existingError) throw new Error(existingError.message);

  const patch = { ...updates };
  if (typeof patch.item_sku === "string") {
    patch.item_sku = normalizeItemSku(patch.item_sku);
  }

  const nextCategoryId =
    typeof patch.category_id === "undefined"
      ? existingItem.category_id
      : patch.category_id;
  const nextItemSku =
    typeof patch.item_sku === "undefined"
      ? existingItem.item_sku
      : patch.item_sku;

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

export async function deleteItem(id) {
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

export async function getItemBySku(item_sku) {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("item_sku", normalizeItemSku(item_sku))
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapLegacyVisibilityRows([data], "created_by")[0] : null;
}

export async function getItemsBySkus(item_skus) {
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

export async function getItemsByIds(itemIds) {
  if (!Array.isArray(itemIds) || !itemIds.length) return [];

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .in("id", itemIds.map((value) => String(value).trim()).filter(Boolean));

  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows(data || [], "created_by");
}
