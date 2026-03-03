import type { ApiRecord, ApiUpdate } from "@/types/api";
import { supabase } from "@lib/supabaseClient";
import { getUserId } from "./usersApi";

type EntryType = "meta" | "chunk";

type LockedListingProduct = {
  id?: string;
  esp?: number | null;
  mrp?: number | null;
  ssp?: number | null;
  name?: string;
  brand?: string;
  sku_id?: string;
  imageUrl?: string;
  listing_id?: string;
  alreadySelling?: boolean;
  minimum_order_quantity?: number | null;
  internal_state?: string;
  procurement_type?: string;
};

function toNumberOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeLockedListingProduct(value: unknown): LockedListingProduct {
  const source = (value || {}) as ApiRecord;

  return {
    id: source.id ? String(source.id) : undefined,
    esp: toNumberOrNull(source.esp),
    mrp: toNumberOrNull(source.mrp),
    ssp: toNumberOrNull(source.ssp),
    name: source.name ? String(source.name) : undefined,
    brand: source.brand ? String(source.brand) : undefined,
    sku_id: source.sku_id ? String(source.sku_id) : undefined,
    imageUrl: source.imageUrl ? String(source.imageUrl) : undefined,
    listing_id: source.listing_id ? String(source.listing_id) : undefined,
    minimum_order_quantity: toNumberOrNull(source.minimum_order_quantity),
    alreadySelling:
      source.alreadySelling === undefined
        ? undefined
        : Boolean(source.alreadySelling),
    internal_state: source.internal_state
      ? String(source.internal_state)
      : undefined,
    procurement_type: source.procurement_type
      ? String(source.procurement_type)
      : undefined,
  };
}

function normalizeLockedProductMap(
  payload: ApiRecord,
): Record<string, LockedListingProduct> {
  return Object.fromEntries(
    Object.entries(payload || {}).map(([productId, productValue]) => [
      String(productId),
      normalizeLockedListingProduct(productValue),
    ]),
  );
}

