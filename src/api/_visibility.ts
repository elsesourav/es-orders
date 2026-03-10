import { supabase } from "../lib/supabaseClient";

type VisibilityExtraEq = Record<string, unknown>;

type VisibleRowsParams = {
  table: string;
  ownerColumn: string;
  currentUserId?: string | null;
  select?: string;
  orderBy?: string;
  ascending?: boolean;
  extraEq?: VisibilityExtraEq;
};

type RowRecord = {
  id?: string;
  created_by?: string | null;
  user_id?: string | null;
  [key: string]: unknown;
};

export async function getSharedOwnerIds(userId?: string | null) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("shared_access_users")
    .select("owner_user_id")
    .eq("shared_with_user_id", userId)
    .eq("is_active", true)
    .eq("member_access_enabled", true);

  if (error) throw new Error(error.message);

  return Array.from(
    new Set(
      (data || [])
        .map((row) => row.owner_user_id)
        .filter((value): value is string => Boolean(value)),
    ),
  );
}

export function mapLegacyVisibilityRows<T extends RowRecord>(
  rows: T[] | null | undefined,
  ownerColumn: string,
) {
  return (rows || []).map((row) => {
    const ownerId = (row?.[ownerColumn] as string | null | undefined) || null;
    return {
      ...row,
      created_by: row?.created_by ?? ownerId,
      user_id: row?.user_id ?? ownerId,
    };
  });
}

export async function getVisibleRows({
  table,
  ownerColumn,
  currentUserId,
  select = "*",
  orderBy,
  ascending = false,
  extraEq = {},
}: VisibleRowsParams) {
  const queries: any[] = [];

  let publicQuery = supabase.from(table).select(select).eq("status", "public");
  publicQuery = publicQuery.is("deleted_at", null);
  Object.entries(extraEq).forEach(([key, value]) => {
    if (typeof value === "undefined") return;
    if (value === null) {
      publicQuery = publicQuery.is(key, null);
      return;
    }
    publicQuery = publicQuery.eq(key, value as never);
  });
  if (orderBy) publicQuery = publicQuery.order(orderBy, { ascending });
  queries.push(publicQuery);

  if (currentUserId) {
    let ownQuery: any = (supabase as any)
      .from(table)
      .select(select)
      .eq(ownerColumn, currentUserId);
    ownQuery = ownQuery.is("deleted_at", null);

    Object.entries(extraEq).forEach(([key, value]) => {
      if (typeof value === "undefined") return;
      if (value === null) {
        ownQuery = ownQuery.is(key, null);
        return;
      }
      ownQuery = ownQuery.eq(key, value as never);
    });
    if (orderBy) ownQuery = ownQuery.order(orderBy, { ascending });
    queries.push(ownQuery);

    const sharedOwnerIds = await getSharedOwnerIds(currentUserId);
    if (sharedOwnerIds.length > 0) {
      let sharedQuery: any = (supabase as any)
        .from(table)
        .select(select)
        .eq("status", "shared")
        .in(ownerColumn, sharedOwnerIds)
        .is("deleted_at", null);

      Object.entries(extraEq).forEach(([key, value]) => {
        if (typeof value === "undefined") return;
        if (value === null) {
          sharedQuery = sharedQuery.is(key, null);
          return;
        }
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

  const merged = results.flatMap(({ data }) => data || []);
  const dedup = new Map();
  merged.forEach((row) => {
    if (row?.id) dedup.set(row.id, row);
  });

  return Array.from(dedup.values());
}

export async function getVisibleRowById({
  table,
  ownerColumn,
  currentUserId,
  id,
  select = "*",
}) {
  const rows = await getVisibleRows({
    table,
    ownerColumn,
    currentUserId,
    select,
    extraEq: { id },
  });

  return rows[0] || null;
}

export async function assertVisibleRowById({
  table,
  ownerColumn,
  currentUserId,
  id,
  select = "*",
  label,
}) {
  const row = await getVisibleRowById({
    table,
    ownerColumn,
    currentUserId,
    id,
    select,
  });

  if (!row) {
    throw new Error(`${label || "Record"} not found or not accessible`);
  }

  return row;
}

export async function getOwnedRowById({
  table,
  ownerColumn,
  currentUserId,
  id,
  select = "*",
}) {
  if (!currentUserId) return null;

  let query: any = (supabase as any).from(table).select(select);
  query = query.eq("id", id);
  query = query.eq(ownerColumn, currentUserId);
  query = query.is("deleted_at", null);

  const { data, error } = await query.maybeSingle();

  if (error) throw new Error(error.message);
  return data || null;
}

export async function assertOwnedRowById({
  table,
  ownerColumn,
  currentUserId,
  id,
  select = "*",
  label,
}) {
  const row = await getOwnedRowById({
    table,
    ownerColumn,
    currentUserId,
    id,
    select,
  });

  if (!row) {
    throw new Error(`${label || "Record"} not found or not owned by you`);
  }

  return row;
}
