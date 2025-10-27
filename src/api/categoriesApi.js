import { supabase } from "../lib/supabaseClient";
import { getUserId } from "./usersApi";

// Get all categories (public + private for current user)
export async function getAllCategories() {
  const userId = getUserId();
  const { data: publicData, error } = await supabase
    .from("categories")
    .select("*")
    .eq("status", "public");
  if (error) throw new Error(error.message);
  if (!userId) return publicData;
  const { data: privateData, error: privateError } = await supabase
    .from("categories")
    .select("*")
    .eq("status", "private")
    .eq("created_by", userId);
  if (privateError) throw new Error(privateError.message);
  return publicData.concat(privateData);
}

// Get all categories for a specific vertical
export async function getVerticalCategories(verticalId) {
  const userId = getUserId();
  const { data: publicData, error } = await supabase
    .from("categories")
    .select("*")
    .eq("status", "public")
    .eq("vertical_id", verticalId);
  if (error) throw new Error(error.message);
  if (!userId) return publicData;
  const { data: privateData, error: privateError } = await supabase
    .from("categories")
    .select("*")
    .eq("status", "private")
    .eq("vertical_id", verticalId)
    .eq("created_by", userId);
  if (privateError) throw new Error(privateError.message);
  return publicData.concat(privateData);
}

// Get all products in a category
export async function getCategoryProducts(categoryId) {
  if (!categoryId) throw new Error("Category ID is required");

  const { data, error } = await supabase
    .from("category_products")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}
