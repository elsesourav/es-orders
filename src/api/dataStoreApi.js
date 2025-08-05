import { supabase } from "../lib/supabaseClient";
import { getUserId } from "./usersApi";

// Create a new data store entry
export async function createDataStore({ data }) {
   const created_by = getUserId();

   console.log({ data, created_by });
   if (!created_by) throw new Error("Not authenticated");
   const { data: created, error } = await supabase
      .from("data_store")
      .insert([{ data, created_by }])
      .select()
      .single();
   if (error) throw new Error(error.message);
   return created;
}

// Update a data store entry (only by owner)
export async function updateDataStore(id, updates) {

   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");
   const { data: existing, error: fetchError } = await supabase
      .from("data_store")
      .select("*")
      .eq("id", id)
      .single();
   if (fetchError) throw new Error(fetchError.message);
   if (existing.created_by !== userId) throw new Error("Not authorized");

   const { data, error } = await supabase
      .from("data_store")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
   
   if (error) throw new Error(error.message);
   return data;
}

// Delete a data store entry (only by owner)
export async function deleteDataStore(id) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");
   const { data, error: fetchError } = await supabase
      .from("data_store")
      .select("*")
      .eq("id", id)
      .single();
   if (fetchError) throw new Error(fetchError.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   const { error } = await supabase.from("data_store").delete().eq("id", id);
   if (error) throw new Error(error.message);
   return { success: true };
}

// Get all data store entries
export async function getAllDataStores() {
   const { data, error } = await supabase.from("data_store").select("*");
   if (error) throw new Error(error.message);
   return data;
}

// Get specific data store entry by ID
export async function getDataStore(id) {
   const { data, error } = await supabase
      .from("data_store")
      .select("*")
      .eq("id", id)
      .single();

   if (error) throw new Error(error.message);
   return data;
}
