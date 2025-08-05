import { supabase } from "../lib/supabaseClient";
import { getUserId } from "./usersApi";

// Create a new product group
export async function createProductGroup({
   name,
   baseFormDataId,
   productIds = [],
}) {
   const created_by = getUserId();
   if (!created_by) throw new Error("Not authenticated");

   const { data, error } = await supabase
      .from("product_groups")
      .insert([
         {
            name,
            base_form_data_id: baseFormDataId,
            product_ids: productIds,
            created_by,
         },
      ])
      .select()
      .single();

   if (error) throw new Error(error.message);
   return data;
}

// Update a product group (only by owner)
export async function updateProductGroup(id, updates) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");

   // Check if user owns the group
   const { data: group, error } = await supabase
      .from("product_groups")
      .select("*")
      .eq("id", id)
      .single();

   if (error) throw new Error(error.message);
   if (group.created_by !== userId) throw new Error("Not authorized");

   const { data: updated, error: updateError } = await supabase
      .from("product_groups")
      .update({
         ...updates,
         updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

   if (updateError) throw new Error(updateError.message);
   return updated;
}

// Delete a product group (only by owner)
export async function deleteProductGroup(id) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");

   // Check if user owns the group
   const { data: group, error } = await supabase
      .from("product_groups")
      .select("*")
      .eq("id", id)
      .single();

   if (error) throw new Error(error.message);
   if (group.created_by !== userId) throw new Error("Not authorized");

   const { error: deleteError } = await supabase
      .from("product_groups")
      .delete()
      .eq("id", id);

   if (deleteError) throw new Error(deleteError.message);
   return { success: true };
}

// Get all product groups for current user
export async function getUserProductGroups() {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");

   const { data, error } = await supabase
      .from("product_groups")
      .select(
         `
         *,
         base_form_data:base_form_data_id (
            id,
            name,
            label
         )
      `
      )
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

   if (error) throw new Error(error.message);
   return data || [];
}

// Get specific product group by ID
export async function getProductGroup(id) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");

   const { data, error } = await supabase
      .from("product_groups")
      .select(
         `
         *,
         base_form_data:base_form_data_id (
            id,
            name,
            label
         )
      `
      )
      .eq("id", id)
      .eq("created_by", userId)
      .single();

   if (error) throw new Error(error.message);
   return data;
}

// Add products to existing group
export async function addProductsToGroup(groupId, productIds) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");

   // Get current group
   const { data: group, error } = await supabase
      .from("product_groups")
      .select("product_ids, created_by")
      .eq("id", groupId)
      .single();

   if (error) throw new Error(error.message);
   if (group.created_by !== userId) throw new Error("Not authorized");

   // Merge new product IDs with existing ones (avoid duplicates)
   const currentIds = new Set(group.product_ids || []);
   productIds.forEach((id) => currentIds.add(id));
   const updatedIds = Array.from(currentIds);

   const { data: updated, error: updateError } = await supabase
      .from("product_groups")
      .update({
         product_ids: updatedIds,
         updated_at: new Date().toISOString(),
      })
      .eq("id", groupId)
      .select()
      .single();

   if (updateError) throw new Error(updateError.message);
   return updated;
}

// Remove products from group
export async function removeProductsFromGroup(groupId, productIds) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");

   // Get current group
   const { data: group, error } = await supabase
      .from("product_groups")
      .select("product_ids, created_by")
      .eq("id", groupId)
      .single();

   if (error) throw new Error(error.message);
   if (group.created_by !== userId) throw new Error("Not authorized");

   // Remove specified product IDs
   const currentIds = group.product_ids || [];
   const idsToRemove = new Set(productIds);
   const updatedIds = currentIds.filter((id) => !idsToRemove.has(id));

   const { data: updated, error: updateError } = await supabase
      .from("product_groups")
      .update({
         product_ids: updatedIds,
         updated_at: new Date().toISOString(),
      })
      .eq("id", groupId)
      .select()
      .single();

   if (updateError) throw new Error(updateError.message);
   return updated;
}

// Replace all products in group
export async function setGroupProducts(groupId, productIds) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");

   // Check if user owns the group
   const { data: group, error } = await supabase
      .from("product_groups")
      .select("created_by")
      .eq("id", groupId)
      .single();

   if (error) throw new Error(error.message);
   if (group.created_by !== userId) throw new Error("Not authorized");

   const { data: updated, error: updateError } = await supabase
      .from("product_groups")
      .update({
         product_ids: productIds,
         updated_at: new Date().toISOString(),
      })
      .eq("id", groupId)
      .select()
      .single();

   if (updateError) throw new Error(updateError.message);
   return updated;
}

// Get product group by name for current user
export async function getProductGroupByName(name) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");

   const { data, error } = await supabase
      .from("product_groups")
      .select(
         `
         *,
         base_form_data:base_form_data_id (
            id,
            name,
            label
         )
      `
      )
      .eq("name", name)
      .eq("created_by", userId)
      .single();

   if (error && error.code !== "PGRST116") throw new Error(error.message);
   return data;
}
