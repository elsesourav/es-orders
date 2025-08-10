import { getUserId } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";

// Create a new product
export async function createProduct({
   name,
   label,
   status = "public",
   vertical_id,
   category_id,
   price,
   quantity_per_kg,
   sku_id,
   increment_per_rupee,
   self_life,
}) {
   const created_by = await getUserId();
   if (!created_by) throw new Error("Not authenticated");

   // Validate required SKU ID
   if (!sku_id?.trim()) throw new Error("SKU ID is required");

   const { data, error } = await supabase
      .from("products")
      .insert([
         {
            name,
            label,
            status,
            vertical_id,
            category_id,
            created_by,
            price,
            quantity_per_kg,
            sku_id: sku_id.trim(),
            increment_per_rupee,
            self_life,
         },
      ])
      .select()
      .single();

   if (error) {
      if (error.code === "23505" && error.details?.includes("sku_id")) {
         throw new Error("SKU ID already exists. Please use a unique SKU ID.");
      }
      throw new Error(error.message);
   }
   return data;
}

// Update a product (only by owner)
export async function updateProduct(id, updates) {
   const userId = await getUserId();
   if (!userId) throw new Error("Not authenticated");

   const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");

   // Validate SKU ID if it's being updated
   if (updates.sku_id !== undefined && !updates.sku_id?.trim()) {
      throw new Error("SKU ID is required");
   }

   // Process SKU ID trimming if provided
   const processedUpdates = { ...updates };
   if (processedUpdates.sku_id !== undefined) {
      processedUpdates.sku_id = processedUpdates.sku_id.trim();
   }

   const { data: updated, error: updateError } = await supabase
      .from("products")
      .update(processedUpdates)
      .eq("id", id)
      .select()
      .single();

   if (updateError) {
      if (
         updateError.code === "23505" &&
         updateError.details?.includes("sku_id")
      ) {
         throw new Error("SKU ID already exists. Please use a unique SKU ID.");
      }
      throw new Error(updateError.message);
   }
   return updated;
}

// Delete a product (only by owner)
export async function deleteProduct(id) {
   const userId = await getUserId();
   if (!userId) throw new Error("Not authenticated");

   const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");

   const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

   if (deleteError) throw new Error(deleteError.message);
   return { success: true };
}

// Get all products (public + private for current user)
export async function getAllProducts() {
   const userId = await getUserId();

   const { data: publicData, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", "public");

   if (error) throw new Error(error.message);

   if (!userId) return publicData;

   const { data: privateData, error: privateError } = await supabase
      .from("products")
      .select("*")
      .eq("status", "private")
      .eq("created_by", userId);

   if (privateError) throw new Error(privateError.message);
   return publicData.concat(privateData);
}

// Get product by SKU ID
export async function getProductBySku(sku_id) {
   if (!sku_id?.trim()) throw new Error("SKU ID is required");

   const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("sku_id", sku_id.trim())
      .single();

   if (error) {
      if (error.code === "PGRST116") {
         // No rows returned
         return null;
      }
      throw new Error(error.message);
   }
   return data;
}

// Get multiple products by SKU IDs
export async function getProductsBySkus(sku_ids) {
   if (!Array.isArray(sku_ids) || sku_ids.length === 0) {
      return [];
   }

   const trimmedSkus = sku_ids.map((sku) => sku?.trim()).filter(Boolean);
   if (trimmedSkus.length === 0) return [];

   const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("sku_id", trimmedSkus);

   if (error) throw new Error(error.message);
   return data || [];
}
