import type { ApiRecord } from "@/types/api";
import { supabase } from "@lib/supabaseClient";
import { getVisibleRows, mapLegacyVisibilityRows } from "./_visibility";
import { getUserId } from "./usersApi";

function requireUserId() {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

function mapOrderState(row: ApiRecord) {
  return {
    ...row,
    order_data: row.state_data,
  };
}

export async function createOrderState(stateData: unknown) {
  const userId = requireUserId();
  const { data, error } = await supabase
    .from("orders_states")
    .insert([{ user_id: userId, state_data: stateData, status: "shared" }])
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
  });
  return mapLegacyVisibilityRows(rows, "user_id").map(mapOrderState);
}

export async function getOrderStateById(id: string) {
  const { data, error } = await supabase
    .from("orders_states")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data
    ? mapOrderState(mapLegacyVisibilityRows([data], "user_id")[0])
    : null;
}

export async function updateOrderState(id: string, stateData: unknown) {
  const userId = requireUserId();
  const { data, error } = await supabase
    .from("orders_states")
    .update({ state_data: stateData })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapOrderState(mapLegacyVisibilityRows([data], "user_id")[0]);
}

export async function deleteOrderState(id: string) {
  const userId = requireUserId();
  const { error } = await supabase
    .from("orders_states")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function listOrderStatesByDateRange(
  startDate: string,
  endDate: string,
) {
  const userId = requireUserId();
  const { data, error } = await supabase
    .from("orders_states")
    .select("*")
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

export async function searchOrderStates(searchTerm: string) {
  const rows = await listOrderStates();
  if (!searchTerm?.trim()) return rows;

  const term = searchTerm.toLowerCase();
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

export async function createManyOrderStates(ordersArray: unknown[]) {
  const userId = requireUserId();
  if (!ordersArray?.length) return [];

  const payload = ordersArray.map((orderData) => ({
    user_id: userId,
    state_data: orderData,
    status: "shared",
  }));

  const { data, error } = await supabase
    .from("orders_states")
    .insert(payload)
    .select("*");
  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows(data || [], "user_id").map(mapOrderState);
}
