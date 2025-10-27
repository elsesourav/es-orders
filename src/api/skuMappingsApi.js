import { supabase } from "../lib/supabaseClient";
import { getUserId } from "./usersApi";

// Get all SKU mappings for current user (with pagination support for large datasets)
export async function getAllSkuMappings() {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");

  // Fetch all records without limit using pagination
  let allData = [];
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("sku_mappings")
      .select("*")
      .eq("user_id", userId)
      .order("old_sku")
      .range(from, from + batchSize - 1);

    if (error) throw new Error(error.message);

    if (data && data.length > 0) {
      allData = [...allData, ...data];
      from += batchSize;
      hasMore = data.length === batchSize;
    } else {
      hasMore = false;
    }
  }

  console.log(`✅ Fetched ${allData.length} SKU mappings`);
  return allData;
}

// Get paginated SKU mappings for current user (for UI display)
export async function getPaginatedSkuMappings(page = 1, pageSize = 20) {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("sku_mappings")
    .select("*")
    .eq("user_id", userId)
    .order("old_sku")
    .range(from, to);

  if (error) throw new Error(error.message);

  console.log(`✅ Fetched page ${page} (${data?.length || 0} mappings)`);
  return data || [];
}

// Get all SKU mappings as an object (old_sku: new_sku)
export async function getSkuMappingsObject() {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");

  // Fetch all records without limit using pagination
  let allData = [];
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("sku_mappings")
      .select("old_sku, new_sku")
      .eq("user_id", userId)
      .range(from, from + batchSize - 1);

    if (error) throw new Error(error.message);

    if (data && data.length > 0) {
      allData = [...allData, ...data];
      from += batchSize;
      hasMore = data.length === batchSize;
    } else {
      hasMore = false;
    }
  }

  // Convert array to object
  const mappingsObject = {};
  allData.forEach((item) => {
    mappingsObject[item.old_sku] = item.new_sku;
  });

  console.log(`✅ Converted ${allData.length} SKU mappings to object`);
  return mappingsObject;
}

