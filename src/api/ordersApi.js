import { supabase } from "../lib/supabaseClient";
import { getUserId } from "./usersApi";

/**
 * Create a new order
 * @param {Object} orderData - The order data to store (as JSON)
 * @returns {Promise<Object>} Created order object
 */
export async function createOrder(orderData) {
   if (!orderData || typeof orderData !== "object") {
      throw new Error("Valid order data is required");
   }

   const user_id = getUserId();
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
 * Get all orders for the current user (limited to 10 most recent due to trigger)
 * @returns {Promise<Array>} Array of order objects for the current user
 */
export async function getAllOrders() {
   const user_id = getUserId();
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
 * Get a single order by ID (only for current user)
 * @param {string} id - The order ID
 * @returns {Promise<Object>} Order object
 */
export async function getOrderById(id) {
   if (!id || typeof id !== "string") {
      throw new Error("Invalid order ID");
   }

   const user_id = getUserId();
   if (!user_id) throw new Error("Not authenticated");

   const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .eq("user_id", user_id)
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

/**
 * Update an order by ID (only for current user)
 * @param {string} id - The order ID
 * @param {Object} orderData - Updated order data
 * @returns {Promise<Object>} Updated order object
 */
export async function updateOrder(id, orderData) {
   if (!id || typeof id !== "string") {
      throw new Error("Invalid order ID");
   }

   if (!orderData || typeof orderData !== "object") {
      throw new Error("Valid order data is required");
   }

   const user_id = getUserId();
   if (!user_id) throw new Error("Not authenticated");

   const { data, error } = await supabase
      .from("orders")
      .update({ order_data: orderData })
      .eq("id", id)
      .eq("user_id", user_id)
      .select()
      .single();

   if (error) throw new Error(error.message);
   return data;
}

/**
 * Delete an order by ID (only for current user)
 * @param {string} id - The order ID
 * @returns {Promise<Object>} Success confirmation
 */
export async function deleteOrder(id) {
   if (!id || typeof id !== "string") {
      throw new Error("Invalid order ID");
   }

   const user_id = getUserId();
   if (!user_id) throw new Error("Not authenticated");

   const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id)
      .eq("user_id", user_id);

   if (error) throw new Error(error.message);
   return { success: true };
}

/**
 * Get orders within a date range (for current user)
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Promise<Array>} Array of order objects
 */
export async function getOrdersByDateRange(startDate, endDate) {
   if (!startDate || !endDate) {
      throw new Error("Start date and end date are required");
   }

   const user_id = getUserId();
   if (!user_id) throw new Error("Not authenticated");

   const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user_id)
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .order("created_at", { ascending: false });

   if (error) throw new Error(error.message);
   return data || [];
}

/**
 * Get recent orders (last N orders for current user)
 * @param {number} limit - Number of orders to retrieve (default: 5)
 * @returns {Promise<Array>} Array of recent order objects
 */
export async function getRecentOrders(limit = 5) {
   if (typeof limit !== "number" || limit < 1) {
      throw new Error("Limit must be a positive number");
   }

   const user_id = getUserId();
   if (!user_id) throw new Error("Not authenticated");

   const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(limit);

   if (error) throw new Error(error.message);
   return data || [];
}

/**
 * Search orders by order data content (for current user)
 * @param {string} searchTerm - Search term to look for in order_data
 * @returns {Promise<Array>} Array of matching order objects
 */
export async function searchOrders(searchTerm) {
   if (!searchTerm || typeof searchTerm !== "string") {
      throw new Error("Search term is required");
   }

   const user_id = getUserId();
   if (!user_id) throw new Error("Not authenticated");

   // Using JSONB contains operator to search within order_data
   const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user_id)
      .textSearch("order_data", searchTerm)
      .order("created_at", { ascending: false });

   if (error) throw new Error(error.message);
   return data || [];
}

/**
 * Get order count for current user
 * @returns {Promise<number>} Total number of orders for current user
 */
export async function getOrderCount() {
   const user_id = getUserId();
   if (!user_id) throw new Error("Not authenticated");

   const { count, error } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user_id);

   if (error) throw new Error(error.message);
   return count || 0;
}

/**
 * Bulk insert orders (useful for importing) for current user
 * @param {Array} ordersArray - Array of order data objects
 * @returns {Promise<Array>} Array of created order objects
 */
export async function createBulkOrders(ordersArray) {
   if (!Array.isArray(ordersArray) || ordersArray.length === 0) {
      throw new Error("Valid orders array is required");
   }

   const user_id = getUserId();
   if (!user_id) throw new Error("Not authenticated");

   const formattedOrders = ordersArray.map((orderData) => ({
      user_id,
      order_data: orderData,
   }));

   const { data, error } = await supabase
      .from("orders")
      .insert(formattedOrders)
      .select();

   if (error) throw new Error(error.message);
   return data || [];
}
