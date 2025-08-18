import { Tag, Boxes, Weight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getAllProducts } from "../api/productsApi";
import { OrdersPopup, Pagination, VoiceControl } from "./orders";

const OrdersPage = () => {
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
      // Fetch state data from localStorage
      const storedState = localStorage.getItem("es_orders_selected_state");
      if (storedState) {
         try {
            const parsedState = JSON.parse(storedState);
            setStateData(parsedState);

            // Get orders based on selected type
            const ordersArray =
               parsedState.selectedType === "rtd"
                  ? parsedState.rtd
                  : parsedState.handover;

            setOrders(ordersArray || []);
         } catch (error) {
            console.error("Error parsing stored state:", error);
         }
      } else {
         console.log("No state data found in localStorage");
      }

      // Fetch all data using Promise.all
      const fetchAllData = async () => {
         try {
            const productsData = await getAllProducts();
            setProducts(productsData);
         } catch (error) {
            console.error("Error fetching data:", error);
         }
      };

      fetchAllData();
   }, []);

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
      <div className="relative flex flex-col">
         {/* Voice Control Component */}
         <VoiceControl
            onNextOrder={nextOrder}
            onPrevOrder={prevOrder}
            onSelectOrder={selectOrder}
            ordersLength={orders.length}
         />

         {/* Header */}
         <div className="relative flex justify-center items-center gap-3 my-1 opacity-20">
            <p className="text-sm text-gray-600 dark:text-gray-400">
               {stateData?.selectedType?.toUpperCase() || "Loading..."}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
               {stateData?.timestamp} • orders {orders.length}
            </p>
         </div>

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
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
               {/* Order Items */}
               <div>
                  {selectedOrder.orderItems &&
                     selectedOrder.orderItems.length > 0 && (
                        <div>
                           {/* Single Item Display */}
                           <div className="w-full min-w-full">
                              {(() => {
                                 const item =
                                    selectedOrder.orderItems[selectedItemIndex];
                              
                                 return (
                                    <div className="w-full relative">
                                       <div className="grid grid-cols-[auto_80px] gap-2">
                                          {/* Weight */}
                                          <div className="flex items-center gap-2 lg:gap-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
                                             <div className="p-1 bg-green-500 rounded-lg flex-shrink-0">
                                                <Weight className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                             </div>
                                             <div className="min-w-0 flex-1">
                                                <p className="text-md sm:text-sm font-bold text-green-700 dark:text-green-300 truncate">
                                                   {parseFloat(product.weight)} g
                                                </p>
                                             </div>
                                          </div>

                                          {/* Quantity Badge */}
                                          <div
                                             className={`flex items-center gap-2 lg:gap-3 p-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-700 ${
                                                item.quantity > 1 &&
                                                "bg-gradient-to-r from-orange-400 to-red-400 dark:from-orange-900/70 dark:to-red-900/70"
                                             }`}
                                          >
                                             <div
                                                className={`p-1 bg-orange-500 rounded-lg flex-shrink-0 opacity-50 ${
                                                   item.quantity > 1 &&
                                                   "opacity-100"
                                                }`}
                                             >
                                                <Boxes className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                             </div>
                                             <div className="min-w-0 flex-1">
                                                <p
                                                   className={`text-md sm:text-sm font-bold text-orange-700 dark:text-orange-300 truncate opacity-50 ${
                                                      item.quantity > 1 &&
                                                      "opacity-100"
                                                   }`}
                                                >
                                                   {item.quantity}x
                                                </p>
                                             </div>
                                          </div>

                                          {/* Product Name */}
                                          <div className="flex col-span-2 items-center gap-2 lg:gap-3 p-2 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                             <div className="p-1 bg-yellow-500 rounded-lg flex-shrink-0">
                                                <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                             </div>
                                             <div className="min-w-0 flex-1">
                                                <p className="text-md sm:text-sm font-bold text-yellow-700 dark:text-yellow-300 line-clamp-1 break-words">
                                                   {product.name}
                                                </p>
                                             </div>
                                          </div>
                                       </div>

                                       {/* Quantity Badge - Show only if quantity > 1 */}
                                       {/* {item.quantity >= 1 && (
                                          <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-md font-bold px-3 py-2 rounded-full shadow-lg">
                                             {item.quantity}x
                                          </div>
                                       )} */}

                                       <div
                                          className={`relative w-full my-2 gap-1 grid grid-cols-1 ${
                                             selectedOrder.orderItems.length >
                                                1 && "grid-cols-[1fr_60px]"
                                          }`}
                                       >
                                          {/* Product Image */}
                                          <div className="my-2 flex justify-center">
                                             <img
                                                src={item.primaryImageUrl}
                                                alt={item.title}
                                                className="object-cover size-[min(50vw,50vh)] bg-gray-200 dark:bg-gray-600 shadow-lg rounded-sm"
                                             />
                                          </div>

                                          {/* Item Number Buttons - Show only if multiple items */}
                                          <div
                                             className={`relative py-2 flex flex-col justify-center items-center gap-2 w-full overflow-x-auto custom-scrollbar ${
                                                selectedOrder.orderItems
                                                   .length < 2 && "hidden"
                                             }`}
                                          >
                                             {selectedOrder.orderItems.length >=
                                                1 &&
                                                [
                                                   ...selectedOrder.orderItems,
                                                   {},
                                                   {},
                                                ].map((_, index) => (
                                                   <button
                                                      key={index}
                                                      onClick={() => {
                                                         setSelectedItemIndex(
                                                            index
                                                         );
                                                         const productDetails =
                                                            updateProductDetails(
                                                               selectedOrder
                                                                  .orderItems[
                                                                  index
                                                               ]
                                                            );
                                                         setProduct(
                                                            productDetails
                                                         );
                                                      }}
                                                      className={`flex-shrink-0 w-10 h-10 rounded-lg border transition-all duration-300 transform ${
                                                         selectedItemIndex ===
                                                         index
                                                            ? "dark:bg-white/60 bg-gray-800/60 text-white dark:text-black  border-black dark:border-white scale-105 shadow-lg"
                                                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 active:bg-purple-100 dark:active:bg-purple-900/30 hover:scale-105"
                                                      }`}
                                                   >
                                                      {index + 1}
                                                   </button>
                                                ))}
                                          </div>
                                       </div>

                                       {/* SKU */}
                                       <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                          <span className="font-medium">
                                             SKU:
                                          </span>{" "}
                                          {item.sku}
                                       </p>

                                       {/* Product Title */}
                                       <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-4">
                                          {item.title}
                                       </p>
                                    </div>
                                 );
                              })()}
                           </div>
                        </div>
                     )}
               </div>

               {/* Buyer Details */}
               <div className="relative mt-10">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                     Buyer Details
                  </h2>
                  <div className="space-y-2">
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                        Name:{" "}
                        <span className="font-medium text-gray-900 dark:text-white">
                           {selectedOrder.buyerDetails?.name || "N/A"}
                        </span>
                     </p>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                        State:{" "}
                        <span className="font-medium text-gray-900 dark:text-white">
                           {selectedOrder.buyerDetails?.address?.state || "N/A"}
                        </span>
                     </p>
                  </div>
               </div>
            </div>
         )}

         {/* Empty State */}
         {orders.length === 0 && (
            <div className="text-center py-12">
               <p className="text-gray-600 dark:text-gray-400">
                  No orders found for {stateData?.selectedType} state.
               </p>
            </div>
         )}

         {/* Orders Popup */}
         <OrdersPopup
            isOpen={showOrdersPopup}
            onClose={() => setShowOrdersPopup(false)}
            orders={orders}
            selectedOrderIndex={selectedOrderIndex}
            onSelectOrder={selectOrder}
         />
      </div>
   );
};

export default OrdersPage;
