import type { ApiUpdate } from "@/types/api";
import {
  getExtensionStorageLocal,
  setExtensionStorageLocal,
} from "@lib/storage";
import { supabase } from "@lib/supabaseClient";
import { STORAGE_KEYS } from "@utils/constants";
import { getUserId } from "./usersApi";

type MapSkuRow = {
  id: string;
  user_id: string;
  old_sku: string;
  new_sku: string;
  created_at: string;
  updated_at: string;
};

type UpsertMapSkuInput = {
  oldSku: string;
  newSku: string;
};

const TABLE = "map_skus";
let mapSkusCache: Record<string, string> | null = null;

function requireUserId(): string {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

function getNowIso() {
  return new Date().toISOString();
}

function clearMapSkusCache() {
  mapSkusCache = null;
}

async function getLastMapSkusUpdate(): Promise<string | null> {
  const userId = requireUserId();
  const { data, error } = await supabase
    .from(TABLE)
    .select("updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.updated_at || null;
}

async function setLocalCache(rows: MapSkuRow[], lastUpdate: string | null) {
  try {
    await setExtensionStorageLocal(STORAGE_KEYS.SKU_MAPPING_DATA, rows);
    if (lastUpdate) {
      await setExtensionStorageLocal(
        STORAGE_KEYS.SKU_MAPPING_LAST_UPDATE,
        lastUpdate,
      );
    }
  } catch (error) {
    console.log("Failed to store map_skus cache", error);
  }
}

async function fetchAllMapSkusForUser(userId: string): Promise<MapSkuRow[]> {
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;
  let rows: MapSkuRow[] = [];

  while (hasMore) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("old_sku", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw new Error(error.message);

    const batch = (data || []) as MapSkuRow[];
    rows = rows.concat(batch);
    hasMore = batch.length === pageSize;
    from += pageSize;
  }

  return rows;
}

export async function listMapSkus(): Promise<MapSkuRow[]> {
  const userId = requireUserId();
  const serverLastUpdate = await getLastMapSkusUpdate();
  const cachedLastUpdate = await getExtensionStorageLocal<string>(
    STORAGE_KEYS.SKU_MAPPING_LAST_UPDATE,
  );
  const cachedData = await getExtensionStorageLocal<MapSkuRow[] | string>(
    STORAGE_KEYS.SKU_MAPPING_DATA,
  );

  if (cachedData && serverLastUpdate && cachedLastUpdate === serverLastUpdate) {
    if (typeof cachedData === "string") {
      return JSON.parse(cachedData) as MapSkuRow[];
    }
    return cachedData as MapSkuRow[];
  }

  const rows = await fetchAllMapSkusForUser(userId);
  await setLocalCache(rows, serverLastUpdate);
  return rows;
}

export async function listMapSkusPaginated(
  page = 1,
  pageSize = 500,
): Promise<MapSkuRow[]> {
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
  return (data || []) as MapSkuRow[];
}

export async function getMapSkusObjectByCache(): Promise<
  Record<string, string>
> {
  const rows = await listMapSkus();
  return rows.reduce<Record<string, string>>((acc, row) => {
    acc[row.old_sku] = row.new_sku;
    return acc;
  }, {});
}

export async function getMapSkusObject(): Promise<Record<string, string>> {
  if (mapSkusCache) return mapSkusCache;

  const rows = await listMapSkus();
  mapSkusCache = rows.reduce<Record<string, string>>((acc, row) => {
    acc[row.old_sku] = row.new_sku;
    return acc;
  }, {});

  return mapSkusCache;
}

export async function getMapSkuByOldSku(
  oldSku: string,
): Promise<MapSkuRow | null> {
  const userId = requireUserId();
  if (!oldSku) throw new Error("old_sku is required");

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("old_sku", oldSku)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as MapSkuRow | null) || null;
}

export async function getMapSkuNewSku(oldSku: string): Promise<string | null> {
  const row = await getMapSkuByOldSku(oldSku);
  return row?.new_sku || null;
}

export async function upsertMapSku({ oldSku, newSku }: UpsertMapSkuInput) {
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
    .select()
    .single();

  if (error) throw new Error(error.message);
  clearMapSkusCache();
  return data as MapSkuRow;
}

export async function upsertManyMapSkus(
  mappings: Array<{ oldSku?: string; newSku?: string }>,
) {
  const userId = requireUserId();
  const now = getNowIso();
  if (!Array.isArray(mappings) || mappings.length === 0) {
    throw new Error("mappings must be a non-empty array");
  }

  const payload = mappings
    .filter((row) => row.oldSku && row.newSku)
    .map((row) => ({
      user_id: userId,
      old_sku: row.oldSku as string,
      new_sku: row.newSku as string,
      created_at: now,
      updated_at: now,
    }));

  if (!payload.length) return [];

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: "user_id,old_sku" })
    .select();

  if (error) throw new Error(error.message);
  clearMapSkusCache();
  return (data || []) as MapSkuRow[];
}

