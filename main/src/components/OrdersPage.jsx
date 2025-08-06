import { useEffect, useState } from "react";
import { getAllProducts } from "../api/productsApi";
import puravSkuData from "../assets/sku/purav.json";
import sbaruiSkuData from "../assets/sku/sbarui.json";

const OrdersPage = () => {
   const [stateData, setStateData] = useState(null);
   const [selectedRange, setSelectedRange] = useState(null);
   const [selectedOrderIndex, setSelectedOrderIndex] = useState(null);
   const [selectedItemIndex, setSelectedItemIndex] = useState(0);
   const [orders, setOrders] = useState([]);
   const [products, setProducts] = useState([]);
   const [sku, setSku] = useState({ purav: null, sbarui: null });
   const [product, setProduct] = useState({
      name: "NA",
      weight: "NA",
      unite: "NA",
   });

   useEffect(() => {
      // Fetch state data from localStorage
      const storedState = localStorage.getItem("es_orders_selected_state");
      if (storedState) {
         try {
            const parsedState = JSON.parse(storedState);
            console.log("Fetched state from localStorage:", parsedState);

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

            const [puravData, sbaruiData] = await Promise.all([
               Promise.resolve(puravSkuData),
               Promise.resolve(sbaruiSkuData),
            ]);

            setSku({ ...puravData, ...sbaruiData });
         } catch (error) {
            console.error("Error fetching data:", error);
         }
      };

      fetchAllData();
   }, []);

   const isShopsyProduct = (skuId) => {
      return skuId && /^(SPY_|SHY_|SH_)/.test(skuId.toUpperCase());
   };

   const shopsyModifySkuId = (skuId) => {
      if (isShopsyProduct(skuId)) {
         return skuId.toUpperCase().replace(/^(SPY_|SHY_|SH_)/, "");
      }
      return skuId;
   };

   const calculateWeightInGrams = (all_quantity_per_kg, unit, unitType) => {
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

   const updateProductDetails = (item) => {
      const SKU = shopsyModifySkuId(item.sku);
      const itemSku = sku[SKU] || SKU;

      // Parse quantity from SKU
      const parts = itemSku.split("_");
      let unit = 0;
      let unitType = "";

      if (parts.length >= 4) {
         const items = parts[2].split("-");
         const quantity = parts[3];
         const match = quantity.match(/^(\d+)([a-zA-Z]+)$/);
         if (match) {
            unit = parseInt(match[1]);
            unitType = match[2];

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
                  weight: weight.toFixed(3),
                  unite: unitType,
               };
            }
         }
      }
      return { name: "NA", weight: "NA", unite: "NA" };
   };

   // Create range buttons (1-10, 11-20, etc.)
   const createRangeButtons = () => {
      const totalOrders = orders.length;
      const ranges = [];

      for (let i = 0; i < totalOrders; i += 10) {
         const start = i + 1;
         const end = Math.min(i + 10, totalOrders);
         ranges.push({ start, end, range: `${start}-${end}` });
      }

      return ranges;
   };

   // Create individual order buttons for selected range
   const createOrderButtons = () => {
      if (!selectedRange) return [];

      const buttons = [];
      for (let i = selectedRange.start - 1; i < selectedRange.end; i++) {
         buttons.push(i + 1);
      }

      return buttons;
   };

   const selectedOrder =
      selectedOrderIndex !== null ? orders[selectedOrderIndex] : null;

   return (
      <div className="relative flex flex-col">
         {/* Order Details */}
         {selectedOrder && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
               {/* Buyer Information */}
               <div className="mb-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                     <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                           Buyer Name{" "}
                           <span className="font-medium text-gray-900 dark:text-white">
                              {selectedOrder.buyerDetails?.name || "N/A"}
                           </span>
                        </p>
                     </div>
                     <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                           Buyer State{" "}
                           <span className="font-medium text-gray-900 dark:text-white">
                              {selectedOrder.buyerDetails?.address?.state ||
                                 "N/A"}
                           </span>
                        </p>
                     </div>
                  </div>
               </div>

               {/* Order Items */}
               <div>
                  {selectedOrder.orderItems &&
                     selectedOrder.orderItems.length > 0 && (
                        <div>
                           {/* Item Number Buttons - Show only if multiple items */}
                           {selectedOrder.orderItems.length > 1 && (
                              <div className="flex gap-2 p-2 overflow-x-auto custom-scrollbar">
                                 {selectedOrder.orderItems.map((_, index) => (
                                    <button
                                       key={index}
                                       onClick={() => {
                                          setSelectedItemIndex(index);
                                          const productDetails =
                                             updateProductDetails(
                                                selectedOrder.orderItems[index]
                                             );
                                          setProduct(productDetails);
                                       }}
                                       className={`flex-shrink-0 w-10 h-10 rounded-lg border transition-all duration-300 transform ${
                                          selectedItemIndex === index
                                             ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500 scale-110 shadow-lg animate-pulse"
                                             : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 active:bg-purple-100 dark:active:bg-purple-900/30 hover:scale-105"
                                       }`}
                                    >
                                       {index + 1}
                                    </button>
                                 ))}
                              </div>
                           )}

                           {/* Single Item Display */}
                           <div className="w-full min-w-full">
                              {(() => {
                                 const item =
                                    selectedOrder.orderItems[selectedItemIndex];
                                 return (
                                    <div className="w-full relative">
                                       {/* Quantity Badge - Show only if quantity > 1 */}
                                       {item.quantity > 1 && (
                                          <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-md font-bold px-3 py-2 rounded-full shadow-lg">
                                             {item.quantity}x
                                          </div>
                                       )}

                                       {/* Product Image */}
                                       <div className="mb-3">
                                          <img
                                             src={
                                                item.primaryImageUrl ||
                                                "/placeholder-image.jpg"
                                             }
                                             alt={item.title}
                                             className="w-full h-auto object-cover rounded-lg bg-gray-200 dark:bg-gray-600"
                                             onError={(e) => {
                                                e.target.src =
                                                   "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDMyMCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTkyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzYgOTZIMTg0VjE0NEgxMzZWOTZaIiBmaWxsPSIjOUIxMDNEIi8+CjwvZz4KPC9zdmc+";
                                             }}
                                          />
                                       </div>

                                       {/* Product Title */}
                                       <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                          {item.title}
                                       </p>

                                       {/* SKU */}
                                       <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                                          <span className="font-medium">
                                             SKU:
                                          </span>{" "}
                                          {item.sku}
                                       </p>

                                       <div className="relative flex justify-between">
                                          {/* Weight */}
                                          <p className="text-lg text-gray-700 dark:text-gray-300 ">
                                             Weight:
                                             <span className="font-medium text-orange-600">
                                                {" "}
                                                {product.weight} g
                                             </span>{" "}
                                          </p>
                                          {/* Name */}
                                          <p className="relative grid place-items-center text-sm text-gray-700 dark:text-gray-300 ">
                                             <span className="font-medium text-yellow-600">
                                                {" "}
                                                {product.name}
                                             </span>{" "}
                                          </p>
                                          {/* Unite */}
                                          <p className="text-lg text-gray-700 dark:text-gray-300 ">
                                             Unite:
                                             <span className="font-medium text-green-600">
                                                {" "}
                                                {product.unite}
                                             </span>{" "}
                                          </p>
                                       </div>
                                    </div>
                                 );
                              })()}
                           </div>
                        </div>
                     )}
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

         {/* Selection Buttons at Bottom */}
         {orders.length > 0 && (
            <div className="relative flex flex-col mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
               {/* Second Line: Individual Order Buttons */}
               {selectedRange && (
                  <div className="flex gap-1 overflow-x-auto pb-3 custom-scrollbar">
                     {createOrderButtons().map((orderNum) => (
                        <button
                           key={orderNum}
                           onClick={() => {
                              setSelectedOrderIndex(orderNum - 1);
                              setSelectedItemIndex(0);
                              const productDetails = updateProductDetails(
                                 orders[orderNum - 1].orderItems[0]
                              );
                              setProduct(productDetails);
                           }}
                           className={`flex-shrink-0 w-10 h-10 rounded-md border transition-all duration-200 ${
                              selectedOrderIndex === orderNum - 1
                                 ? "bg-green-500 text-white border-green-500"
                                 : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 active:bg-green-100 dark:active:bg-green-900/30"
                           }`}
                        >
                           {orderNum}
                        </button>
                     ))}
                  </div>
               )}

               {/* First Line: Range Buttons */}
               <div className="flex gap-1 overflow-x-auto pb-3 custom-scrollbar">
                  {createRangeButtons().map((range, index) => (
                     <button
                        key={index}
                        onClick={() => {
                           setSelectedRange(range);
                           setSelectedOrderIndex(null);
                        }}
                        className={`flex-shrink-0 p-2 rounded-lg border transition-all duration-200 ${
                           selectedRange?.range === range.range
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 active:bg-blue-100 dark:active:bg-blue-900/30"
                        }`}
                     >
                        {range.range}
                     </button>
                  ))}
               </div>
            </div>
         )}

         <div className="relative flex justify-center items-center gap-3 pt-1 pb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
               {stateData?.selectedType?.toUpperCase() || "Loading..."}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
               {stateData?.timestamp} • orders {orders.length}
            </p>
         </div>
      </div>
   );
};

export default OrdersPage;
