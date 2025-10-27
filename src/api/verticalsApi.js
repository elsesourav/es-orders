import { supabase } from "../lib/supabaseClient";
import { getUserId } from "./usersApi";

// Get all verticals (public + private for current user)
export async function getAllVerticals() {
  const userId = getUserId();
  const { data: publicData, error } = await supabase
    .from("verticals")
    .select("*")
    .eq("status", "public");
  if (error) throw new Error(error.message);
  if (!userId) return publicData;
  const { data: privateData, error: privateError } = await supabase
    .from("verticals")
    .select("*")
    .eq("status", "private")
    .eq("created_by", userId);
  if (privateError) throw new Error(privateError.message);
  return publicData.concat(privateData);
}
