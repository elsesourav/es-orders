import type { ApiRecord, ApiUpdate, VisibilityStatus } from "@/types/api";
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

function withLegacyAliases(row: ApiRecord) {
  return {
    ...row,
    group_variant_id:
      (row.group_variant_id as string | null | undefined) ??
      (row.group_id as string | null | undefined) ??
      null,
    base_forms_id:
      (row.base_forms_id as string | null | undefined) ??
      (row.group_id as string | null | undefined) ??
      null,
  };
}

export async function createListingTemplate(input: {
  name: string;
  color?: string;
  json?: unknown;
  group_id?: string | null;
  group_variant_id?: string | null;
  base_forms_id?: string | null;
  prompt_id?: string | null;
  status?: VisibilityStatus;
}) {
  const userId = requireUserId();
  const now = getNowIso();
  const { data, error } = await supabase
    .from("listing_template")
    .insert([
      {
        name: input.name,
        color: input.color || null,
        json: input.json || null,
        group_id:
          input.group_id ||
          input.group_variant_id ||
          input.base_forms_id ||
          null,
        prompt_id: input.prompt_id || null,
        status: input.status || "shared",
        user_id: userId,
        created_at: now,
        updated_at: now,
      },
    ])
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return withLegacyAliases(
    mapLegacyVisibilityRows([data], "user_id")[0] as ApiRecord,
  );
}

export async function updateListingTemplate(id: string, updates: ApiUpdate) {
  const userId = requireUserId();
  const normalizedUpdates: ApiUpdate = { ...updates };

  if (typeof normalizedUpdates.group_variant_id !== "undefined") {
    normalizedUpdates.group_id = normalizedUpdates.group_variant_id as
      | string
      | null;
    delete normalizedUpdates.group_variant_id;
  }
  if (typeof normalizedUpdates.base_forms_id !== "undefined") {
    normalizedUpdates.group_id = normalizedUpdates.base_forms_id as
      | string
      | null;
    delete normalizedUpdates.base_forms_id;
  }

  const patch: ApiUpdate = {
    ...normalizedUpdates,
    updated_at: getNowIso(),
  };
  const { data, error } = await supabase
    .from("listing_template")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return withLegacyAliases(
    mapLegacyVisibilityRows([data], "user_id")[0] as ApiRecord,
  );
}

export async function deleteListingTemplate(id: string) {
  const userId = requireUserId();
  const { error } = await supabase
    .from("listing_template")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function listListingTemplates() {
  const rows = await getVisibleRows({
    table: "listing_template",
    ownerColumn: "user_id",
    currentUserId: getUserId(),
    orderBy: "created_at",
    ascending: false,
  });
  return mapLegacyVisibilityRows(rows, "user_id").map((row) =>
    withLegacyAliases(row as ApiRecord),
  );
}