export async function updateMapSku(
  oldSku: string,
  updates: { newSku?: string },
) {
  const userId = requireUserId();
  if (!oldSku) throw new Error("oldSku is required");

  const patch: ApiUpdate = {};
  if (typeof updates?.newSku !== "undefined") patch.new_sku = updates.newSku;
  patch.updated_at = getNowIso();

  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq("user_id", userId)
    .eq("old_sku", oldSku)
    .select()
    .single();

  if (error) throw new Error(error.message);
  clearMapSkusCache();
  return data as MapSkuRow;
}

export async function deleteMapSku(oldSku: string) {
  const userId = requireUserId();
  if (!oldSku) throw new Error("oldSku is required");

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("user_id", userId)
    .eq("old_sku", oldSku);

  if (error) throw new Error(error.message);
  clearMapSkusCache();
  return { success: true };
}

export async function deleteManyMapSkus(oldSkus: string[] = []) {
  const userId = requireUserId();
  if (!oldSkus.length) return { success: true, deleted: 0 };

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("user_id", userId)
    .in("old_sku", oldSkus);

  if (error) throw new Error(error.message);
  clearMapSkusCache();
  return { success: true, deleted: oldSkus.length };
}

export async function clearMapSkus() {
  const userId = requireUserId();
  const { error } = await supabase.from(TABLE).delete().eq("user_id", userId);
  if (error) throw new Error(error.message);
  clearMapSkusCache();
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

export async function searchMapSkus(searchTerm: string) {
  const userId = requireUserId();
  if (!searchTerm?.trim()) return listMapSkus();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .or(`old_sku.ilike.%${searchTerm}%,new_sku.ilike.%${searchTerm}%`)
    .order("old_sku", { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as MapSkuRow[];
}

export async function searchMapSkusPaginated(
  searchTerm: string,
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

  if (searchTerm?.trim()) {
    query = query.or(
      `old_sku.ilike.%${searchTerm}%,new_sku.ilike.%${searchTerm}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as MapSkuRow[];
}

export async function replaceAllMapSkus(
  mappings: Array<{
    oldSku?: string;
    newSku?: string;
  }> = [],
) {
  await clearMapSkus();
  if (!mappings.length) return [];
  return upsertManyMapSkus(mappings);
}

export async function exportMapSkusToJson() {
  const rows = await listMapSkus();
  const map = rows.reduce<Record<string, string>>((acc, row) => {
    acc[row.old_sku] = row.new_sku;
    return acc;
  }, {});
  return JSON.stringify(map, null, 2);
}

export async function importMapSkusFromJson(jsonObject: unknown) {
  const input =
    typeof jsonObject === "string" ? JSON.parse(jsonObject) : jsonObject;
  if (!input || typeof input !== "object") {
    throw new Error("Invalid JSON object");
  }

  const entries = Object.entries(input as Record<string, string>);
  if (!entries.length) return { success: true, totalImported: 0 };

  const mappings = entries.map(([oldSku, newSku]) => ({ oldSku, newSku }));
  const data = await upsertManyMapSkus(mappings);
  return { success: true, totalImported: data.length };
}
