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

export async function createPrompt(input: {
  name: string;
  value?: string;
  status?: VisibilityStatus;
}) {
  const userId = requireUserId();
  const now = getNowIso();
  const { data, error } = await supabase
    .from("prompt")
    .insert([
      {
        name: input.name,
        value: input.value || null,
        status: input.status || "shared",
        user_id: userId,
        created_at: now,
        updated_at: now,
      },
    ])
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows([data], "user_id")[0];
}

export async function updatePrompt(id: string, updates: ApiUpdate) {
  const userId = requireUserId();
  const patch: ApiUpdate = {
    ...updates,
    updated_at: getNowIso(),
  };
  const { data, error } = await supabase
    .from("prompt")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapLegacyVisibilityRows([data], "user_id")[0];
}

export async function deletePrompt(id: string) {
  const userId = requireUserId();
  const { error } = await supabase
    .from("prompt")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function getAllPrompts() {
  const rows = await getVisibleRows({
    table: "prompt",
    ownerColumn: "user_id",
    currentUserId: getUserId(),
    orderBy: "created_at",
    ascending: false,
  });
  return mapLegacyVisibilityRows(rows, "user_id");
}
