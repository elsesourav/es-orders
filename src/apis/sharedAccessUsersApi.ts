import { supabase } from "@lib/supabaseClient";
import { getUserId } from "./usersApi";

function requireUserId() {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function grantSharedAccess(sharedWithUserId: string) {
  const ownerUserId = requireUserId();
  const { data, error } = await supabase
    .from("shared_access_users")
    .upsert(
      {
        owner_user_id: ownerUserId,
        shared_with_user_id: sharedWithUserId,
        is_active: true,
      },
      { onConflict: "owner_user_id,shared_with_user_id" },
    )
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function revokeSharedAccess(sharedWithUserId: string) {
  const ownerUserId = requireUserId();
  const { error } = await supabase
    .from("shared_access_users")
    .update({ is_active: false })
    .eq("owner_user_id", ownerUserId)
    .eq("shared_with_user_id", sharedWithUserId);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function listSharedUsersByOwner() {
  const ownerUserId = requireUserId();
  const { data, error } = await supabase
    .from("shared_access_users")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function listSharedOwnerIdsForCurrentUser() {
  const userId = requireUserId();
  const { data, error } = await supabase
    .from("shared_access_users")
    .select("owner_user_id")
    .eq("shared_with_user_id", userId)
    .eq("is_active", true);
  if (error) throw new Error(error.message);
  return [
    ...new Set((data || []).map((row) => row.owner_user_id).filter(Boolean)),
  ];
}
