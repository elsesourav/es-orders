import { supabase } from "../lib/supabaseClient";
import { getUserId } from "./usersApi";

// USER_DATA TABLE API

// Get user data by name (for current user) - Enhanced to handle chunked data
export async function getUserData(name, isNeedProducts) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");

   const { data, error } = await supabase
      .from("user_data")
      .select("*")
      .eq("user_id", userId)
      .eq("name", name)
      .single();

   if (error && error.code !== "PGRST116") {
      throw new Error(error.message);
   }

   if (!data) return null;
   
   // Check if data was chunked using our client-side approach
   if (data?.data?.isChunked && isNeedProducts) {
      console.log("🔄 Reconstructing chunked data...");
      return await reconstructClientChunkedData(userId, name, data);
   }
   
   return data;
}

// Reconstruct client-side chunked data
async function reconstructClientChunkedData(userId, name, metadata) {
   try {
      const { totalChunks } = metadata.data;
      console.log(`📦 Reconstructing ${totalChunks} chunks...`);

      const { data: chunks, error } = await supabase
         .from("user_data")
         .select("*")
         .eq("user_id", userId)
         .like("name", `${name}_chunk_%`)
         .order("name");

      if (error) {
         console.error("Error fetching chunks:", error);
         return metadata;
      }

      if (!chunks || chunks.length === 0) {
         console.warn("No chunks found");
         return metadata;
      }

      // Reconstruct the data
      let reconstructedData = {};
      chunks.forEach((chunk) => {
         const chunkData = chunk.data?.chunkData || {};
         reconstructedData = { ...reconstructedData, ...chunkData };
      });

      metadata.data.data = reconstructedData;
      return metadata;
   } catch (error) {
      console.error("Error reconstructing chunked data:", error);
      return metadata;
   }
}

// Get all user data for current user
export async function getAllUserData() {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");

   const { data, error } = await supabase
      .from("user_data")
      .select("*")
      .eq("user_id", userId)
      .order("name");

   if (error) throw new Error(error.message);

   // Handle chunked data for all entries
   if (data && data.length > 0) {
      const processedData = await Promise.all(
         data.map(async (item) => {
            if (item.data?.isChunked) {
               return await reconstructClientChunkedData(
                  userId,
                  item.name,
                  item
               );
            }
            return item;
         })
      );
      return processedData;
   }

   return data;
}

// Set/Create user data (upsert operation) - Simple and reliable approach
export async function setUserData({ name, data }) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");

   if (!name || !data) {
      throw new Error("Name and data are required");
   }

   // For very large data (>5MB), use client-side chunking
   return await saveDataInChunks(userId, name, data);
}

// Client-side chunking approach - more reliable
async function saveDataInChunks(userId, name, data) {
   const CHUNK_SIZE = 10000; // Save 10000 items per chunk
   const dataEntries = Object.entries(data.data || data);
   const totalChunks = Math.ceil(dataEntries.length / CHUNK_SIZE);

   console.log(
      `📦 Splitting into ${totalChunks} chunks of ${CHUNK_SIZE} items each`
   );

   // Delete existing chunks first (clean slate)
   console.log("🧹 Cleaning up existing chunks...");
   await supabase
      .from("user_data")
      .delete()
      .eq("user_id", userId)
      .like("name", `${name}_chunk_%`);

   // Delete existing main record
   await supabase
      .from("user_data")
      .delete()
      .eq("user_id", userId)
      .eq("name", name);

   // Save metadata
   const metadata = {
      isChunked: true,
      totalChunks,
      chunkSize: CHUNK_SIZE,
      totalItems: dataEntries.length,
      count: data.count,
      fetchedAt: data.fetchedAt,
      sellerInfo: data.sellerInfo,
   };

   const { data: metaResult, error: metaError } = await supabase
      .from("user_data")
      .upsert(
         {
            user_id: userId,
            name,
            data: metadata,
            updated_at: new Date().toISOString(),
         },
         {
            onConflict: "user_id,name",
            ignoreDuplicates: false,
         }
      )
      .select()
      .single();

   if (metaError) throw new Error(metaError.message);

   // Save chunks using upsert
   for (let i = 0; i < totalChunks; i++) {
      const chunkStart = i * CHUNK_SIZE;
      const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, dataEntries.length);
      const chunkData = Object.fromEntries(
         dataEntries.slice(chunkStart, chunkEnd)
      );

      const { error: chunkError } = await supabase.from("user_data").upsert(
         {
            user_id: userId,
            name: `${name}_chunk_${i}`,
            data: { chunkIndex: i, chunkData },
            updated_at: new Date().toISOString(),
         },
         {
            onConflict: "user_id,name",
            ignoreDuplicates: false,
         }
      );

      if (chunkError) {
         console.error(`Failed to save chunk ${i}:`, chunkError);
         // Continue with other chunks
      } else {
         console.log(`✅ Saved chunk ${i + 1}/${totalChunks}`);
      }
   }

   console.log(`🎉 Successfully saved all ${totalChunks} chunks`);
   return metaResult;
}

// Update user data (partial update)
export async function updateUserData(name, updates) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");

   if (!name) {
      throw new Error("Name is required");
   }

   // Check if the record exists and belongs to the user
   const { data: existing, error: fetchError } = await supabase
      .from("user_data")
      .select("*")
      .eq("user_id", userId)
      .eq("name", name)
      .single();

   if (fetchError) {
      if (fetchError.code === "PGRST116") {
         throw new Error("User data not found");
      }
      throw new Error(fetchError.message);
   }

   // Merge existing data with updates if updates.data is provided
   let updatedData = updates.data;
   if (updates.data && existing.data) {
      updatedData = { ...existing.data, ...updates.data };
   }

   const { data, error } = await supabase
      .from("user_data")
      .update({
         ...updates,
         ...(updatedData && { data: updatedData }),
         updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("name", name)
      .select()
      .single();

   if (error) throw new Error(error.message);
   return data;
}

// Delete user data by name - Enhanced to handle chunked data
export async function deleteUserData(name) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");

   if (!name) {
      throw new Error("Name is required");
   }

   // Check if the record exists and belongs to the user
   const { data: existing, error: fetchError } = await supabase
      .from("user_data")
      .select("*")
      .eq("user_id", userId)
      .eq("name", name)
      .single();

   if (fetchError) {
      if (fetchError.code === "PGRST116") {
         throw new Error("User data not found");
      }
      throw new Error(fetchError.message);
   }

   // Delete client-side chunks if they exist
   if (existing.data?.isChunked) {
      console.log("🧹 Cleaning up client-side chunks...");
      await supabase
         .from("user_data")
         .delete()
         .eq("user_id", userId)
         .like("name", `${name}_chunk_%`);
   }

   // Delete the main record
   const { error } = await supabase
      .from("user_data")
      .delete()
      .eq("user_id", userId)
      .eq("name", name);

   if (error) throw new Error(error.message);

   console.log("✅ Successfully deleted user data and all chunks");
   return { success: true, message: "User data deleted successfully" };
}
