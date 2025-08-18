import { Boxes, Package, Tag, Weight } from "lucide-react";
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

   // Touch/swipe state for mobile navigation
   const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
   const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
   const [isTransitioning, setIsTransitioning] = useState(false);
   const [swipeDirection, setSwipeDirection] = useState(null); // 'left' | 'right' | null

   // Minimum swipe distance to trigger navigation
   const minSwipeDistance = 50;

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

   // Touch event handlers for swipe navigation
   const handleTouchStart = useCallback((e) => {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setTouchEnd({ x: touch.clientX, y: touch.clientY });
   }, []);

   const handleTouchMove = useCallback((e) => {
      const touch = e.touches[0];
      setTouchEnd({ x: touch.clientX, y: touch.clientY });
   }, []);

   const handleTouchEnd = useCallback(() => {
      if (!touchStart.x || !touchEnd.x) return;

      const deltaX = touchStart.x - touchEnd.x;
      const deltaY = Math.abs(touchStart.y - touchEnd.y);

      // Only trigger swipe if horizontal movement is greater than vertical (prevent interference with scrolling)
      if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > minSwipeDistance) {
         setIsTransitioning(true);

         if (deltaX > 0) {
            // Swipe left (next order)
            setSwipeDirection("left");
            setTimeout(() => {
               if (
                  selectedOrderIndex !== null &&
                  selectedOrderIndex < orders.length - 1
               ) {
                  nextOrder();
               }
               setSwipeDirection(null);
               setIsTransitioning(false);
            }, 150);
         } else {
            // Swipe right (previous order)
            setSwipeDirection("right");
            setTimeout(() => {
               if (selectedOrderIndex !== null && selectedOrderIndex > 0) {
                  prevOrder();
               }
               setSwipeDirection(null);
               setIsTransitioning(false);
            }, 150);
         }
      }

      // Reset touch positions
      setTouchStart({ x: 0, y: 0 });
      setTouchEnd({ x: 0, y: 0 });
   }, [
      touchStart,
      touchEnd,
      minSwipeDistance,
      selectedOrderIndex,
      orders.length,
      nextOrder,
      prevOrder,
   ]);

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
      <>
         <div
            className={`relative flex flex-col transition-all duration-200 ease-out ${
               isTransitioning
                  ? "scale-[0.995] opacity-90"
                  : "scale-100 opacity-100"
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
         >
            {/* Header */}
            <div className="relative opacity-30 flex justify-center items-center gap-2 my-1">
               <div className="px-2 py-0.5 border border-primary-200 dark:border-primary-700 rounded-md">
                  <p className="text-xs font-medium text-primary-700 dark:text-primary-300">
                     {stateData?.selectedType?.toUpperCase() || "Loading..."}
                  </p>
               </div>
               <div className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                     {stateData?.timestamp} • {orders.length} orders
                  </p>
               </div>
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
               <div
                  className={`p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/20 transition-all duration-300 ease-out ${
                     isTransitioning
                        ? swipeDirection === "left"
                           ? "transform -translate-x-2 opacity-80"
                           : swipeDirection === "right"
                           ? "transform translate-x-2 opacity-80"
                           : ""
                        : "transform translate-x-0 opacity-100"
                  }`}
               >
                  {/* Order Items */}
                  <div>
                     {selectedOrder.orderItems &&
                        selectedOrder.orderItems.length > 0 && (
                           <div>
                              {/* Single Item Display */}
                              <div className="w-full">
                                 {(() => {
                                    const item =
                                       selectedOrder.orderItems[
                                          selectedItemIndex
                                       ];

                                    return (
                                       <div className="w-full relative bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                                          <div className="grid grid-cols-[1fr_100px] gap-2">
                                             {/* Weight */}
                                             <div className="flex items-center gap-2 px-2 py-1 bg-gradient-to-br from-success-light to-green-50 dark:from-green-900/30 dark:to-emerald-900/20 rounded-md border border-success/20 dark:border-green-700/50">
                                                <div className="p-1 bg-success rounded-md flex-shrink-0">
                                                   <Weight className="w-3 h-3 text-white" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                   <p className="text-lg font-bold text-success dark:text-green-300 truncate">
                                                      {parseFloat(
                                                         product.weight
                                                      )}{" "}
                                                      g
                                                   </p>
                                                </div>
                                             </div>

                                             {/* Quantity Badge */}
                                             <div
                                                className={`flex items-center gap-2 px-2 py-1 bg-gradient-to-br from-warning/10 to-orange-400/10 dark:from-orange-900/10 dark:to-red-900/10 border-warning/20 dark:border-orange-600/20 rounded-md border ${
                                                   item.quantity > 1 &&
                                                   "bg-gradient-to-br from-warning/60 to-orange-400/60 dark:from-orange-900/60 dark:to-red-900/80 border-warning/80 dark:border-orange-600/60"
                                                }`}
                                             >
                                                <div
                                                   className={`p-1 bg-warning rounded-md flex-shrink-0 opacity-60 ${
                                                      item.quantity > 1 &&
                                                      "opacity-100"
                                                   }`}
                                                >
                                                   <Boxes className="w-3 h-3 text-white" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                   <p
                                                      className={`text-lg font-bold text-warning dark:text-orange-300 truncate opacity-60 ${
                                                         item.quantity > 1 &&
                                                         "opacity-100 text-white"
                                                      }`}
                                                   >
                                                      {item.quantity}x
                                                   </p>
                                                </div>
                                             </div>

                                             {/* Product Name */}
                                             <div className="flex col-span-2 items-center gap-2 px-2 py-1 bg-gradient-to-br from-info-light to-blue-50 dark:from-blue-900/30 dark:to-cyan-900/20 rounded-md border border-info/20 dark:border-blue-700/50">
                                                <div className="p-1 bg-info rounded-md flex-shrink-0">
                                                   <Tag className="w-3 h-3 text-white" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                   <p className="text-lg font-bold text-info dark:text-blue-300 line-clamp-1 break-words">
                                                      {product.name}
                                                   </p>
                                                </div>
                                             </div>
                                          </div>

                                          <div
                                             className={`relative w-full my-2 gap-1 grid grid-cols-1 ${
                                                selectedOrder.orderItems
                                                   .length > 1 &&
                                                "grid-cols-[1fr_50px]"
                                             }`}
                                          >
                                             {/* Product Image */}
                                             <div className="my-1 flex justify-center">
                                                <div className="relative w-full max-w-[min(45vw,45vh)] max-h-[min(45vw,45vh)]">
                                                   <img
                                                      src={item.primaryImageUrl}
                                                      alt={item.title}
                                                      className="w-full h-full object-contain bg-gray-100 dark:bg-gray-700 shadow-app-sm rounded-md border border-gray-200 dark:border-gray-600"
                                                   />
                                                   <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent rounded-md"></div>
                                                </div>
                                             </div>

                                             {/* Item Number Buttons - Show only if multiple items */}
                                             <div
                                                className={`relative p-1 flex flex-col justify-center items-center gap-2 w-full overflow-x-auto custom-scrollbar ${
                                                   selectedOrder.orderItems
                                                      .length < 2 && "hidden"
                                                }`}
                                             >
                                                {selectedOrder.orderItems
                                                   .length > 1 &&
                                                   selectedOrder.orderItems.map(
                                                      (_, index) => (
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
                                                            className={`flex-shrink-0 size-9 rounded-md border transition-all duration-300 transform text-xs font-medium ${
                                                               selectedItemIndex ===
                                                               index
                                                                  ? "bg-primary dark:bg-primary-600 text-white border-primary-600 dark:border-primary-400 scale-105 font-bold"
                                                                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:border-primary-300 dark:hover:border-primary-600 hover:scale-105"
                                                            }`}
                                                         >
                                                            {index + 1}
                                                         </button>
                                                      )
                                                   )}
                                             </div>
                                          </div>

                                          {/* SKU */}
                                          <div className="mb-2 p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
                                             <p className="text-xs text-gray-600 dark:text-gray-400">
                                                <span className="font-semibold text-gray-900 dark:text-gray-200">
                                                   SKU:
                                                </span>{" "}
                                                <span className="font-mono text-xs">
                                                   {item.sku}
                                                </span>
                                             </p>
                                          </div>

                                          {/* Product Title */}
                                          <div className="p-2 bg-gray-50 dark:bg-primary-900/20 rounded-md border border-primary-200 dark:border-primary-700">
                                             <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-3 leading-relaxed">
                                                {item.title}
                                             </p>
                                          </div>
                                       </div>
                                    );
                                 })()}
                              </div>
                           </div>
                        )}
                  </div>

                  {/* Buyer Details */}
                  <div className="relative mt-4">
                     <div className="bg-white dark:bg-gray-800 rounded-md p-2 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                           <div className="w-1 h-4 bg-primary rounded-full"></div>
                           Buyer Details
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                           <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                                 Name
                              </p>
                              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                 {selectedOrder.buyerDetails?.name || "N/A"}
                              </p>
                           </div>
                           <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                                 State
                              </p>
                              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                 {selectedOrder.buyerDetails?.address?.state ||
                                    "N/A"}
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* Empty State */}
            {orders.length === 0 && (
               <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                     <Package className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                  </div>
                  <div className="max-w-sm mx-auto px-4">
                     <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        No Orders Found
                     </h3>
                     <p className="text-xs text-gray-600 dark:text-gray-400">
                        No orders found for{" "}
                        <span className="font-medium text-primary">
                           {stateData?.selectedType}
                        </span>{" "}
                        state.
                     </p>
                  </div>
               </div>
            )}
         </div>
         {/* Voice Control Component */}
         <VoiceControl
            onNextOrder={nextOrder}
            onPrevOrder={prevOrder}
            onSelectOrder={selectOrder}
            ordersLength={orders.length}
         />

         {/* Orders Popup */}
         <OrdersPopup
            isOpen={showOrdersPopup}
            onClose={() => setShowOrdersPopup(false)}
            orders={orders}
            selectedOrderIndex={selectedOrderIndex}
            onSelectOrder={selectOrder}
         />
      </>
   );
};

export default OrdersPage;
