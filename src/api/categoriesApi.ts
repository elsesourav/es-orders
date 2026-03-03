import { supabase } from "../lib/supabaseClient";
import { getVisibleRows, mapLegacyVisibilityRows } from "./_visibility";
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

function toCategoryShape(row) {
  return {
    ...row,
    categorySku: row?.categorySku || "",
  };
}

export async function createCategory({
  categorySku,
  label,
  status = "shared",
  vertical_id,
}) {
  const userId = requireUserId();
  const now = getNowIso();

  const { data, error } = await supabase
    .from("categories")
    .insert([
      {
        categorySku,
        label: label || null,
        status,
        vertical_id,
        created_by: userId,
        created_at: now,
        updated_at: now,
      },
    ])
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return toCategoryShape(mapLegacyVisibilityRows([data], "created_by")[0]);
}

export async function updateCategory(id, updates) {
  const userId = requireUserId();
  const patch = {
    ...updates,
    updated_at: getNowIso(),
  };

  const { data, error } = await supabase
    .from("categories")
    .update(patch)
    .eq("id", id)
    .eq("created_by", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return toCategoryShape(mapLegacyVisibilityRows([data], "created_by")[0]);
}

export async function deleteCategory(id) {
  const userId = requireUserId();
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("created_by", userId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function getAllCategories() {
  const rows = await getVisibleRows({
    table: "categories",
    ownerColumn: "created_by",
    currentUserId: getUserId(),
    orderBy: "created_at",
    ascending: false,
  });

  return mapLegacyVisibilityRows(rows, "created_by").map(toCategoryShape);
}

export async function getCategoryById(id) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data
    ? toCategoryShape(mapLegacyVisibilityRows([data], "created_by")[0])
    : null;
}

export async function getVerticalCategories(verticalId) {
  const rows = await getVisibleRows({
    table: "categories",
    ownerColumn: "created_by",
    currentUserId: getUserId(),
    orderBy: "created_at",
    ascending: false,
    extraEq: { vertical_id: verticalId },
  });

  return mapLegacyVisibilityRows(rows, "created_by").map(toCategoryShape);
}

export async function getCategoryBaseItems(categoryId) {
  const rows = await getVisibleRows({
    table: "base_items",
    ownerColumn: "created_by",
    currentUserId: getUserId(),
    orderBy: "created_at",
    ascending: false,
    extraEq: { category_id: categoryId },
  });

  return mapLegacyVisibilityRows(rows, "created_by");
}

export async function getCategoryProducts(categoryId) {
  const rows = await getCategoryBaseItems(categoryId);
  return (rows || []).map((item) => ({
    ...item,
    item_sku: normalizeItemSku(item.item_sku),
    name: item.name || item.item_name,
    sku: item.sku || item.item_sku,
  }));
}
