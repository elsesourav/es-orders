import type { ApiRecord, ApiUpdate, VisibilityStatus } from "@/types/api";
import { supabase } from "@lib/supabaseClient";
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

function normalizeItemSku(value: string) {
  return value.trim().toUpperCase();
}

function toCategoryShape<T extends Record<string, unknown>>(row: T): T {
  return {
    ...row,
    categorySku: (row.categorySku as string | undefined) || "",
  } as T;
}

export async function createCategory(input: {
  categorySku: string;
  label?: string;
  status?: VisibilityStatus;
  vertical_id: string;
}) {
  const userId = requireUserId();
  const now = getNowIso();
  const payload = {
    categorySku: input.categorySku,
    label: input.label || null,
    status: input.status || "shared",
    vertical_id: input.vertical_id,
    created_by: userId,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("categories")
    .insert([payload])
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return toCategoryShape(
    mapLegacyVisibilityRows([data], "created_by")[0] as Record<string, unknown>,
  );
}

export async function updateCategory(id: string, updates: ApiUpdate) {
  const userId = requireUserId();
  const patch: ApiUpdate = {
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
  return toCategoryShape(
    mapLegacyVisibilityRows([data], "created_by")[0] as Record<string, unknown>,
  );
}

export async function deleteCategory(id: string) {
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
  return mapLegacyVisibilityRows(rows, "created_by").map((row) =>
    toCategoryShape(row as Record<string, unknown>),
  );
}

export async function getCategoryById(id: string) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data
    ? toCategoryShape(
        mapLegacyVisibilityRows([data], "created_by")[0] as Record<
          string,
          unknown
        >,
      )
    : null;
}

export async function getVerticalCategories(verticalId: string) {
  const rows = await getVisibleRows({
    table: "categories",
    ownerColumn: "created_by",
    currentUserId: getUserId(),
    orderBy: "created_at",
    ascending: false,
    extraEq: { vertical_id: verticalId },
  });
  return mapLegacyVisibilityRows(rows, "created_by").map((row) =>
    toCategoryShape(row as Record<string, unknown>),
  );
}

export async function addBaseItemToCategory(input: {
  categoryId: string;
  itemName: string;
  itemSku: string;
  status?: VisibilityStatus;
}) {
  const userId = requireUserId();
  const now = getNowIso();

  const { data, error } = await supabase
    .from("base_items")
    .insert([
      {
        category_id: input.categoryId,
        item_name: input.itemName,
        item_sku: normalizeItemSku(input.itemSku),
        status: input.status || "shared",
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

export async function addMultipleBaseItemsToCategory(
  categoryId: string,
  items: Array<{ itemName: string; itemSku: string }>,
) {
  const userId = requireUserId();
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

export async function getCategoryBaseItems(categoryId: string) {
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

export async function getCategoryBaseItemsPaginated(
  categoryId: string,
  page = 1,
  pageSize = 500,
) {
  const rows = await getCategoryBaseItems(categoryId);
  const from = (page - 1) * pageSize;
  return rows.slice(from, from + pageSize);
}

export async function getCategoryBaseItemsCount(categoryId: string) {
  const rows = await getCategoryBaseItems(categoryId);
  return rows.length;
}

export async function searchCategoryBaseItems(
  categoryId: string,
  searchTerm: string,
) {
  const rows = await getCategoryBaseItems(categoryId);
  if (!searchTerm?.trim()) return rows;
  const term = searchTerm.toLowerCase();
  return rows.filter((row: ApiRecord) =>
    `${row.item_name || ""} ${row.item_sku || ""}`.toLowerCase().includes(term),
  );
}

export async function updateCategoryBaseItem(
  id: string,
  input: {
    itemName?: string;
    itemSku?: string;
    status?: VisibilityStatus;
  },
) {
  const userId = requireUserId();
  const patch: ApiUpdate = {};
  if (typeof input.itemName !== "undefined") patch.item_name = input.itemName;
  if (typeof input.itemSku !== "undefined") {
    patch.item_sku = normalizeItemSku(input.itemSku);
  }
  if (typeof input.status !== "undefined") patch.status = input.status;
  patch.updated_at = getNowIso();

  const { data, error } = await supabase
    .from("base_items")
    .update(patch)
    .eq("id", id)
    .eq("created_by", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows([data], "created_by")[0];
}

export async function removeBaseItemFromCategory(id: string) {
  const userId = requireUserId();
  const { error } = await supabase
    .from("base_items")
    .delete()
    .eq("id", id)
    .eq("created_by", userId);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function removeMultipleBaseItemsFromCategory(
  categoryId: string,
  itemSkus: string[],
) {
  const userId = requireUserId();
  if (!itemSkus.length) return { success: true, removed: 0 };

  const { error } = await supabase
    .from("base_items")
    .delete()
    .eq("category_id", categoryId)
    .eq("created_by", userId)
    .in("item_sku", itemSkus);

  if (error) throw new Error(error.message);
  return { success: true, removed: itemSkus.length };
}

export async function removeAllBaseItemsFromCategory(categoryId: string) {
  const userId = requireUserId();
  const { error } = await supabase
    .from("base_items")
    .delete()
    .eq("category_id", categoryId)
    .eq("created_by", userId);

  if (error) throw new Error(error.message);
  return { success: true };
}
export async function getCategoriesWithBaseItem(itemSku: string) {
  const { data, error } = await supabase
    .from("base_items")
    .select("id, category_id, categories(*)")
    .eq("item_sku", normalizeItemSku(itemSku));

  if (error) throw new Error(error.message);
  return data || [];
}
