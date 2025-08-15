import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getAllProducts } from "../../api/productsApi";
import { useTheme } from "../../lib/ThemeContext";
import { OrdersPopup, Pagination, VoiceControl } from "../orders";

export const OrdersPage = ({ navigation, route }) => {
   const { theme } = useTheme();
   const [stateData, setStateData] = useState(null);
   const [selectedOrderIndex, setSelectedOrderIndex] = useState(null);
   const [selectedItemIndex, setSelectedItemIndex] = useState(0);
   const [orders, setOrders] = useState([]);
   const [products, setProducts] = useState([]);
   const [product, setProduct] = useState({
      name: "NA",
      weight: "NA",
      unite: "NA",
   });
   const [showOrdersPopup, setShowOrdersPopup] = useState(false);

   const updateProductDetails = useCallback(
      (item) => {
         // Return default values if products are not loaded yet
         if (!products || products.length === 0) {
            return {
               name: "Loading...",
               weight: "Loading...",
               unite: "Loading...",
            };
         }

         const calculateWeightInGrams = (
            all_quantity_per_kg,
            unit,
            unitType
         ) => {
            const type = unitType.toLowerCase();
            let weight = 0;

            all_quantity_per_kg.forEach((quantity_per_kg) => {
               if (type === "p") {
                  weight += parseInt(unit) * (1 / quantity_per_kg) * 1000;
               } else if (type === "g") {
                  weight += parseInt(unit);
               } else if (type === "kg") {
                  weight += parseInt(unit) * 1000;
               }
            });

            return weight;
         };

         const sku = item.newSku || item.sku;
         const parts = sku.split("_");

         if (parts.length >= 4) {
            const items = parts[2].split("-");
            const quantity = parts[3];
            const match = quantity.match(/^(\d+)([a-zA-Z]+)$/);
            if (match) {
               const unit = parseInt(match[1]);
               const unitType = match[2];

               const filteredProducts = items.map((item) =>
                  products.find((p) => p.sku_id === item)
               );

               if (filteredProducts.length === items.length) {
                  const all_quantity_per_kg = filteredProducts.map(
                     (p) => p.quantity_per_kg
                  );
                  const names = filteredProducts.map((p) => p.name);

                  const weight = calculateWeightInGrams(
                     all_quantity_per_kg,
                     unit,
                     unitType
                  );

                  return {
                     name: names.join(", "),
                     weight: weight.toFixed(2),
                     unite: unitType,
                  };
               }
            }
         }
         return { name: "NA", weight: "NA", unite: "NA" };
      },
      [products]
   );

   // Stable navigation functions for voice commands
   const nextOrderRef = useRef();
   const prevOrderRef = useRef();
   const selectOrderRef = useRef();

   nextOrderRef.current = () => {
      setSelectedOrderIndex((prevIndex) => {
         if (prevIndex !== null && prevIndex < orders.length - 1) {
            const newIndex = prevIndex + 1;
            setSelectedItemIndex(0);

            if (products.length > 0 && orders[newIndex]?.orderItems?.[0]) {
               const productDetails = updateProductDetails(
                  orders[newIndex].orderItems[0]
               );
               setProduct(productDetails);
            } else {
               setProduct({
                  name: "Loading...",
                  weight: "Loading...",
                  unite: "Loading...",
               });
            }

            return newIndex;
         }
         return prevIndex;
      });
   };

   prevOrderRef.current = () => {
      setSelectedOrderIndex((prevIndex) => {
         if (prevIndex !== null && prevIndex > 0) {
            const newIndex = prevIndex - 1;
            setSelectedItemIndex(0);

            if (products.length > 0 && orders[newIndex]?.orderItems?.[0]) {
               const productDetails = updateProductDetails(
                  orders[newIndex].orderItems[0]
               );
               setProduct(productDetails);
            } else {
               setProduct({
                  name: "Loading...",
                  weight: "Loading...",
                  unite: "Loading...",
               });
            }

            return newIndex;
         }
         return prevIndex;
      });
   };

   selectOrderRef.current = (orderIndex) => {
      setSelectedOrderIndex(orderIndex);
      setSelectedItemIndex(0);

      if (products.length > 0 && orders[orderIndex]?.orderItems?.[0]) {
         const productDetails = updateProductDetails(
            orders[orderIndex].orderItems[0]
         );
         setProduct(productDetails);
      } else {
         setProduct({
            name: "Loading...",
            weight: "Loading...",
            unite: "Loading...",
         });
      }
      setShowOrdersPopup(false);
   };

   // Wrapper functions for UI callbacks
   const nextOrder = useCallback(() => nextOrderRef.current(), []);
   const prevOrder = useCallback(() => prevOrderRef.current(), []);
   const selectOrder = useCallback(
      (orderIndex) => selectOrderRef.current(orderIndex),
      []
   );

   useEffect(() => {
      // Get state data from navigation params
      const selectedState = route?.params?.selectedState;
      if (selectedState) {
         setStateData(selectedState);

         // Get orders based on selected type
         const ordersArray =
            selectedState.selectedType === "rtd"
               ? selectedState.rtd
               : selectedState.handover;

         setOrders(ordersArray || []);
      } else {
         console.log("No state data found in navigation params");
      }

      // Fetch products data
      const fetchProducts = async () => {
         try {
            const productsData = await getAllProducts();
            setProducts(productsData || []);
         } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
         }
      };

      fetchProducts();
   }, [route?.params]);

   // Auto-select first order when both orders and products are loaded
   useEffect(() => {
      if (
         orders.length > 0 &&
         products.length > 0 &&
         selectedOrderIndex === null
      ) {
         setSelectedOrderIndex(0);
         setSelectedItemIndex(0);
         const firstOrder = orders[0];
         if (firstOrder.orderItems && firstOrder.orderItems.length > 0) {
            const productDetails = updateProductDetails(
               firstOrder.orderItems[0]
            );
            setProduct(productDetails);
         }
      }
   }, [orders, products, selectedOrderIndex, updateProductDetails]);

   const selectedOrder =
      selectedOrderIndex !== null ? orders[selectedOrderIndex] : null;

   return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
         {/* Voice Control Component */}
         <VoiceControl
            onNextOrder={nextOrder}
            onPrevOrder={prevOrder}
            onSelectOrder={selectOrder}
            ordersLength={orders.length}
         />

         <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View
               style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 12,
                  marginVertical: 10,
                  paddingHorizontal: 10,
               }}
            >
               <Text
                  style={{
                     fontSize: 14,
                     color: theme.colors.textSecondary,
                     opacity: 0.2,
                     fontWeight: "500",
                  }}
               >
                  {stateData?.selectedType?.toUpperCase() || "Loading..."}
               </Text>
               <Text
                  style={{
                     fontSize: 14,
                     opacity: 0.2,
                     color: theme.colors.textSecondary,
                  }}
               >
                  {stateData?.timestamp} • orders {orders.length}
               </Text>
            </View>

            {/* Top Pagination */}
            <Pagination
               selectedOrderIndex={selectedOrderIndex}
               totalOrders={orders.length}
               onPrevious={prevOrder}
               onNext={nextOrder}
               onShowPopup={() => setShowOrdersPopup(true)}
            />

            {/* Order Details */}
            {selectedOrder && (
               <View
                  style={{
                     paddingHorizontal: 16,
                     paddingTop: 8,
                     borderTopWidth: 1,
                     borderTopColor: theme.colors.border,
                  }}
               >
                  {/* Order Items */}
                  <View>
                     {selectedOrder.orderItems &&
                        selectedOrder.orderItems.length > 0 && (
                           <View>
                              {/* Item Number Buttons - Show only if multiple items */}
                              {selectedOrder.orderItems.length > 1 && (
                                 <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={{
                                       flexDirection: "row",
                                       height: 56,
                                       padding: 4,
                                       marginHorizontal: 4,
                                       marginVertical: 10,
                                    }}
                                    contentContainerStyle={{ gap: 8 }}
                                 >
                                    {selectedOrder.orderItems.map((_, index) => {
                                       const isSelected =
                                          selectedItemIndex === index;

                                       return (
                                          <TouchableOpacity
                                             key={index}
                                             onPress={() => {
                                                setSelectedItemIndex(index);
                                                const productDetails =
                                                   updateProductDetails(
                                                      selectedOrder.orderItems[
                                                         index
                                                      ]
                                                   );
                                                setProduct(productDetails);
                                             }}
                                             activeOpacity={0.7}
                                             style={{
                                                transform: [
                                                   {
                                                      scale: isSelected
                                                         ? 1.1
                                                         : 1,
                                                   }
                                                ],
                                             }}
                                          >
                                             <View
                                                style={{
                                                   width: 48,
                                                   height: 48,
                                                   borderRadius: 12,
                                                   borderWidth: 2,
                                                   justifyContent: "center",
                                                   alignItems: "center",
                                                   backgroundColor: isSelected
                                                      ? "#ff6b35"
                                                      : "#2c3e50",
                                                   borderColor: "#ff8c42",
                                                   shadowColor: isSelected
                                                      ? "#ff6b35"
                                                      : "#2c3e50",
                                                   shadowOffset: {
                                                      width: 0,
                                                      height: isSelected
                                                         ? 8
                                                         : 4,
                                                   },
                                                   shadowOpacity: isSelected
                                                      ? 0.6
                                                      : 0.3,
                                                   shadowRadius: isSelected
                                                      ? 15
                                                      : 6,
                                                   elevation: isSelected
                                                      ? 12
                                                      : 6,
                                                }}
                                             >
                                                <Text
                                                   style={{
                                                      color: "#ffffff",
                                                      fontWeight: "700",
                                                      fontSize: isSelected
                                                         ? 22
                                                         : 18,
                                                      textShadowColor:
                                                         "rgba(0, 0, 0, 0.3)",
                                                      textShadowOffset: {
                                                         width: 1,
                                                         height: 1,
                                                      },
                                                      textShadowRadius: 2,
                                                   }}
                                                >
                                                   {index + 1}
                                                </Text>
                                             </View>
                                          </TouchableOpacity>
                                       );
                                    })}
                                 </ScrollView>
                              )}

                              {/* Single Item Display */}
                              <View style={{ width: "100%" }}>
                                 {(() => {
                                    const item =
                                       selectedOrder.orderItems[
                                          selectedItemIndex
                                       ];
                                    return (
                                       <View
                                          style={{
                                             width: "100%",
                                             position: "relative",
                                          }}
                                       >
                                          {/* Product Details Grid */}
                                          <View
                                             style={{
                                                flexDirection: "row",
                                                gap: 8,
                                                marginBottom: 16,
                                             }}
                                          >
                                             {/* Weight */}
                                             <View
                                                style={{
                                                   flex: 1,
                                                   flexDirection: "row",
                                                   alignItems: "center",
                                                   gap: 8,
                                                   padding: 8,
                                                   backgroundColor: "#fff5f5",
                                                   borderRadius: 8,
                                                   borderWidth: 1,
                                                   borderColor: "#fed7d7",
                                                }}
                                             >
                                                <View
                                                   style={{
                                                      padding: 4,
                                                      backgroundColor:
                                                         "#f56565",
                                                      borderRadius: 6,
                                                   }}
                                                >
                                                   <Ionicons
                                                      name="barbell"
                                                      size={18}
                                                      color="#ffffff"
                                                   />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                   <Text
                                                      style={{
                                                         fontSize: 22,
                                                         fontWeight: "600",
                                                         color: "#c53030",
                                                      }}
                                                   >
                                                      {product.weight} g
                                                   </Text>
                                                </View>
                                             </View>

                                             {/* Quantity */}
                                             <View
                                                style={{
                                                   flexDirection: "row",
                                                   width: 50,
                                                   gap: 8,
                                                   backgroundColor:
                                                      item.quantity > 1
                                                         ? "#f00"
                                                         : "#f002",
                                                   borderRadius: 8,
                                                   borderWidth: 1,
                                                   alignItems: "center",
                                                   justifyContent: "center",
                                                   textAlign: "center",
                                                   borderColor: "#ff8c42",
                                                }}
                                             >
                                                <Text
                                                   style={{
                                                      color: "#fff",
                                                      fontSize: 18,
                                                      fontWeight: "600",
                                                   }}
                                                >
                                                   {item.quantity}x
                                                </Text>
                                             </View>

                                             {/* Unit */}
                                             <View
                                                style={{
                                                   flexDirection: "row",
                                                   alignItems: "center",
                                                   gap: 8,
                                                   padding: 8,
                                                   backgroundColor: "#f0fff4",
                                                   borderRadius: 8,
                                                   borderWidth: 1,
                                                   borderColor: "#c6f6d5",
                                                }}
                                             >
                                                <View
                                                   style={{
                                                      padding: 4,
                                                      backgroundColor:
                                                         "#48bb7844",
                                                      borderRadius: 6,
                                                   }}
                                                >
                                                   <Ionicons
                                                      name="cube"
                                                      size={18}
                                                      color="#ffffff"
                                                   />
                                                </View>
                                                <Text
                                                   style={{
                                                      fontSize: 16,
                                                      fontWeight: "600",
                                                      color: "#2f855a",
                                                   }}
                                                >
                                                   {product.unite}
                                                </Text>
                                             </View>
                                          </View>

                                          {/* Product Name */}
                                          <View
                                             style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 8,
                                                padding: 8,
                                                backgroundColor: "#fff",
                                                borderRadius: 8,
                                                borderWidth: 1,
                                                borderColor: "#fed7aa",
                                                marginBottom: 16,
                                             }}
                                          >
                                             <View
                                                style={{
                                                   padding: 4,
                                                   backgroundColor: "#f59e0b",
                                                   borderRadius: 6,
                                                }}
                                             >
                                                <Ionicons
                                                   name="pricetag"
                                                   size={18}
                                                   color="#ffffff"
                                                />
                                             </View>
                                             <View style={{ flex: 1 }}>
                                                <Text
                                                   style={{
                                                      fontSize: 20,
                                                      fontWeight: "900",
                                                      color: "#d97706",
                                                      flexWrap: "wrap",
                                                   }}
                                                >
                                                   {product.name}
                                                </Text>
                                             </View>
                                          </View>

                                          {/* Product Image */}
                                          <View
                                             style={{
                                                marginTop: 1,
                                                marginBottom: 10,
                                                alignItems: "center",
                                             }}
                                          >
                                             <Image
                                                source={{
                                                   uri: item.primaryImageUrl,
                                                }}
                                                style={{
                                                   width: 250,
                                                   height: 250,
                                                   borderRadius: 8,
                                                   backgroundColor:
                                                      theme.colors.surface,
                                                }}
                                                resizeMode="cover"
                                             />
                                          </View>

                                          {/* SKU */}
                                          <Text
                                             style={{
                                                fontSize: 16,
                                                color: theme.colors
                                                   .textSecondary,
                                                marginBottom: 12,
                                             }}
                                          >
                                             <Text
                                                style={{ fontWeight: "500" }}
                                             >
                                                SKU:{" "}
                                             </Text>
                                             {item.sku}
                                          </Text>

                                          {/* Product Title */}
                                          <Text
                                             style={{
                                                fontSize: 18,
                                                fontWeight: "500",
                                                color: theme.colors.text,
                                                marginBottom: 4,
                                                lineHeight: 24,
                                             }}
                                          >
                                             {item.title}
                                          </Text>
                                       </View>
                                    );
                                 })()}
                              </View>
                           </View>
                        )}
                  </View>

                  {/* Buyer Details */}
                  <View
                     style={{
                        marginBottom: 16,
                        marginTop: 60,
                        alignItems: "center",
                     }}
                  >
                     <Text
                        style={{
                           fontSize: 22,
                           fontWeight: "600",
                           color: theme.colors.text,
                           marginBottom: 16,
                        }}
                     >
                        Buyer Details
                     </Text>
                     <View style={{ gap: 8 }}>
                        <Text
                           style={{
                              fontSize: 18,
                              color: theme.colors.textSecondary,
                           }}
                        >
                           Name:{" "}
                           <Text
                              style={{
                                 fontWeight: "500",
                                 color: theme.colors.text,
                              }}
                           >
                              {selectedOrder.buyerDetails?.name || "N/A"}
                           </Text>
                        </Text>
                        <Text
                           style={{
                              fontSize: 18,
                              color: theme.colors.textSecondary,
                           }}
                        >
                           State:{" "}
                           <Text
                              style={{
                                 fontWeight: "500",
                                 color: theme.colors.text,
                              }}
                           >
                              {selectedOrder.buyerDetails?.address?.state ||
                                 "N/A"}
                           </Text>
                        </Text>
                     </View>
                  </View>
               </View>
            )}

            {/* Empty State */}
            {orders.length === 0 && (
               <View
                  style={{
                     alignItems: "center",
                     paddingVertical: 48,
                  }}
               >
                  <Text
                     style={{
                        color: theme.colors.textSecondary,
                        textAlign: "center",
                     }}
                  >
                     No orders found for {stateData?.selectedType} state.
                  </Text>
               </View>
            )}
         </ScrollView>

         {/* Orders Popup */}
         <OrdersPopup
            isOpen={showOrdersPopup}
            onClose={() => setShowOrdersPopup(false)}
            orders={orders}
            selectedOrderIndex={selectedOrderIndex}
            onSelectOrder={selectOrder}
         />
      </View>
   );
};
