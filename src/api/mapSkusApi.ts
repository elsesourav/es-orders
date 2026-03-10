import { supabase } from "../lib/supabaseClient";
import { getUserId } from "./usersApi";

const TABLE = "map_skus";
let mapSkusCache: Record<string, string> | null = null;
const SHOPSY_PREFIX_REGEX = /^(SPY_|SHY_|SH_)/i;

const CHAIN_CONFLICT_ERROR_PREFIX = "[chain_conflict]";
const SELF_MAP_ERROR_PREFIX = "[self_map]";

type MapSkuRow = {
  id: string;
  user_id: string;
  old_sku: string;
  new_sku: string;
  created_at: string;
  updated_at: string;
  updated_by?: string | null;
  deleted_at?: string | null;
};

type MapSkuConflictReason =
  | "invalid_row"
  | "self_map"
  | "duplicate_input"
  | "chain_conflict";

type MapSkuConflict = {
  oldSku: string;
  newSku: string;
  reason: MapSkuConflictReason;
  message: string;
};

type MapSkuBulkUpsertResult = {
  rows: MapSkuRow[];
  insertedCount: number;
  skippedCount: number;
  conflicts: MapSkuConflict[];
};

type NormalizedIncomingMapping = {
  oldSku: string;
  newSku: string;
  oldKey: string;
  newKey: string;
};

function requireUserId() {
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

const normalizeSkuValue = (value: unknown): string =>
  String(value || "").trim();

const normalizeSkuForComparison = (value: unknown): string =>
  normalizeSkuValue(value).replace(SHOPSY_PREFIX_REGEX, "").toUpperCase();

const createChainConflictMessage = (oldSku: string, newSku: string) =>
  `${CHAIN_CONFLICT_ERROR_PREFIX} Chain mapping is not allowed: "${newSku}" is already used as an old SKU, so "${oldSku}" -> "${newSku}" was blocked.`;

const createSelfMapMessage = (sku: string) =>
  `${SELF_MAP_ERROR_PREFIX} Self mapping is not allowed for SKU "${sku}".`;

const createBulkConflict = (
  oldSku: string,
  newSku: string,
  reason: MapSkuConflictReason,
  message: string,
): MapSkuConflict => ({
  oldSku,
  newSku,
  reason,
  message,
});

const getBulkResult = (
  rows: MapSkuRow[],
  conflicts: MapSkuConflict[],
): MapSkuBulkUpsertResult => ({
  rows,
  insertedCount: rows.length,
  skippedCount: conflicts.length,
  conflicts,
});

async function fetchAllMapSkusForUser(
  userId: string,
  options: { includeDeleted?: boolean } = {},
): Promise<MapSkuRow[]> {
  const { includeDeleted = false } = options;
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;
  let rows: MapSkuRow[] = [];

  while (hasMore) {
    let query = supabase
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("old_sku", { ascending: true });

    if (!includeDeleted) {
      query = query.is("deleted_at", null);
    }

    const { data, error } = await query.range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);

    const batch = (data || []) as MapSkuRow[];
    rows = rows.concat(batch);
    hasMore = batch.length === pageSize;
    from += pageSize;
  }

  return rows;
}

async function getActiveMapSkuRowByOldSku(
  userId: string,
  oldSku: string,
): Promise<MapSkuRow | null> {
  const normalizedOldSku = normalizeSkuValue(oldSku);
  if (!normalizedOldSku) return null;

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .eq("old_sku", normalizedOldSku)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as MapSkuRow | null) || null;
}

export async function listMapSkus(): Promise<MapSkuRow[]> {
  const userId = requireUserId();
  return fetchAllMapSkusForUser(userId);
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
    .is("deleted_at", null)
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

  return getActiveMapSkuRowByOldSku(userId, oldSku);
}

export async function getMapSkuNewSku(oldSku: string): Promise<string | null> {
  const row = await getMapSkuByOldSku(oldSku);
  return row?.new_sku || null;
}

export async function upsertMapSku({
  oldSku,
  newSku,
}: {
  oldSku: string;
  newSku: string;
}) {
  const userId = requireUserId();
  const normalizedOldSku = normalizeSkuValue(oldSku);
  const normalizedNewSku = normalizeSkuValue(newSku);

  if (!normalizedOldSku || !normalizedNewSku) {
    throw new Error("old_sku and new_sku are required");
  }

  const oldSkuKey = normalizeSkuForComparison(normalizedOldSku);
  const newSkuKey = normalizeSkuForComparison(normalizedNewSku);

  if (!oldSkuKey || !newSkuKey) {
    throw new Error("old_sku and new_sku are required");
  }

  if (oldSkuKey === newSkuKey) {
    throw new Error(createSelfMapMessage(normalizedOldSku));
  }

  const allRows = await fetchAllMapSkusForUser(userId, {
    includeDeleted: true,
  });
  const existingRow = allRows.find(
    (row) => normalizeSkuForComparison(row.old_sku) === oldSkuKey,
  );

  if (existingRow && !existingRow.deleted_at) {
    const existingNewSkuKey = normalizeSkuForComparison(existingRow.new_sku);
    if (existingNewSkuKey === newSkuKey) {
      return existingRow;
    }
  }

  const chainRow = allRows.find((row) => {
    if (row.deleted_at) return false;
    const existingOldKey = normalizeSkuForComparison(row.old_sku);
    return existingOldKey === newSkuKey && existingOldKey !== oldSkuKey;
  });

  if (chainRow) {
    throw new Error(
      createChainConflictMessage(normalizedOldSku, normalizedNewSku),
    );
  }

  const now = getNowIso();

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        user_id: userId,
        old_sku: normalizedOldSku,
        new_sku: normalizedNewSku,
        created_at: existingRow?.created_at || now,
        updated_at: now,
        updated_by: userId,
        deleted_at: null,
      },
      { onConflict: "user_id,old_sku" },
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  clearMapSkusCache();
  return data as MapSkuRow;
}

