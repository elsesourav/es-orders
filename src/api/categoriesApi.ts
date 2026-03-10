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

  await assertOwnedRowById({
    table: "verticals",
    ownerColumn: "created_by",
    currentUserId: userId,
    id: vertical_id,
    label: "Vertical",
  });

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
        updated_by: userId,
      },
    ])
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return toCategoryShape(mapLegacyVisibilityRows([data], "created_by")[0]);
}

export async function updateCategory(id, updates) {
  const userId = requireUserId();

  if (typeof updates.vertical_id !== "undefined" && updates.vertical_id) {
    await assertOwnedRowById({
      table: "verticals",
      ownerColumn: "created_by",
      currentUserId: userId,
      id: updates.vertical_id,
      label: "Vertical",
    });
  }

  const patch = {
    ...updates,
    updated_at: getNowIso(),
    updated_by: userId,
  };

  const { data, error } = await supabase
    .from("categories")
    .update(patch)
    .eq("id", id)
    .is("deleted_at", null)
    .eq("created_by", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return toCategoryShape(mapLegacyVisibilityRows([data], "created_by")[0]);
}

export async function deleteCategory(id) {
  const userId = requireUserId();
  const now = getNowIso();

  const { error } = await supabase
    .from("categories")
    .update({ deleted_at: now, updated_at: now, updated_by: userId })
    .eq("id", id)
    .is("deleted_at", null)
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
  const rows = await getVisibleRows({
    table: "categories",
    ownerColumn: "created_by",
    currentUserId: getUserId(),
    extraEq: { id },
  });

  const row = rows[0];
  return row
    ? toCategoryShape(mapLegacyVisibilityRows([row], "created_by")[0])
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

export async function addBaseItemToCategory({
  categoryId,
  itemName,
  itemSku,
  status = "shared",
}) {
  const userId = requireUserId();

  await assertOwnedRowById({
    table: "categories",
    ownerColumn: "created_by",
    currentUserId: userId,
    id: categoryId,
    label: "Category",
  });

  const now = getNowIso();

  const { data, error } = await supabase
    .from("base_items")
    .insert([
      {
        category_id: categoryId,
        item_name: itemName,
        item_sku: normalizeItemSku(itemSku),
        status,
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

export async function addMultipleBaseItemsToCategory(categoryId, items) {
  const userId = requireUserId();

  await assertOwnedRowById({
    table: "categories",
    ownerColumn: "created_by",
    currentUserId: userId,
    id: categoryId,
    label: "Category",
  });

  const now = getNowIso();
  if (!items.length) return { success: true, added: 0, skipped: 0, data: [] };

  const payload = items
    .filter((item) => item.itemName && item.itemSku)
    .map((item) => ({
      category_id: categoryId,
      item_name: item.itemName,
      item_sku: normalizeItemSku(item.itemSku),
      created_by: userId,
      status: "shared",
      created_at: now,
      updated_at: now,
      updated_by: userId,
    }));

  const { data, error } = await supabase
    .from("base_items")
    .insert(payload)
    .select("*");

  if (error) throw new Error(error.message);

  const mapped = mapLegacyVisibilityRows(data || [], "created_by");
  return {
    success: true,
    added: mapped.length,
    skipped: items.length - mapped.length,
    data: mapped,
  };
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

export async function getCategoryBaseItemsPaginated(
  categoryId,
  page = 1,
  pageSize = 500,
) {
  const rows = await getCategoryBaseItems(categoryId);
  const from = (page - 1) * pageSize;
  return rows.slice(from, from + pageSize);
}

export async function getCategoryBaseItemsCount(categoryId) {
  const rows = await getCategoryBaseItems(categoryId);
  return rows.length;
}

export async function searchCategoryBaseItems(categoryId, searchTerm) {
  const rows = await getCategoryBaseItems(categoryId);
  if (!searchTerm?.trim()) return rows;

  const term = searchTerm.toLowerCase();
  return rows.filter((row) =>
    `${row.item_name || ""} ${row.item_sku || ""}`.toLowerCase().includes(term),
  );
}

export async function updateCategoryBaseItem(
  id,
  { itemName, itemSku, status },
) {
  const userId = requireUserId();
  const patch: Record<string, unknown> = {
    updated_at: getNowIso(),
    updated_by: userId,
  };

  if (typeof itemName !== "undefined") patch.item_name = itemName;
  if (typeof itemSku !== "undefined")
    patch.item_sku = normalizeItemSku(itemSku);
  if (typeof status !== "undefined") patch.status = status;

  const { data, error } = await supabase
    .from("base_items")
    .update(patch)
    .eq("id", id)
    .is("deleted_at", null)
    .eq("created_by", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows([data], "created_by")[0];
}

export async function removeBaseItemFromCategory(id) {
  const userId = requireUserId();
  const now = getNowIso();

  const { error } = await supabase
    .from("base_items")
    .update({ deleted_at: now, updated_at: now, updated_by: userId })
    .eq("id", id)
    .is("deleted_at", null)
    .eq("created_by", userId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function removeMultipleBaseItemsFromCategory(
  categoryId,
  itemSkus,
) {
  const userId = requireUserId();
  const now = getNowIso();

  if (!itemSkus.length) return { success: true, removed: 0 };

  const { error } = await supabase
    .from("base_items")
    .update({ deleted_at: now, updated_at: now, updated_by: userId })
    .eq("category_id", categoryId)
    .is("deleted_at", null)
    .eq("created_by", userId)
    .in("item_sku", itemSkus);

  if (error) throw new Error(error.message);
  return { success: true, removed: itemSkus.length };
}

export async function removeAllBaseItemsFromCategory(categoryId) {
  const userId = requireUserId();
  const now = getNowIso();

  const { error } = await supabase
    .from("base_items")
    .update({ deleted_at: now, updated_at: now, updated_by: userId })
    .eq("category_id", categoryId)
    .is("deleted_at", null)
    .eq("created_by", userId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function getCategoriesWithBaseItem(itemSku) {
  const { data, error } = await supabase
    .from("base_items")
    .select("id, category_id, categories(*)")
    .is("deleted_at", null)
    .eq("item_sku", normalizeItemSku(itemSku));

  if (error) throw new Error(error.message);
  return data || [];
}

export async function listDeletedCategories() {
  const userId = requireUserId();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("created_by", userId)
    .not("deleted_at", "is", null)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows(data || [], "created_by").map(toCategoryShape);
}

export async function restoreCategory(id) {
  const userId = requireUserId();
  const now = getNowIso();

  const { data, error } = await supabase
    .from("categories")
    .update({ deleted_at: null, updated_at: now, updated_by: userId })
    .eq("id", id)
    .eq("created_by", userId)
    .not("deleted_at", "is", null)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return toCategoryShape(mapLegacyVisibilityRows([data], "created_by")[0]);
}

export async function listDeletedCategoryBaseItems(categoryId) {
  const userId = requireUserId();

  let query = supabase
    .from("base_items")
    .select("*")
    .eq("created_by", userId)
    .not("deleted_at", "is", null)
    .order("updated_at", { ascending: false });

  if (categoryId) query = query.eq("category_id", categoryId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows(data || [], "created_by");
}

export async function restoreCategoryBaseItem(id) {
  const userId = requireUserId();
  const now = getNowIso();

  const { data, error } = await supabase
    .from("base_items")
    .update({ deleted_at: null, updated_at: now, updated_by: userId })
    .eq("id", id)
    .eq("created_by", userId)
    .not("deleted_at", "is", null)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows([data], "created_by")[0];
}
