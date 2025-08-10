import { useEffect, useState } from "react";
import {
   RefreshControl,
   ScrollView,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/ui/Button";
import { useAuth } from "../lib/AuthContext";
import { useTheme } from "../lib/ThemeContext";

export const HomeScreen = ({ navigation }) => {
   const { user, logout } = useAuth();
   const { theme, toggleTheme, isDark } = useTheme();
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(false);
   const [refreshing, setRefreshing] = useState(false);

   const fetchOrders = async () => {
      setLoading(true);
      try {
         // TODO: Implement API call to fetch orders
         // const response = await getAllOrders();
         // setOrders(response);

         // Mock data for now
         setTimeout(() => {
            setOrders([
               { id: 1, status: "Pending", total: 150.0, items: 3 },
               { id: 2, status: "Processing", total: 89.99, items: 1 },
               { id: 3, status: "Shipped", total: 299.5, items: 5 },
            ]);
            setLoading(false);
         }, 1000);
      } catch (error) {
         console.error("Error fetching orders:", error);
         setLoading(false);
      }
   };

   const onRefresh = async () => {
      setRefreshing(true);
      await fetchOrders();
      setRefreshing(false);
   };

   useEffect(() => {
      fetchOrders();
   }, []);

   const handleLogout = async () => {
      await logout();
   };

   return (
      <SafeAreaView
         style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
         <ScrollView
            className="flex-1"
            refreshControl={
               <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
         >
            {/* Header */}
            <View className="px-6 py-4 flex-row justify-between items-center">
               <View>
                  <Text
                     className="text-xl font-bold"
                     style={{ color: theme.colors.text }}
                  >
                     Welcome back, {user?.user_metadata?.name || user?.email}!
                  </Text>
                  <Text
                     className="text-sm"
                     style={{ color: theme.colors.textSecondary }}
                  >
                     ES Orders Dashboard
                  </Text>
               </View>
               <View className="flex-row space-x-2">
                  <TouchableOpacity
                     onPress={toggleTheme}
                     className="p-2 rounded-lg"
                     style={{ backgroundColor: theme.colors.surface }}
                  >
                     <Text>{isDark ? "☀️" : "🌙"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                     onPress={handleLogout}
                     className="p-2 rounded-lg"
                     style={{ backgroundColor: theme.colors.surface }}
                  >
                     <Text>🚪</Text>
                  </TouchableOpacity>
               </View>
            </View>

            {/* Stats Cards */}
            <View className="px-6 mb-6">
               <View className="flex-row space-x-4">
                  <View
                     className="flex-1 p-4 rounded-lg"
                     style={{ backgroundColor: theme.colors.card }}
                  >
                     <Text
                        className="text-sm"
                        style={{ color: theme.colors.textSecondary }}
                     >
                        Total Orders
                     </Text>
                     <Text
                        className="text-2xl font-bold"
                        style={{ color: theme.colors.text }}
                     >
                        {orders.length}
                     </Text>
                  </View>
                  <View
                     className="flex-1 p-4 rounded-lg"
                     style={{ backgroundColor: theme.colors.card }}
                  >
                     <Text
                        className="text-sm"
                        style={{ color: theme.colors.textSecondary }}
                     >
                        Revenue
                     </Text>
                     <Text
                        className="text-2xl font-bold"
                        style={{ color: theme.colors.text }}
                     >
                        $
                        {orders
                           .reduce((sum, order) => sum + order.total, 0)
                           .toFixed(2)}
                     </Text>
                  </View>
               </View>
            </View>

            {/* Quick Actions */}
            <View className="px-6 mb-6">
               <Text
                  className="text-lg font-semibold mb-3"
                  style={{ color: theme.colors.text }}
               >
                  Quick Actions
               </Text>
               <View className="space-y-3">
                  <Button
                     title="📦 View All Orders"
                     onPress={() => navigation?.navigate?.("Orders")}
                     variant="outline"
                  />
                  <Button
                     title="➕ Create New Order"
                     onPress={() => navigation?.navigate?.("CreateOrder")}
                     variant="outline"
                  />
                  <Button
                     title="📊 Analytics"
                     onPress={() => navigation?.navigate?.("Analytics")}
                     variant="outline"
                  />
                  <Button
                     title="⚙️ Settings"
                     onPress={() => navigation?.navigate?.("Settings")}
                     variant="outline"
                  />
               </View>
            </View>

            {/* Recent Orders */}
            <View className="px-6 mb-6">
               <Text
                  className="text-lg font-semibold mb-3"
                  style={{ color: theme.colors.text }}
               >
                  Recent Orders
               </Text>
               {loading ? (
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
                     className="p-4 rounded-lg"
                     style={{ backgroundColor: theme.colors.card }}
                  >
                     <Text style={{ color: theme.colors.textSecondary }}>
                        No orders found
                     </Text>
                  </View>
               ) : (
                  orders.slice(0, 5).map((order) => (
                     <TouchableOpacity
                        key={order.id}
                        className="p-4 mb-2 rounded-lg"
                        style={{ backgroundColor: theme.colors.card }}
                        onPress={() =>
                           navigation?.navigate?.("OrderDetails", {
                              orderId: order.id,
                           })
                        }
                     >
                        <View className="flex-row justify-between items-center">
                           <View>
                              <Text
                                 className="font-semibold"
                                 style={{ color: theme.colors.text }}
                              >
                                 Order #{order.id}
                              </Text>
                              <Text
                                 className="text-sm"
                                 style={{ color: theme.colors.textSecondary }}
                              >
                                 {order.items} items • {order.status}
                              </Text>
                           </View>
                           <Text
                              className="font-bold"
                              style={{ color: theme.colors.primary }}
                           >
                              ${order.total.toFixed(2)}
                           </Text>
                        </View>
                     </TouchableOpacity>
                  ))
               )}
            </View>
         </ScrollView>
      </SafeAreaView>
   );
};