export async function upsertManyMapSkus(
  mappings: Array<{ oldSku?: string; newSku?: string }>,
): Promise<MapSkuBulkUpsertResult> {
  const userId = requireUserId();

  if (!Array.isArray(mappings) || mappings.length === 0) {
    throw new Error("mappings must be a non-empty array");
  }

  const existingRows = await fetchAllMapSkusForUser(userId, {
    includeDeleted: true,
  });
  const existingByOldKey = new Map<string, MapSkuRow>();
  const activeExistingOldKeys = new Set<string>();

  existingRows.forEach((row) => {
    const key = normalizeSkuForComparison(row.old_sku);
    if (!key) return;

    existingByOldKey.set(key, row);
    if (!row.deleted_at) {
      activeExistingOldKeys.add(key);
    }
  });

  const seenInputOldKeys = new Set<string>();
  const incomingByOldKey = new Map<string, NormalizedIncomingMapping>();
  const conflicts: MapSkuConflict[] = [];

  mappings.forEach((mapping, index) => {
    const oldSku = normalizeSkuValue(mapping.oldSku);
    const newSku = normalizeSkuValue(mapping.newSku);
    const oldKey = normalizeSkuForComparison(oldSku);
    const newKey = normalizeSkuForComparison(newSku);

    if (!oldKey || !newKey) {
      conflicts.push(
        createBulkConflict(
          oldSku,
          newSku,
          "invalid_row",
          `Row ${index + 1} is invalid. oldSku and newSku are required.`,
        ),
      );
      return;
    }

    if (oldKey === newKey) {
      conflicts.push(
        createBulkConflict(
          oldSku,
          newSku,
          "self_map",
          createSelfMapMessage(oldSku),
        ),
      );
      return;
    }

    if (seenInputOldKeys.has(oldKey)) {
      conflicts.push(
        createBulkConflict(
          oldSku,
          newSku,
          "duplicate_input",
          `Duplicate oldSku "${oldSku}" in input was skipped.`,
        ),
      );
      return;
    }

    seenInputOldKeys.add(oldKey);

    const existingRow = existingByOldKey.get(oldKey);
    if (existingRow) {
      const existingNewKey = normalizeSkuForComparison(existingRow.new_sku);
      if (existingNewKey === newKey && !existingRow.deleted_at) {
        conflicts.push(
          createBulkConflict(
            oldSku,
            newSku,
            "duplicate_input",
            `Mapping already exists for "${oldSku}" and was skipped.`,
          ),
        );
        return;
      }
    }

    incomingByOldKey.set(oldKey, { oldSku, newSku, oldKey, newKey });
  });

  const incomingOldKeys = new Set(incomingByOldKey.keys());

  const payloadMappings = Array.from(incomingByOldKey.values()).filter(
    (mapping) => {
      const hasExistingChainConflict =
        activeExistingOldKeys.has(mapping.newKey) &&
        mapping.newKey !== mapping.oldKey;

      const hasIncomingChainConflict =
        incomingOldKeys.has(mapping.newKey) &&
        mapping.newKey !== mapping.oldKey;

      if (hasExistingChainConflict || hasIncomingChainConflict) {
        conflicts.push(
          createBulkConflict(
            mapping.oldSku,
            mapping.newSku,
            "chain_conflict",
            createChainConflictMessage(mapping.oldSku, mapping.newSku),
          ),
        );
        return false;
      }

      return true;
    },
  );

  if (!payloadMappings.length) {
    return getBulkResult([], conflicts);
  }

  const now = getNowIso();

  const payload = payloadMappings.map((mapping) => {
    const existingRow = existingByOldKey.get(mapping.oldKey);

    return {
      user_id: userId,
      old_sku: mapping.oldSku,
      new_sku: mapping.newSku,
      created_at: existingRow?.created_at || now,
      updated_at: now,
      updated_by: userId,
      deleted_at: null,
    };
  });

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: "user_id,old_sku" })
    .select("*");

  if (error) throw new Error(error.message);

  clearMapSkusCache();
  return getBulkResult((data || []) as MapSkuRow[], conflicts);
}

