import type { ApiUpdate, VisibilityStatus } from "@/types/api";
import { supabase } from "@lib/supabaseClient";
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

function toVerticalShape<T extends Record<string, unknown>>(row: T): T {
  return {
    ...row,
    verticalSku: (row.verticalSku as string | undefined) || "",
  } as T;
}

export async function createVertical(input: {
  verticalSku: string;
  label?: string;
  status?: VisibilityStatus;
}) {
  const userId = requireUserId();
  const now = getNowIso();
  const payload = {
    verticalSku: input.verticalSku,
    label: input.label || null,
    status: input.status || "shared",
    created_by: userId,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("verticals")
    .insert([payload])
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return toVerticalShape(data as Record<string, unknown>);
}

export async function updateVertical(id: string, updates: ApiUpdate) {
  const userId = requireUserId();
  const patch: ApiUpdate = {
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
  return toVerticalShape(data as Record<string, unknown>);
}

export async function deleteVertical(id: string) {
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
  return mapLegacyVisibilityRows(rows, "created_by").map((row) =>
    toVerticalShape(row as Record<string, unknown>),
  );
}

export async function getVerticalById(id: string) {
  const { data, error } = await supabase
    .from("verticals")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toVerticalShape(data as Record<string, unknown>) : null;
}
