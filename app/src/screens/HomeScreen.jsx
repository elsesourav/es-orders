import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useRef, useState } from "react";
import {
   RefreshControl,
   ScrollView,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllOrders } from "../api/ordersApi";
import { useAuth } from "../lib/AuthContext";
import { useTheme } from "../lib/ThemeContext";

export const HomeScreen = ({ navigation }) => {
   const { user } = useAuth();
   const { theme } = useTheme();
   const [states, setStates] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [refreshing, setRefreshing] = useState(false);
   const hasFetched = useRef(false);

   const fetchOrders = async () => {
      if (hasFetched.current && !refreshing) return;
      hasFetched.current = true;

      try {
         setLoading(true);
         const response = await getAllOrders();

         const states =
            response?.map((item) => ({
               ...item?.order_data?.states,
               id: item?.id,
               timestamp: item?.order_data?.timestamp,
            })) || [];

         setStates(states);
         setError(null);
      } catch (err) {
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   const onRefresh = async () => {
      setRefreshing(true);
      hasFetched.current = false;
      await fetchOrders();
      setRefreshing(false);
   };

   useEffect(() => {
      fetchOrders();
   }, []);

   const handleRTDClick = (state) => {
      // Store selected state data for navigation
      // You can implement AsyncStorage or other state management here
      console.log("RTD clicked for state:", state);
      navigation?.navigate?.("Orders", {
         selectedState: {
            ...state,
            selectedType: "rtd",
         },
      });
   };

   const handleHandoverClick = (state) => {
      // Store selected state data for navigation
      console.log("Handover clicked for state:", state);
      navigation?.navigate?.("Orders", {
         selectedState: {
            ...state,
            selectedType: "handover",
         },
      });
   };

   if (loading && !refreshing) {
      return (
         <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.colors.background }}
            edges={["left", "right"]}
         >
            <View className="flex-1 justify-center items-center py-12">
               <View className="items-center">
                  <View
                     className="w-12 h-12 rounded-full border-2 border-transparent mb-4"
                     style={{
                        borderTopColor: theme.colors.primary,
                        transform: [{ rotate: "0deg" }],
                     }}
                  >
                     {/* Simple loading animation placeholder */}
                     <View
                        className="w-full h-full rounded-full"
                        style={{
                           borderWidth: 2,
                           borderColor: "transparent",
                           borderTopColor: theme.colors.primary,
                        }}
                     />
                  </View>
                  <Text style={{ color: theme.colors.textSecondary }}>
                     Loading states...
                  </Text>
               </View>
            </View>
         </SafeAreaView>
      );
   }

   if (error) {
      return (
         <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.colors.background }}
            edges={["left", "right"]}
         >
            <View className="flex-1 justify-center items-center py-12">
               <View
                  className="mx-6 p-6 rounded-lg border max-w-md"
                  style={{
                     backgroundColor: theme.colors.card,
                     borderColor: "#ef4444",
                  }}
               >
                  <Text style={{ color: "#ef4444" }}>Error: {error}</Text>
               </View>
            </View>
         </SafeAreaView>
      );
   }

   return (
      <SafeAreaView
         style={{ flex: 1, backgroundColor: theme.colors.background }}
         edges={["left", "right"]}
      >
         <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
               paddingHorizontal: 16,
               paddingVertical: 16,
            }}
            refreshControl={
               <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={theme.colors.primary}
               />
            }
         >
            {/* Header */}
            <View
               style={{
                  paddingBottom: 16,
                  alignItems: "center",
               }}
            >
               <Text
                  style={{
                     fontSize: 28,
                     fontWeight: "bold",
                     color: theme.colors.text,
                     textAlign: "center",
                  }}
               >
                  Saved States
               </Text>
            </View>

            {states.length === 0 ? (
               <View className="flex-1 justify-center items-center py-12">
                  <Ionicons
                     name="cube-outline"
                     size={64}
                     color={theme.colors.textSecondary}
                     style={{ marginBottom: 16 }}
                  />
                  <Text
                     className="text-lg font-medium mb-2"
                     style={{ color: theme.colors.text }}
                  >
                     No saved states found
                  </Text>
                  <Text
                     className="text-center"
                     style={{ color: theme.colors.textSecondary }}
                  >
                     You haven't created any order states yet.
                  </Text>
               </View>
            ) : (
               <View>
                  {states.map((state, index) => (
                     <View
                        key={state.id || index}
                        style={{
                           backgroundColor: theme.colors.card,
                           borderColor: theme.colors.border,
                           borderWidth: 1,
                           borderRadius: 8,
                           padding: 8,
                           marginBottom: 16,
                           shadowColor: theme.colors.shadow,
                           shadowOffset: { width: 0, height: 1 },
                           shadowOpacity: 0.1,
                           shadowRadius: 2,
                           elevation: 2,
                        }}
                     >
                        <View className="grid grid-cols-3 gap-2">
                           {/* Timestamp Section */}
                           <View className="flex-1 flex justify-center items-start">
                              <Text
                                 className="text-lg pl-1 font-semibold"
                                 style={{ color: theme.colors.text }}
                              >
                                 {state.timestamp || "No timestamp"}
                              </Text>
                           </View>

                           {/* Cards Section */}
                           <View className="flex-2 flex-row gap-2">
                              {/* RTD Card */}
                              <TouchableOpacity
                                 className="flex-1 rounded-lg p-2 border"
                                 style={{
                                    backgroundColor: "#dbeafe33",
                                    borderColor: "#93c5fd",
                                 }}
                                 onPress={() => handleRTDClick(state)}
                                 activeOpacity={0.7}
                              >
                                 <View className="flex-row items-center space-x-3">
                                    <View
                                       className="size-10 rounded-lg flex justify-center items-center mr-2"
                                       style={{ backgroundColor: "#bfdbfe" }}
                                    >
                                       <Ionicons
                                          name="cube"
                                          size={24}
                                          color="#2563eb"
                                       />
                                    </View>
                                    <View>
                                       <Text
                                          className="text-md font-semibold"
                                          style={{ color: theme.colors.text }}
                                       >
                                          RTD
                                       </Text>
                                       <Text
                                          className="text-md"
                                          style={{
                                             color: theme.colors.textSecondary,
                                          }}
                                       >
                                          {state.rtd?.length || 0} items
                                       </Text>
                                    </View>
                                 </View>
                              </TouchableOpacity>

                              {/* Handover Card */}
                              <TouchableOpacity
                                 className="flex-1 rounded-lg p-2 border"
                                 style={{
                                    backgroundColor: "#f3e8ff33",
                                    borderColor: "#c4b5fd",
                                 }}
                                 onPress={() => handleHandoverClick(state)}
                                 activeOpacity={0.7}
                              >
                                 <View className="flex-row items-center space-x-3">
                                    <View
                                       className="size-10 rounded-lg flex justify-center items-center mr-2"
                                       style={{ backgroundColor: "#ddd6fe" }}
                                    >
                                       <MaterialCommunityIcons
                                          name="truck-delivery"
                                          size={24}
                                          color="#2563eb"
                                       />
                                    </View>
                                    <View>
                                       <Text
                                          className="text-md font-semibold"
                                          style={{ color: theme.colors.text }}
                                       >
                                          Handover
                                       </Text>
                                       <Text
                                          className="text-md"
                                          style={{
                                             color: theme.colors.textSecondary,
                                          }}
                                       >
                                          {state.handover?.length || 0} items
                                       </Text>
                                    </View>
                                 </View>
                              </TouchableOpacity>
                           </View>
                        </View>
                     </View>
                  ))}
               </View>
            )}
         </ScrollView>
      </SafeAreaView>
   );
};
