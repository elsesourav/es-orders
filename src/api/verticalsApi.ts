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
  };

  const { data, error } = await supabase
    .from("verticals")
    .update(patch)
    .eq("id", id)
    .eq("created_by", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return toVerticalShape(data);
}

export async function deleteVertical(id) {
  const userId = requireUserId();
  const { error } = await supabase
    .from("verticals")
    .delete()
    .eq("id", id)
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
  const { data, error } = await supabase
    .from("verticals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? toVerticalShape(data) : null;
}
