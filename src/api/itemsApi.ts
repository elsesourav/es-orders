import { supabase } from "../lib/supabaseClient";
import {
  assertOwnedRowById,
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
  const normalizedItemSku = normalizeItemSku(itemSku);

  const { data, error } = await supabase
    .from("base_items")
    .select("id")
    .eq("created_by", userId)
    .eq("category_id", categoryId)
    .eq("item_sku", normalizedItemSku)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!data) {
    throw new Error(
      `Base item SKU ${normalizedItemSku} is not found in your category base items`,
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

  if (!category_id) {
    throw new Error("Category is required to create an item");
  }

  if (!String(item_sku || "").trim()) {
    throw new Error("Item SKU is required");
  }

  const category = (await assertOwnedRowById({
    table: "categories",
    ownerColumn: "created_by",
    currentUserId: userId,
    id: category_id,
    label: "Category",
  })) as any;

  const categoryVerticalId = category?.vertical_id || null;

  if (vertical_id) {
    await assertOwnedRowById({
      table: "verticals",
      ownerColumn: "created_by",
      currentUserId: userId,
      id: vertical_id,
      label: "Vertical",
    });
  }

  if (vertical_id && categoryVerticalId && vertical_id !== categoryVerticalId) {
    throw new Error("Selected category does not belong to selected vertical");
  }

  const resolvedVerticalId = vertical_id || categoryVerticalId || null;

  await assertBaseItemLink(userId, category_id, item_sku);

  const now = getNowIso();

  const { data, error } = await supabase
    .from("items")
    .insert([
      {
        name,
        label: label || null,
        status,
        vertical_id: resolvedVerticalId,
        category_id,
        price: price ?? null,
        quantity_per_kg: quantity_per_kg ?? null,
        self_life: self_life ?? null,
        item_sku: normalizeItemSku(item_sku),
        increment_per_rupee: increment_per_rupee ?? null,
        created_by: userId,
        created_at: now,
        updated_at: now,
        updated_by: userId,
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
    .select("id, category_id, vertical_id, item_sku")
    .eq("id", id)
    .is("deleted_at", null)
    .eq("created_by", userId)
    .single();

  if (existingError) throw new Error(existingError.message);

  const patch: Record<string, unknown> = { ...updates };

  if (typeof patch.item_sku === "string") {
    patch.item_sku = normalizeItemSku(patch.item_sku);
  }

  const nextCategoryId =
    typeof patch.category_id === "undefined"
      ? existingItem.category_id
      : patch.category_id;

  let nextVerticalId =
    typeof patch.vertical_id === "undefined"
      ? existingItem.vertical_id
      : patch.vertical_id;

  const nextItemSku =
    typeof patch.item_sku === "undefined"
      ? existingItem.item_sku
      : patch.item_sku;

  if (nextItemSku && !nextCategoryId) {
    throw new Error("Category is required when item SKU is set");
  }

  let categoryVerticalId = null;
  if (nextCategoryId) {
    const category = (await assertOwnedRowById({
      table: "categories",
      ownerColumn: "created_by",
      currentUserId: userId,
      id: nextCategoryId,
      label: "Category",
    })) as any;

    categoryVerticalId = category?.vertical_id || null;
  }

  if (nextVerticalId) {
    await assertOwnedRowById({
      table: "verticals",
      ownerColumn: "created_by",
      currentUserId: userId,
      id: nextVerticalId,
      label: "Vertical",
    });
  }

  if (
    nextVerticalId &&
    categoryVerticalId &&
    nextVerticalId !== categoryVerticalId
  ) {
    throw new Error("Selected category does not belong to selected vertical");
  }

  if (!nextVerticalId && categoryVerticalId) {
    nextVerticalId = categoryVerticalId;
    patch.vertical_id = categoryVerticalId;
  }

  if (nextCategoryId && nextItemSku) {
    await assertBaseItemLink(userId, nextCategoryId, nextItemSku);
  }

  patch.updated_at = getNowIso();
  patch.updated_by = userId;

  const { data, error } = await supabase
    .from("items")
    .update(patch)
    .eq("id", id)
    .is("deleted_at", null)
    .eq("created_by", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows([data], "created_by")[0];
}

export async function deleteItem(id) {
  const userId = requireUserId();
  const now = getNowIso();

  const { error } = await supabase
    .from("items")
    .update({ deleted_at: now, updated_at: now, updated_by: userId })
    .eq("id", id)
    .is("deleted_at", null)
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

export async function getItemBySku(item_sku, categoryId) {
  const normalizedSku = normalizeItemSku(item_sku);

  if (categoryId) {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("category_id", categoryId)
      .eq("item_sku", normalizedSku)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapLegacyVisibilityRows([data], "created_by")[0] : null;
  }

  const rows = await getVisibleRows({
    table: "items",
    ownerColumn: "created_by",
    currentUserId: getUserId(),
    orderBy: "created_at",
    ascending: false,
    extraEq: { item_sku: normalizedSku },
  });

  const mappedRows = mapLegacyVisibilityRows(rows, "created_by");
  return mappedRows[0] || null;
}

export async function getItemsBySkus(item_skus) {
  if (!Array.isArray(item_skus) || !item_skus.length) return [];

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .is("deleted_at", null)
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
    .is("deleted_at", null)
    .in("id", itemIds.map((value) => String(value).trim()).filter(Boolean));

  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows(data || [], "created_by");
}

export async function listDeletedItems() {
  const userId = requireUserId();

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("created_by", userId)
    .not("deleted_at", "is", null)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows(data || [], "created_by");
}

export async function restoreItem(id) {
  const userId = requireUserId();
  const now = getNowIso();

  const { data, error } = await supabase
    .from("items")
    .update({ deleted_at: null, updated_at: now, updated_by: userId })
    .eq("id", id)
    .eq("created_by", userId)
    .not("deleted_at", "is", null)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows([data], "created_by")[0];
}