// Get a single SKU mapping by old_sku
export async function getSkuMapping(oldSku) {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");

  if (!oldSku) {
    throw new Error("old_sku is required");
  }

  const { data, error } = await supabase
    .from("sku_mappings")
    .select("*")
    .eq("user_id", userId)
    .eq("old_sku", oldSku)
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

// Get new_sku by old_sku (quick lookup)
export async function getNewSku(oldSku) {
  const mapping = await getSkuMapping(oldSku);
  return mapping?.new_sku || null;
}

// Add or update a single SKU mapping
export async function setSkuMapping({ oldSku, newSku }) {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");

  if (!oldSku || !newSku) {
    throw new Error("old_sku and new_sku are required");
  }

  const { data, error } = await supabase
    .from("sku_mappings")
    .upsert(
      {
        user_id: userId,
        old_sku: oldSku,
        new_sku: newSku,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,old_sku",
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Add or update multiple SKU mappings (bulk operation)
export async function setMultipleSkuMappings(mappings) {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");

  if (!Array.isArray(mappings) || mappings.length === 0) {
    throw new Error("mappings must be a non-empty array");
  }

  // Validate all mappings have required fields
  const invalidMappings = mappings.filter((m) => !m.oldSku || !m.newSku);
  if (invalidMappings.length > 0) {
    throw new Error("All mappings must have oldSku and newSku");
  }

  // Prepare data for upsert
  const mappingsData = mappings.map((m) => ({
    user_id: userId,
    old_sku: m.oldSku,
    new_sku: m.newSku,
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("sku_mappings")
    .upsert(mappingsData, {
      onConflict: "user_id,old_sku",
      ignoreDuplicates: false,
    })
    .select();

  if (error) throw new Error(error.message);

  console.log(`✅ Successfully saved ${data.length} SKU mappings`);
  return data;
}

// Import SKU mappings from JSON object (like xyz.json format)
export async function importSkuMappingsFromJson(jsonObject) {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");

  if (!jsonObject || typeof jsonObject !== "object") {
    throw new Error("Invalid JSON object");
  }

  const entries = Object.entries(jsonObject);
  if (entries.length === 0) {
    throw new Error("JSON object is empty");
  }

  console.log(`📦 Importing ${entries.length} SKU mappings...`);

  // Convert to array format
  const mappings = entries.map(([oldSku, newSku]) => ({
    oldSku,
    newSku,
  }));

  // Use batch processing for large imports (1000 per batch)
  const BATCH_SIZE = 1000;
  const totalBatches = Math.ceil(mappings.length / BATCH_SIZE);
  let totalImported = 0;

  for (let i = 0; i < totalBatches; i++) {
    const batchStart = i * BATCH_SIZE;
    const batchEnd = Math.min(batchStart + BATCH_SIZE, mappings.length);
    const batch = mappings.slice(batchStart, batchEnd);

    const batchData = batch.map((m) => ({
      user_id: userId,
      old_sku: m.oldSku,
      new_sku: m.newSku,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("sku_mappings")
      .upsert(batchData, {
        onConflict: "user_id,old_sku",
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error(`❌ Batch ${i + 1} failed:`, error);
      throw new Error(error.message);
    }

    totalImported += data.length;
    console.log(
      `✅ Batch ${i + 1}/${totalBatches} imported (${data.length} mappings)`
    );
  }

  console.log(`🎉 Successfully imported ${totalImported} SKU mappings`);
  return { success: true, totalImported };
}

// Update a single SKU mapping
export async function updateSkuMapping(oldSku, { newSku }) {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");

  if (!oldSku) {
    throw new Error("old_sku is required");
  }

  if (!newSku) {
    throw new Error("new_sku is required");
  }

  // Check if mapping exists
  const existing = await getSkuMapping(oldSku);
  if (!existing) {
    throw new Error("SKU mapping not found");
  }

  const { data, error } = await supabase
    .from("sku_mappings")
    .update({
      new_sku: newSku,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("old_sku", oldSku)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Delete a single SKU mapping
export async function deleteSkuMapping(oldSku) {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");

  if (!oldSku) {
    throw new Error("old_sku is required");
  }

  // Check if mapping exists
  const existing = await getSkuMapping(oldSku);
  if (!existing) {
    throw new Error("SKU mapping not found");
  }

  const { error } = await supabase
    .from("sku_mappings")
    .delete()
    .eq("user_id", userId)
    .eq("old_sku", oldSku);

  if (error) throw new Error(error.message);

  console.log(`✅ Successfully deleted SKU mapping: ${oldSku}`);
  return { success: true, message: "SKU mapping deleted successfully" };
}

// Delete multiple SKU mappings
export async function deleteMultipleSkuMappings(oldSkus) {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");

  if (!Array.isArray(oldSkus) || oldSkus.length === 0) {
    throw new Error("oldSkus must be a non-empty array");
  }

  const { error } = await supabase
    .from("sku_mappings")
    .delete()
    .eq("user_id", userId)
    .in("old_sku", oldSkus);

  if (error) throw new Error(error.message);

  console.log(`✅ Successfully deleted ${oldSkus.length} SKU mappings`);
  return {
    success: true,
    message: `${oldSkus.length} SKU mappings deleted successfully`,
  };
}

// Delete all SKU mappings for current user
export async function deleteAllSkuMappings() {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("sku_mappings")
    .delete()
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  console.log("✅ Successfully deleted all SKU mappings");
  return { success: true, message: "All SKU mappings deleted successfully" };
}

// Search SKU mappings by old_sku or new_sku pattern
export async function searchSkuMappings(searchTerm) {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");

  if (!searchTerm) {
    throw new Error("Search term is required");
  }

  // Fetch all matching records without limit using pagination
  let allData = [];
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("sku_mappings")
      .select("*")
      .eq("user_id", userId)
      .or(`old_sku.ilike.%${searchTerm}%,new_sku.ilike.%${searchTerm}%`)
      .order("old_sku")
      .range(from, from + batchSize - 1);

    if (error) throw new Error(error.message);

    if (data && data.length > 0) {
      allData = [...allData, ...data];
      from += batchSize;
      hasMore = data.length === batchSize;
    } else {
      hasMore = false;
    }
  }

  return allData;
}

// Search SKU mappings with pagination (for UI display)
export async function searchSkuMappingsPaginated(
  searchTerm,
  page = 1,
  pageSize = 20
) {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");

  if (!searchTerm) {
    throw new Error("Search term is required");
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("sku_mappings")
    .select("*")
    .eq("user_id", userId)
    .or(`old_sku.ilike.%${searchTerm}%,new_sku.ilike.%${searchTerm}%`)
    .order("old_sku")
    .range(from, to);

  if (error) throw new Error(error.message);
  return data || [];
}

// Get total count of SKU mappings for current user
export async function getSkuMappingsCount() {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");

  const { count, error } = await supabase
    .from("sku_mappings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return count || 0;
}

// Export all SKU mappings to JSON object format
export async function exportSkuMappingsToJson() {
  const mappings = await getSkuMappingsObject();
  return mappings;
}

// Replace all SKU mappings (delete old ones and insert new ones)
export async function replaceAllSkuMappings(jsonObject) {
  const userId = getUserId();
  if (!userId) throw new Error("Not authenticated");

  console.log("🧹 Deleting all existing SKU mappings...");
  await deleteAllSkuMappings();

  console.log("📦 Importing new SKU mappings...");
  return await importSkuMappingsFromJson(jsonObject);
}
