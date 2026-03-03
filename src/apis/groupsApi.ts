import type { ApiRecord, ApiUpdate, VisibilityStatus } from "@/types/api";
import { supabase } from "@lib/supabaseClient";
import { getVisibleRows, mapLegacyVisibilityRows } from "./_visibility";
import { getUserId } from "./usersApi";

type GroupRow = ApiRecord & {
  item_ids?: string[];
  products_ids?: unknown;
};

function requireUserId() {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

function getNowIso() {
  return new Date().toISOString();
}

function normalizeGroupRow(row: ApiRecord): GroupRow {
  const productsIdsRaw = row.products_ids;
  const productsIds = Array.isArray(productsIdsRaw)
    ? productsIdsRaw.map((id) => String(id))
    : [];

  return {
    ...row,
    products_ids: productsIds,
  };
}

export async function createGroup(input: {
  name: string;
  label?: string | null;
  vertical_id?: string | null;
  category_id?: string | null;
  item_ids?: string[];
  products_ids?: string[];
  hsn?: number | null;
  tax_code?: string | null;
  height_cm?: number | null;
  length_cm?: number | null;
  weight_kg?: number | null;
  breadth_cm?: number | null;
  packaging_cost?: number | null;
  final_price_over_300?: boolean;
  min_quantity_in_piece?: number | null;
  status?: VisibilityStatus;
}) {
  const userId = requireUserId();
  const now = getNowIso();
  const { data, error } = await supabase
    .from("groups")
    .insert([
      {
        name: input.name,
        label: input.label || null,
        vertical_id: input.vertical_id || null,
        category_id: input.category_id || null,
        item_ids: input.item_ids || [],
        products_ids: input.products_ids || [],
        hsn: input.hsn ?? null,
        tax_code: input.tax_code || "Select One",
        height_cm: input.height_cm ?? null,
        length_cm: input.length_cm ?? null,
        weight_kg: input.weight_kg ?? null,
        breadth_cm: input.breadth_cm ?? null,
        packaging_cost: input.packaging_cost ?? null,
        final_price_over_300: input.final_price_over_300 ?? false,
        min_quantity_in_piece: input.min_quantity_in_piece ?? null,
        status: input.status || "shared",
        created_by: userId,
        created_at: now,
        updated_at: now,
      },
    ])
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return normalizeGroupRow(
    mapLegacyVisibilityRows([data], "created_by")[0] as ApiRecord,
  );
}

export async function updateGroup(id: string, updates: ApiUpdate) {
  const userId = requireUserId();
  const patch: ApiUpdate = {
    ...updates,
    updated_at: getNowIso(),
  };

  const { data, error } = await supabase
    .from("groups")
    .update(patch)
    .eq("id", id)
    .eq("created_by", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return normalizeGroupRow(
    mapLegacyVisibilityRows([data], "created_by")[0] as ApiRecord,
  );
}

export async function deleteGroup(id: string) {
  const userId = requireUserId();
  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", id)
    .eq("created_by", userId);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function listGroups() {
  const rows = await getVisibleRows({
    table: "groups",
    ownerColumn: "created_by",
    currentUserId: getUserId(),
    orderBy: "created_at",
    ascending: false,
  });
  return mapLegacyVisibilityRows(rows, "created_by").map((row) =>
    normalizeGroupRow(row as ApiRecord),
  );
}

export async function getGroupById(id: string) {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data
    ? normalizeGroupRow(
        mapLegacyVisibilityRows([data], "created_by")[0] as Record<
          string,
          unknown
        >,
      )
    : null;
}

export async function getGroupByName(name: string) {
  const userId = requireUserId();
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("name", name)
    .eq("created_by", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data
    ? normalizeGroupRow(
        mapLegacyVisibilityRows([data], "created_by")[0] as Record<
          string,
          unknown
        >,
      )
    : null;
}

export async function addItemsToGroup(groupId: string, itemIds: string[]) {
  const group = (await getGroupById(groupId)) as GroupRow | null;
  if (!group) throw new Error("Group not found");

  const current = new Set((group.item_ids || []) as string[]);
  itemIds.forEach((id) => current.add(id));
  return updateGroup(groupId, {
    item_ids: Array.from(current),
  });
}

export async function removeItemsFromGroup(groupId: string, itemIds: string[]) {
  const group = (await getGroupById(groupId)) as GroupRow | null;
  if (!group) throw new Error("Group not found");

  const toDelete = new Set(itemIds);
  const next = ((group.item_ids || []) as string[]).filter(
    (id) => !toDelete.has(id),
  );
  return updateGroup(groupId, {
    item_ids: next,
  });
}

export async function setGroupItems(groupId: string, itemIds: string[]) {
  return updateGroup(groupId, {
    item_ids: itemIds || [],
  });
}

export async function getGroupProductsIds(groupId: string) {
  const group = (await getGroupById(groupId)) as GroupRow | null;
  if (!group) throw new Error("Group not found");

  const productIds = Array.isArray(group.products_ids)
    ? (group.products_ids as unknown[]).map((id) => String(id))
    : [];

  return productIds;
}

export async function addProductsIdsToGroup(
  groupId: string,
  productIds: string[],
) {
  const group = (await getGroupById(groupId)) as GroupRow | null;
  if (!group) throw new Error("Group not found");

  const currentProductIds = new Set(
    Array.isArray(group.products_ids)
      ? (group.products_ids as unknown[]).map((id) => String(id))
      : [],
  );
  productIds.forEach((id) => currentProductIds.add(String(id)));

  return updateGroup(groupId, {
    products_ids: Array.from(currentProductIds),
  });
}

export async function removeProductsIdsFromGroup(
  groupId: string,
  productIds: string[],
) {
  const group = (await getGroupById(groupId)) as GroupRow | null;
  if (!group) throw new Error("Group not found");

  const toDeleteProductIds = new Set(productIds.map((id) => String(id)));
  const nextProductIds = (
    Array.isArray(group.products_ids) ? (group.products_ids as unknown[]) : []
  )
    .map((id) => String(id))
    .filter((id) => !toDeleteProductIds.has(id));

  return updateGroup(groupId, {
    products_ids: nextProductIds,
  });
}

export async function setGroupProductsIds(
  groupId: string,
  productIds: string[],
) {
  return updateGroup(groupId, {
    products_ids: productIds || [],
  });
}
