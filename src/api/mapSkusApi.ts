import { supabase } from "../lib/supabaseClient";
import { getUserId } from "./usersApi";

const TABLE = "map_skus";

function requireUserId() {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

function getNowIso() {
  return new Date().toISOString();
}

export async function listMapSkus() {
  const userId = requireUserId();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("old_sku", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function listMapSkusPaginated(page = 1, pageSize = 500) {
  const userId = requireUserId();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("old_sku", { ascending: true })
    .range(from, to);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getMapSkusObjectByCache() {
  return getMapSkusObject();
}

export async function getMapSkusObject() {
  const rows = await listMapSkus();
  return rows.reduce((acc, row) => {
    acc[row.old_sku] = row.new_sku;
    return acc;
  }, {});
}

export async function getMapSkuByOldSku(oldSku) {
  const userId = requireUserId();
  if (!oldSku) throw new Error("old_sku is required");

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("old_sku", oldSku)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data || null;
}

export async function getMapSkuNewSku(oldSku) {
  const row = await getMapSkuByOldSku(oldSku);
  return row?.new_sku || null;
}

export async function upsertMapSku({ oldSku, newSku }) {
  const userId = requireUserId();
  const now = getNowIso();
  if (!oldSku || !newSku) throw new Error("old_sku and new_sku are required");

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        user_id: userId,
        old_sku: oldSku,
        new_sku: newSku,
        created_at: now,
        updated_at: now,
      },
      { onConflict: "user_id,old_sku" },
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function upsertManyMapSkus(mappings = []) {
  const userId = requireUserId();
  const now = getNowIso();
  if (!Array.isArray(mappings) || mappings.length === 0) {
    throw new Error("mappings must be a non-empty array");
  }

  const payload = mappings
    .filter((row) => row.oldSku && row.newSku)
    .map((row) => ({
      user_id: userId,
      old_sku: row.oldSku,
      new_sku: row.newSku,
      created_at: now,
      updated_at: now,
    }));

  if (!payload.length) return [];

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: "user_id,old_sku" })
    .select("*");

  if (error) throw new Error(error.message);
  return data || [];
}

export async function updateMapSku(oldSku, updates) {
  const userId = requireUserId();
  if (!oldSku) throw new Error("oldSku is required");

  const patch: Record<string, any> = {
    updated_at: getNowIso(),
  };
  if (typeof updates?.newSku !== "undefined") patch.new_sku = updates.newSku;

  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq("user_id", userId)
    .eq("old_sku", oldSku)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMapSku(oldSku) {
  const userId = requireUserId();
  if (!oldSku) throw new Error("oldSku is required");

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("user_id", userId)
    .eq("old_sku", oldSku);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function deleteManyMapSkus(oldSkus = []) {
  const userId = requireUserId();
  if (!oldSkus.length) return { success: true, deleted: 0 };

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("user_id", userId)
    .in("old_sku", oldSkus);

  if (error) throw new Error(error.message);
  return { success: true, deleted: oldSkus.length };
}

export async function clearMapSkus() {
  const userId = requireUserId();
  const { error } = await supabase.from(TABLE).delete().eq("user_id", userId);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function countMapSkus() {
  const userId = requireUserId();
  const { count, error } = await supabase
    .from(TABLE)
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return count || 0;
}

export async function searchMapSkus(searchTerm) {
  const userId = requireUserId();
  if (!String(searchTerm || "").trim()) return listMapSkus();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .or(`old_sku.ilike.%${searchTerm}%,new_sku.ilike.%${searchTerm}%`)
    .order("old_sku", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function searchMapSkusPaginated(
  searchTerm,
  page = 1,
  pageSize = 500,
) {
  const userId = requireUserId();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("old_sku", { ascending: true })
    .range(from, to);

  if (String(searchTerm || "").trim()) {
    query = query.or(
      `old_sku.ilike.%${searchTerm}%,new_sku.ilike.%${searchTerm}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function replaceAllMapSkus(mappings = []) {
  await clearMapSkus();
  if (!mappings.length) return [];
  return upsertManyMapSkus(mappings);
}

export async function exportMapSkusToJson() {
  const rows = await listMapSkus();
  const map = rows.reduce((acc, row) => {
    acc[row.old_sku] = row.new_sku;
    return acc;
  }, {});
  return JSON.stringify(map, null, 2);
}

export async function importMapSkusFromJson(jsonObject) {
  const input =
    typeof jsonObject === "string" ? JSON.parse(jsonObject) : jsonObject;
  if (!input || typeof input !== "object") {
    throw new Error("Invalid JSON object");
  }

  const entries = Object.entries(input);
  if (!entries.length) return { success: true, totalImported: 0 };

  const mappings = entries.map(([oldSku, newSku]) => ({ oldSku, newSku }));
  const data = await upsertManyMapSkus(mappings);
  return { success: true, totalImported: data.length };
}
