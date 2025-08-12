import { Ionicons } from "@expo/vector-icons";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../lib/ThemeContext";

export const OrdersPopup = ({
   isOpen,
   onClose,
   orders,
   selectedOrderIndex,
   onSelectOrder,
}) => {
   const { theme } = useTheme();

   const renderOrderItem = ({ item, index }) => {
      const isSelected = index === selectedOrderIndex;

      return (
         <TouchableOpacity
            onPress={() => onSelectOrder(index)}
            style={{
               padding: 16,
               borderBottomWidth: 1,
               borderBottomColor: theme.colors.border,
               backgroundColor: isSelected
                  ? theme.colors.primary + "20"
                  : "transparent",
               flexDirection: "row",
               justifyContent: "space-between",
               alignItems: "center",
            }}
            activeOpacity={0.7}
         >
            <View style={{ flex: 1 }}>
               <Text
                  style={{
                     fontSize: 16,
                     fontWeight: "600",
                     color: theme.colors.text,
                     marginBottom: 4,
                  }}
               >
                  Order #{index + 1}
               </Text>
               <Text
                  style={{
                     fontSize: 14,
                     color: theme.colors.textSecondary,
                     marginBottom: 2,
                  }}
               >
                  {item.buyerDetails?.name || "Unknown Buyer"}
               </Text>
               <Text
                  style={{
                     fontSize: 12,
                     color: theme.colors.textSecondary,
                  }}
               >
                  {item.orderItems?.length || 0} items
               </Text>
            </View>

            {isSelected && (
               <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme.colors.primary}
               />
            )}
         </TouchableOpacity>
      );
   };

   return (
      <Modal
         visible={isOpen}
         animationType="slide"
         presentationStyle="pageSheet"
         onRequestClose={onClose}
      >
         <View
            style={{
               flex: 1,
               backgroundColor: theme.colors.background,
            }}
         >
            {/* Header */}
            <View
               style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
               }}
            >
               <Text
                  style={{
                     fontSize: 18,
                     fontWeight: "600",
                     color: theme.colors.text,
                  }}
               >
                  Select Order
               </Text>
               <TouchableOpacity
                  onPress={onClose}
                  style={{
                     padding: 8,
                     borderRadius: 20,
                     backgroundColor: theme.colors.card,
                  }}
                  activeOpacity={0.7}
               >
                  <Ionicons name="close" size={20} color={theme.colors.text} />
               </TouchableOpacity>
            </View>

            {/* Orders List */}
            <FlatList
               data={orders}
               renderItem={renderOrderItem}
               keyExtractor={(item, index) => index.toString()}
               style={{ flex: 1 }}
               showsVerticalScrollIndicator={false}
            />

            {/* Footer */}
            <View
               style={{
                  padding: 16,
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
               }}
            >
               <Text
                  style={{
                     fontSize: 14,
                     color: theme.colors.textSecondary,
                     textAlign: "center",
                  }}
               >
                  Total: {orders.length} orders
               </Text>
            </View>
         </View>
      </Modal>
   );
};
