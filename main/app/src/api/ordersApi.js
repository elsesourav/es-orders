import { getUserId } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";

/**
 * Create a new order
 * @param {Object} orderData - The order data to store (as JSON)
 * @returns {Promise<Object>} Created order object
 */
export async function createOrder(orderData) {
   if (!orderData || typeof orderData !== "object") {
      throw new Error("Valid order data is required");
   }

   const user_id = await getUserId();
   if (!user_id) throw new Error("Not authenticated");

   const { data, error } = await supabase
      .from("orders")
      .insert([
         {
            user_id,
            order_data: orderData,
         },
      ])
      .select()
      .single();

   if (error) throw new Error(error.message);
   return data;
}

/**
 * Get all orders for the current user
 * @returns {Promise<Array>} Array of order objects
 */
export async function getAllOrders() {
   const user_id = await getUserId();
   if (!user_id) throw new Error("Not authenticated");

   const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

   if (error) throw new Error(error.message);
   return data || [];
}

/**
 * Get a specific order by ID
 * @param {string} orderId - The order ID
 * @returns {Promise<Object>} Order object
 */
export async function getOrderById(orderId) {
   if (!orderId) throw new Error("Order ID is required");

   const user_id = await getUserId();
   if (!user_id) throw new Error("Not authenticated");

   const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user_id)
      .single();

   if (error) throw new Error(error.message);
   return data;
}

/**
 * Update an existing order
 * @param {string} orderId - The order ID
 * @param {Object} orderData - The updated order data
 * @returns {Promise<Object>} Updated order object
 */
export async function updateOrder(orderId, orderData) {
   if (!orderId) throw new Error("Order ID is required");
   if (!orderData || typeof orderData !== "object") {
      throw new Error("Valid order data is required");
   }

   const user_id = await getUserId();
   if (!user_id) throw new Error("Not authenticated");

   const { data, error } = await supabase
      .from("orders")
      .update({ order_data: orderData })
      .eq("id", orderId)
      .eq("user_id", user_id)
      .select()
      .single();

   if (error) throw new Error(error.message);
   return data;
}

/**
 * Delete an order
 * @param {string} orderId - The order ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteOrder(orderId) {
   if (!orderId) throw new Error("Order ID is required");

   const user_id = await getUserId();
   if (!user_id) throw new Error("Not authenticated");

   const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId)
      .eq("user_id", user_id);

   if (error) throw new Error(error.message);
   return true;
}
