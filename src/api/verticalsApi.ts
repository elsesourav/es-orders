import { supabase } from "../lib/supabaseClient";
import { getVisibleRows, mapLegacyVisibilityRows } from "./_visibility";
import { getUserId } from "./usersApi";

function requireUserId() {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

function getNowIso() {
  return new Date().toISOString();
}

function toVerticalShape(row) {
  return {
    ...row,
    verticalSku: row?.verticalSku || "",
  };
}

export async function createVertical({
  verticalSku,
  label,
  status = "shared",
}) {
  const userId = requireUserId();
  const now = getNowIso();

  const { data, error } = await supabase
    .from("verticals")
    .insert([
      {
        verticalSku,
        label: label || null,
        status,
        created_by: userId,
        created_at: now,
        updated_at: now,
        updated_by: userId,
      },
    ])
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return toVerticalShape(data);
}

export async function updateVertical(id, updates) {
  const userId = requireUserId();
  const patch = {
    ...updates,
    updated_at: getNowIso(),
    updated_by: userId,
  };

  const { data, error } = await supabase
    .from("verticals")
    .update(patch)
    .eq("id", id)
    .is("deleted_at", null)
    .eq("created_by", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return toVerticalShape(data);
}

export async function deleteVertical(id) {
  const userId = requireUserId();
  const now = getNowIso();

  const { error } = await supabase
    .from("verticals")
    .update({ deleted_at: now, updated_at: now, updated_by: userId })
    .eq("id", id)
    .is("deleted_at", null)
    .eq("created_by", userId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function getAllVerticals() {
  const rows = await getVisibleRows({
    table: "verticals",
    ownerColumn: "created_by",
    currentUserId: getUserId(),
    orderBy: "created_at",
    ascending: false,
  });

  return mapLegacyVisibilityRows(rows, "created_by").map(toVerticalShape);
}

export async function getVerticalById(id) {
  const rows = await getVisibleRows({
    table: "verticals",
    ownerColumn: "created_by",
    currentUserId: getUserId(),
    extraEq: { id },
  });

  return rows[0] ? toVerticalShape(rows[0]) : null;
}

export async function listDeletedVerticals() {
  const userId = requireUserId();

  const { data, error } = await supabase
    .from("verticals")
    .select("*")
    .eq("created_by", userId)
    .not("deleted_at", "is", null)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows(data || [], "created_by").map(toVerticalShape);
}

export async function restoreVertical(id) {
  const userId = requireUserId();
  const now = getNowIso();

  const { data, error } = await supabase
    .from("verticals")
    .update({ deleted_at: null, updated_at: now, updated_by: userId })
    .eq("id", id)
    .eq("created_by", userId)
    .not("deleted_at", "is", null)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return toVerticalShape(data);
}
