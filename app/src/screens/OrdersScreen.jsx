import { useEffect, useState } from "react";
import {
   Alert,
   RefreshControl,
   ScrollView,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { deleteOrder, getAllOrders } from "../api/ordersApi";
import { Button } from "../components/ui/Button";
import { useTheme } from "../lib/ThemeContext";
import { formatCurrency, formatDateTime } from "../lib/utils";

export const OrdersScreen = ({ navigation }) => {
   const { theme } = useTheme();
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(false);
   const [refreshing, setRefreshing] = useState(false);

   const fetchOrders = async () => {
      setLoading(true);
      try {
         const ordersData = await getAllOrders();
         setOrders(ordersData);
      } catch (error) {
         console.error("Error fetching orders:", error);
         Alert.alert("Error", "Failed to fetch orders");
      } finally {
         setLoading(false);
      }
   };

   const onRefresh = async () => {
      setRefreshing(true);
      await fetchOrders();
      setRefreshing(false);
   };

   const handleDeleteOrder = (orderId) => {
      Alert.alert(
         "Delete Order",
         "Are you sure you want to delete this order?",
         [
            {
               text: "Cancel",
               style: "cancel",
            },
            {
               text: "Delete",
               style: "destructive",
               onPress: async () => {
                  try {
                     await deleteOrder(orderId);
                     setOrders(orders.filter((order) => order.id !== orderId));
                     Alert.alert("Success", "Order deleted successfully");
                  } catch (error) {
                     console.error("Error deleting order:", error);
                     Alert.alert("Error", "Failed to delete order");
                  }
               },
            },
         ]
      );
   };

   useEffect(() => {
      fetchOrders();
   }, []);

   const getStatusColor = (status) => {
      switch (status?.toUpperCase()) {
         case "PENDING":
            return "#F59E0B";
         case "PROCESSING":
            return "#3B82F6";
         case "SHIPPED":
            return "#8B5CF6";
         case "DELIVERED":
            return "#10B981";
         case "CANCELLED":
         case "RETURNED":
            return "#EF4444";
         default:
            return theme.colors.textSecondary;
      }
   };

   return (
      <SafeAreaView
         style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
         {/* Header */}
         <View className="px-6 py-4 flex-row justify-between items-center">
            <View>
               <Text
                  className="text-xl font-bold"
                  style={{ color: theme.colors.text }}
               >
                  Orders
               </Text>
               <Text
                  className="text-sm"
                  style={{ color: theme.colors.textSecondary }}
               >
                  {orders.length} total orders
               </Text>
            </View>
            <Button
               title="➕ New"
               onPress={() => navigation?.navigate?.("CreateOrder")}
               size="sm"
            />
         </View>

         <ScrollView
            className="flex-1 px-6"
            refreshControl={
               <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
         >
            {loading && orders.length === 0 ? (
               <View
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: theme.colors.card }}
               >
                  <Text style={{ color: theme.colors.textSecondary }}>
                     Loading orders...
                  </Text>
               </View>
            ) : orders.length === 0 ? (
               <View
                  className="p-8 rounded-lg items-center"
                  style={{ backgroundColor: theme.colors.card }}
               >
                  <Text className="text-6xl mb-4">📦</Text>
                  <Text
                     className="text-lg font-semibold mb-2"
                     style={{ color: theme.colors.text }}
                  >
                     No orders yet
                  </Text>
                  <Text
                     className="text-center mb-4"
                     style={{ color: theme.colors.textSecondary }}
                  >
                     Create your first order to get started
                  </Text>
                  <Button
                     title="Create Order"
                     onPress={() => navigation?.navigate?.("CreateOrder")}
                  />
               </View>
            ) : (
               <View className="space-y-3 pb-6">
                  {orders.map((order) => (
                     <TouchableOpacity
                        key={order.id}
                        className="p-4 rounded-lg"
                        style={{ backgroundColor: theme.colors.card }}
                        onPress={() =>
                           navigation?.navigate?.("OrderDetails", {
                              orderId: order.id,
                           })
                        }
                     >
                        <View className="flex-row justify-between items-start mb-2">
                           <View className="flex-1">
                              <Text
                                 className="font-semibold text-lg"
                                 style={{ color: theme.colors.text }}
                              >
                                 Order #{order.id}
                              </Text>
                              <Text
                                 className="text-sm"
                                 style={{ color: theme.colors.textSecondary }}
                              >
                                 Created: {formatDateTime(order.created_at)}
                              </Text>
                           </View>
                           <View className="items-end">
                              <Text
                                 className="px-2 py-1 rounded text-xs font-medium"
                                 style={{
                                    backgroundColor:
                                       getStatusColor(
                                          order.order_data?.status
                                       ) + "20",
                                    color: getStatusColor(
                                       order.order_data?.status
                                    ),
                                 }}
                              >
                                 {order.order_data?.status || "PENDING"}
                              </Text>
                           </View>
                        </View>

                        <View className="flex-row justify-between items-center">
                           <View>
                              <Text
                                 className="text-sm"
                                 style={{ color: theme.colors.textSecondary }}
                              >
                                 Items: {order.order_data?.items?.length || 0}
                              </Text>
                              <Text
                                 className="font-bold text-lg"
                                 style={{ color: theme.colors.primary }}
                              >
                                 {formatCurrency(order.order_data?.total || 0)}
                              </Text>
                           </View>
                           <TouchableOpacity
                              onPress={() => handleDeleteOrder(order.id)}
                              className="p-2 rounded"
                              style={{ backgroundColor: theme.colors.surface }}
                           >
                              <Text>🗑️</Text>
                           </TouchableOpacity>
                        </View>

                        {order.order_data?.customer && (
                           <View
                              className="mt-2 pt-2"
                              style={{
                                 borderTopWidth: 1,
                                 borderTopColor: theme.colors.border,
                              }}
                           >
                              <Text
                                 className="text-sm"
                                 style={{ color: theme.colors.textSecondary }}
                              >
                                 Customer:{" "}
                                 {order.order_data.customer.name ||
                                    order.order_data.customer.email}
                              </Text>
                           </View>
                        )}
                     </TouchableOpacity>
                  ))}
               </View>
            )}
         </ScrollView>
      </SafeAreaView>
   );
};