function requireUserId() {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

function toDatasetKey(name: string) {
  return name.trim();
}

function getNowIso() {
  return new Date().toISOString();
}

async function getMetaRow(userId: string, datasetKey: string) {
  const { data, error } = await supabase
    .from("marketplace_products")
    .select("*")
    .eq("user_id", userId)
    .eq("dataset_key", datasetKey)
    .eq("entry_type", "meta")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data || null;
}

async function getChunkRows(userId: string, datasetKey: string) {
  const { data, error } = await supabase
    .from("marketplace_products")
    .select("*")
    .eq("user_id", userId)
    .eq("dataset_key", datasetKey)
    .eq("entry_type", "chunk")
    .order("chunk_index", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

function reconstructDataset(meta: ApiRecord | null, chunks: ApiRecord[]) {
  if (!meta) return null;

  const merged: ApiRecord = {};
  chunks.forEach((chunk) => {
    const chunkData = ((chunk.data as ApiRecord | undefined)?.chunkData ||
      {}) as ApiRecord;
    Object.assign(merged, chunkData);
  });

  return {
    ...meta,
    name: meta.dataset_key,
    data: {
      ...(meta.data as ApiRecord),
      data: merged,
    },
  };
}

export async function getMarketplaceDataset(
  name: string,
  includeProducts = true,
) {
  const userId = requireUserId();
  const datasetKey = toDatasetKey(name);

  const meta = await getMetaRow(userId, datasetKey);
  if (!meta) return null;
  if (!includeProducts) return { ...meta, name: datasetKey };

  const chunks = await getChunkRows(userId, datasetKey);
  return reconstructDataset(meta, chunks);
}

export async function listMarketplaceDatasets() {
  const userId = requireUserId();

  const { data, error } = await supabase
    .from("marketplace_products")
    .select("*")
    .eq("user_id", userId)
    .eq("entry_type", "meta")
    .order("dataset_key", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = data || [];
  const result = await Promise.all(
    rows.map(async (row) => {
      const chunks = await getChunkRows(userId, row.dataset_key);
      return reconstructDataset(row as ApiRecord, chunks as ApiRecord[]);
    }),
  );

  return result.filter(Boolean);
}

export async function upsertMarketplaceDataset({
  name,
  data,
}: {
  name: string;
  data: ApiRecord;
}) {
  const userId = requireUserId();
  const datasetKey = toDatasetKey(name);
  const now = getNowIso();

  const payload = (data?.data || data) as ApiRecord;
  const lockedPayload = normalizeLockedProductMap(payload);
  const entries = Object.entries(lockedPayload || {});
  const chunkSize = 10_000;
  const totalChunks = Math.ceil(entries.length / chunkSize);

  await supabase
    .from("marketplace_products")
    .delete()
    .eq("user_id", userId)
    .eq("dataset_key", datasetKey);

  const metaData = {
    isChunked: true,
    totalChunks,
    chunkSize,
    totalItems: entries.length,
    count: data?.count,
    fetchedAt: data?.fetchedAt,
    sellerInfo: data?.sellerInfo,
  };

  const { data: meta, error: metaError } = await supabase
    .from("marketplace_products")
    .insert([
      {
        user_id: userId,
        dataset_key: datasetKey,
        entry_type: "meta" as EntryType,
        chunk_index: null,
        data: metaData,
        created_at: now,
        updated_at: now,
      },
    ])
    .select("*")
    .single();

  if (metaError) throw new Error(metaError.message);

  for (let i = 0; i < totalChunks; i += 1) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, entries.length);
    const chunkData = Object.fromEntries(entries.slice(start, end));

    const { error } = await supabase.from("marketplace_products").insert([
      {
        user_id: userId,
        dataset_key: datasetKey,
        entry_type: "chunk" as EntryType,
        chunk_index: i,
        data: { chunkIndex: i, chunkData },
        created_at: now,
        updated_at: now,
      },
    ]);

    if (error) throw new Error(error.message);
  }

  return { ...meta, name: datasetKey };
}

export async function updateMarketplaceDataset(
  name: string,
  updates: ApiUpdate,
) {
  const existing = await getMarketplaceDataset(name, true);
  if (!existing) throw new Error("Marketplace dataset not found");

  const merged = {
    ...(existing.data || {}),
    ...(updates.data || {}),
  };

  return upsertMarketplaceDataset({
    name,
    data: {
      ...(existing.data || {}),
      ...(updates || {}),
      data: merged,
    },
  });
}

export async function deleteMarketplaceDataset(name: string) {
  const userId = requireUserId();
  const datasetKey = toDatasetKey(name);
  const { error } = await supabase
    .from("marketplace_products")
    .delete()
    .eq("user_id", userId)
    .eq("dataset_key", datasetKey);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function patchMarketplaceProductsInChunks(
  name: string,
  productUpdates: Array<{
    productId?: string;
    sku_id?: string;
    updates: ApiUpdate;
  }>,
) {
  const fullData = await getMarketplaceDataset(name, true);
  if (!fullData?.data?.data) {
    return { success: false, fallbackRequired: true };
  }

  const items = fullData.data.data as Record<string, ApiRecord>;
  productUpdates.forEach(({ productId, sku_id, updates }) => {
    const key = productId || "";
    if (key && items[key]) {
      items[key] = { ...items[key], ...updates };
      return;
    }

    if (sku_id) {
      const entry = Object.entries(items).find(
        ([, value]) => value?.sku_id === sku_id,
      );
      if (entry) {
        const [entryKey] = entry;
        items[entryKey] = { ...items[entryKey], ...updates };
      }
    }
  });

  await upsertMarketplaceDataset({
    name,
    data: {
      ...(fullData.data || {}),
      data: normalizeLockedProductMap(items),
    },
  });

  return { success: true, appliedCount: productUpdates.length };
}
