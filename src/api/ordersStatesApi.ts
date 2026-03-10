import { supabase } from "../lib/supabaseClient";
import { getVisibleRows, mapLegacyVisibilityRows } from "./_visibility";
import { getUserId } from "./usersApi";

function requireUserId() {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

function mapOrderState(row) {
  return {
    ...row,
    order_data: row.state_data,
  };
}

export async function createOrderState(stateData) {
  const userId = requireUserId();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("orders_states")
    .insert([
      {
        user_id: userId,
        state_data: stateData,
        status: "shared",
        updated_at: now,
        updated_by: userId,
      },
    ])
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapOrderState(mapLegacyVisibilityRows([data], "user_id")[0]);
}

export async function listOrderStates() {
  const rows = await getVisibleRows({
    table: "orders_states",
    ownerColumn: "user_id",
    currentUserId: getUserId(),
    orderBy: "created_at",
    ascending: false,
    extraEq: { deleted_at: null },
  });

  return mapLegacyVisibilityRows(rows, "user_id").map(mapOrderState);
}

export async function getOrderStateById(id) {
  const rows = await getVisibleRows({
    table: "orders_states",
    ownerColumn: "user_id",
    currentUserId: getUserId(),
    extraEq: { id, deleted_at: null },
  });

  const row = rows[0];
  return row
    ? mapOrderState(mapLegacyVisibilityRows([row], "user_id")[0])
    : null;
}

export async function updateOrderState(id, stateData) {
  const userId = requireUserId();

  const { data, error } = await supabase
    .from("orders_states")
    .update({
      state_data: stateData,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    })
    .eq("id", id)
    .is("deleted_at", null)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapOrderState(mapLegacyVisibilityRows([data], "user_id")[0]);
}

export async function deleteOrderState(id) {
  const userId = requireUserId();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("orders_states")
    .update({ deleted_at: now, updated_at: now, updated_by: userId })
    .eq("id", id)
    .is("deleted_at", null)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function listOrderStatesByDateRange(startDate, endDate) {
  const userId = requireUserId();

  const { data, error } = await supabase
    .from("orders_states")
    .select("*")
    .is("deleted_at", null)
    .eq("user_id", userId)
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows(data || [], "user_id").map(mapOrderState);
}

export async function listRecentOrderStates(limit = 5) {
  const rows = await listOrderStates();
  return rows.slice(0, limit);
}

export async function searchOrderStates(searchTerm) {
  const rows = await listOrderStates();
  if (!String(searchTerm || "").trim()) return rows;

  const term = String(searchTerm).toLowerCase();
  return rows.filter((row) =>
    JSON.stringify(row.order_data || {})
      .toLowerCase()
      .includes(term),
  );
}

export async function countOrderStates() {
  const rows = await listOrderStates();
  return rows.length;
}

export async function createManyOrderStates(ordersArray) {
  const userId = requireUserId();
  const now = new Date().toISOString();

  if (!ordersArray?.length) return [];

  const payload = ordersArray.map((orderData) => ({
    user_id: userId,
    state_data: orderData,
    status: "shared",
    updated_at: now,
    updated_by: userId,
  }));

  const { data, error } = await supabase
    .from("orders_states")
    .insert(payload)
    .select("*");

  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows(data || [], "user_id").map(mapOrderState);
}

export async function listDeletedOrderStates() {
  const userId = requireUserId();

  const { data, error } = await supabase
    .from("orders_states")
    .select("*")
    .eq("user_id", userId)
    .not("deleted_at", "is", null)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows(data || [], "user_id").map(mapOrderState);
}

export async function restoreOrderState(id) {
  const userId = requireUserId();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("orders_states")
    .update({ deleted_at: null, updated_at: now, updated_by: userId })
    .eq("id", id)
    .eq("user_id", userId)
    .not("deleted_at", "is", null)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapOrderState(mapLegacyVisibilityRows([data], "user_id")[0]);
}
