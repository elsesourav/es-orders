import { supabase } from "../lib/supabaseClient";

export async function getSharedOwnerIds(userId) {
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
        .filter((value) => Boolean(value)),
    ),
  );
}

export function mapLegacyVisibilityRows(rows, ownerColumn) {
  return (rows || []).map((row) => {
    const ownerId = row?.[ownerColumn] || null;
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
}) {
  const queries: any[] = [];

  let publicQuery = supabase.from(table).select(select).eq("status", "public");
  Object.entries(extraEq).forEach(([key, value]) => {
    publicQuery = publicQuery.eq(key, value);
  });
  if (orderBy) publicQuery = publicQuery.order(orderBy, { ascending });
  queries.push(publicQuery);

  if (currentUserId) {
    let ownQuery: any = (supabase as any)
      .from(table)
      .select(select)
      .eq(ownerColumn, currentUserId);

    Object.entries(extraEq).forEach(([key, value]) => {
      ownQuery = ownQuery.eq(key, value);
    });
    if (orderBy) ownQuery = ownQuery.order(orderBy, { ascending });
    queries.push(ownQuery);

    const sharedOwnerIds = await getSharedOwnerIds(currentUserId);
    if (sharedOwnerIds.length > 0) {
      let sharedQuery: any = (supabase as any)
        .from(table)
        .select(select)
        .eq("status", "shared")
        .in(ownerColumn, sharedOwnerIds);

      Object.entries(extraEq).forEach(([key, value]) => {
        sharedQuery = sharedQuery.eq(key, value);
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