export async function updateMapSku(
  oldSku: string,
  updates: { newSku?: string },
) {
  const userId = requireUserId();
  const normalizedOldSku = normalizeSkuValue(oldSku);

  if (!normalizedOldSku) throw new Error("oldSku is required");

  const existingRow = await getActiveMapSkuRowByOldSku(
    userId,
    normalizedOldSku,
  );
  if (!existingRow) {
    throw new Error(`Mapping for "${normalizedOldSku}" not found`);
  }

  if (typeof updates?.newSku === "undefined") {
    return existingRow;
  }

  const normalizedNewSku = normalizeSkuValue(updates.newSku);
  if (!normalizedNewSku) {
    throw new Error("newSku is required");
  }

  const oldSkuKey = normalizeSkuForComparison(existingRow.old_sku);
  const newSkuKey = normalizeSkuForComparison(normalizedNewSku);

  if (oldSkuKey === newSkuKey) {
    throw new Error(createSelfMapMessage(existingRow.old_sku));
  }

  const currentNewSkuKey = normalizeSkuForComparison(existingRow.new_sku);
  if (currentNewSkuKey === newSkuKey) {
    return existingRow;
  }

  const activeRows = await fetchAllMapSkusForUser(userId, {
    includeDeleted: false,
  });
  const chainRow = activeRows.find((row) => {
    const existingOldKey = normalizeSkuForComparison(row.old_sku);
    return existingOldKey === newSkuKey && existingOldKey !== oldSkuKey;
  });

  if (chainRow) {
    throw new Error(
      createChainConflictMessage(existingRow.old_sku, normalizedNewSku),
    );
  }

  const now = getNowIso();

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      new_sku: normalizedNewSku,
      updated_at: now,
      updated_by: userId,
    })
    .eq("user_id", userId)
    .is("deleted_at", null)
    .eq("old_sku", normalizedOldSku)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  clearMapSkusCache();
  return data as MapSkuRow;
}

export async function deleteMapSku(oldSku: string) {
  const userId = requireUserId();
  if (!oldSku) throw new Error("oldSku is required");

  const now = getNowIso();

  const { error } = await supabase
    .from(TABLE)
    .update({ deleted_at: now, updated_at: now, updated_by: userId })
    .eq("user_id", userId)
    .is("deleted_at", null)
    .eq("old_sku", oldSku);

  if (error) throw new Error(error.message);

  clearMapSkusCache();
  return { success: true };
}

export async function deleteManyMapSkus(oldSkus: string[] = []) {
  const userId = requireUserId();
  if (!oldSkus.length) return { success: true, deleted: 0 };

  const now = getNowIso();

  const { error } = await supabase
    .from(TABLE)
    .update({ deleted_at: now, updated_at: now, updated_by: userId })
    .eq("user_id", userId)
    .is("deleted_at", null)
    .in("old_sku", oldSkus);

  if (error) throw new Error(error.message);

  clearMapSkusCache();
  return { success: true, deleted: oldSkus.length };
}

export async function clearMapSkus() {
  const userId = requireUserId();
  const now = getNowIso();

  const { error } = await supabase
    .from(TABLE)
    .update({ deleted_at: now, updated_at: now, updated_by: userId })
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (error) throw new Error(error.message);

  clearMapSkusCache();
  return { success: true };
}

export async function countMapSkus() {
  const userId = requireUserId();

  const { count, error } = await supabase
    .from(TABLE)
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("deleted_at", null);

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
    .is("deleted_at", null)
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
    .is("deleted_at", null)
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
  if (!mappings.length) return getBulkResult([], []);
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
  if (!entries.length) {
    return {
      success: true,
      totalImported: 0,
      insertedCount: 0,
      skippedCount: 0,
      conflicts: [] as MapSkuConflict[],
    };
  }

  const mappings = entries.map(([oldSku, newSku]) => ({ oldSku, newSku }));
  const result = await upsertManyMapSkus(mappings);

  return {
    success: true,
    totalImported: result.insertedCount,
    insertedCount: result.insertedCount,
    skippedCount: result.skippedCount,
    conflicts: result.conflicts,
  };
}

export async function listDeletedMapSkus(): Promise<MapSkuRow[]> {
  const userId = requireUserId();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .not("deleted_at", "is", null)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as MapSkuRow[];
}

export async function restoreMapSku(oldSku: string) {
  const userId = requireUserId();
  if (!oldSku) throw new Error("oldSku is required");

  const now = getNowIso();

  const { data, error } = await supabase
    .from(TABLE)
    .update({ deleted_at: null, updated_at: now, updated_by: userId })
    .eq("user_id", userId)
    .not("deleted_at", "is", null)
    .eq("old_sku", oldSku)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  clearMapSkusCache();
  return data as MapSkuRow;
}

export async function restoreManyMapSkus(oldSkus: string[] = []) {
  const userId = requireUserId();
  if (!oldSkus.length) return { success: true, restored: 0 };

  const now = getNowIso();

  const { error } = await supabase
    .from(TABLE)
    .update({ deleted_at: null, updated_at: now, updated_by: userId })
    .eq("user_id", userId)
    .not("deleted_at", "is", null)
    .in("old_sku", oldSkus);

  if (error) throw new Error(error.message);

  clearMapSkusCache();
  return { success: true, restored: oldSkus.length };
}
