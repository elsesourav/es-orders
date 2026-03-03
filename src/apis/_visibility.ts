import type { ApiRecord, ApiRow } from "@/types/api";
import { supabase } from "@lib/supabaseClient";

export type VisibleRowsParams = {
  table: string;
  ownerColumn: string;
  currentUserId?: string | null;
  select?: string;
  orderBy?: string;
  ascending?: boolean;
  extraEq?: ApiRecord;
};

export async function getSharedOwnerIds(
  userId?: string | null,
): Promise<string[]> {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("shared_access_users")
    .select("owner_user_id")
    .eq("shared_with_user_id", userId)
    .eq("is_active", true);

  if (error) throw new Error(error.message);

  return Array.from(
    new Set(
      (data || [])
        .map((row) => row.owner_user_id)
        .filter((v): v is string => Boolean(v)),
    ),
  );
}

export function mapLegacyVisibilityRows<T extends ApiRecord>(
  rows: T[] | null | undefined,
  ownerColumn: string,
): T[] {
  return (rows || []).map((row) => {
    const ownerId = (row[ownerColumn] as string | undefined) || null;
    return {
      ...row,
      created_by: (row.created_by as string | undefined) ?? ownerId,
      user_id: (row.user_id as string | undefined) ?? ownerId,
    };
  });
}

export async function getVisibleRows<T extends ApiRow>(
  params: VisibleRowsParams,
): Promise<T[]> {
  const {
    table,
    ownerColumn,
    currentUserId,
    select = "*",
    orderBy,
    ascending = false,
    extraEq = {},
  } = params;

  const queries = [];

  let publicQuery = supabase.from(table).select(select).eq("status", "public");
  Object.entries(extraEq).forEach(([key, value]) => {
    publicQuery = publicQuery.eq(key, value as never);
  });
  if (orderBy) publicQuery = publicQuery.order(orderBy, { ascending });
  queries.push(publicQuery);

  if (currentUserId) {
    let ownQuery = supabase
      .from(table)
      .select(select)
      .eq(ownerColumn, currentUserId);
    Object.entries(extraEq).forEach(([key, value]) => {
      ownQuery = ownQuery.eq(key, value as never);
    });
    if (orderBy) ownQuery = ownQuery.order(orderBy, { ascending });
    queries.push(ownQuery);

    const sharedOwnerIds = await getSharedOwnerIds(currentUserId);
    if (sharedOwnerIds.length > 0) {
      let sharedQuery = supabase
        .from(table)
        .select(select)
        .eq("status", "shared")
        .in(ownerColumn, sharedOwnerIds);

      Object.entries(extraEq).forEach(([key, value]) => {
        sharedQuery = sharedQuery.eq(key, value as never);
      });
      if (orderBy) sharedQuery = sharedQuery.order(orderBy, { ascending });
      queries.push(sharedQuery);
    }
  }

  const results = await Promise.all(queries);
  results.forEach(({ error }) => {
    if (error) throw new Error(error.message);
  });

  const merged = results.flatMap(({ data }) => (data || []) as unknown as T[]);
  const dedup = new Map<string, T>();
  merged.forEach((row) => {
    if (row?.id) dedup.set(row.id, row);
  });

  return Array.from(dedup.values());
}
