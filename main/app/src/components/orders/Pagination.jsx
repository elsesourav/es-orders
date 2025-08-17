import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../lib/ThemeContext";

export const Pagination = ({
   selectedOrderIndex,
   totalOrders,
   onPrevious,
   onNext,
   onShowPopup,
}) => {
   const { theme } = useTheme();

   return (
      <View
         style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 8,
            backgroundColor: theme.colors.pagination,
            borderRadius: 8,
            marginHorizontal: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
         }}
      >
         {/* Previous Button */}
         <TouchableOpacity
            onPress={onPrevious}
            disabled={selectedOrderIndex === null || selectedOrderIndex === 0}
            style={{
               paddingHorizontal: 24,
               paddingVertical: 10,
               borderRadius: 6,
               backgroundColor:
                  selectedOrderIndex === null || selectedOrderIndex === 0
                     ? theme.colors.surface
                     : theme.colors.primary,
               opacity:
                  selectedOrderIndex === null || selectedOrderIndex === 0
                     ? 0.5
                     : 0.9,
            }}
            activeOpacity={0.7}
         >
            <Ionicons
               name="chevron-back"
               size={20}
               color={
                  selectedOrderIndex === null || selectedOrderIndex === 0
                     ? theme.colors.textSecondary
                     : "#ffffff"
               }
            />
         </TouchableOpacity>

         {/* Order Counter - Clickable */}
         <TouchableOpacity
            onPress={onShowPopup}
            style={{
               paddingHorizontal: 16,
               paddingVertical: 8,
               backgroundColor: theme.colors.surface,
               borderRadius: 6,
               borderWidth: 1,
               borderColor: theme.colors.border,
            }}
            activeOpacity={0.7}
         >
            <Text
               style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: theme.colors.text,
                  textAlign: "center",
               }}
            >
               {selectedOrderIndex !== null
                  ? `${selectedOrderIndex + 1} / ${totalOrders}`
                  : `0 / ${totalOrders}`}
            </Text>
         </TouchableOpacity>

         {/* Next Button */}
         <TouchableOpacity
            onPress={onNext}
            disabled={
               selectedOrderIndex === null ||
               selectedOrderIndex >= totalOrders - 1
            }
            style={{
               paddingHorizontal: 24,
               paddingVertical: 10,
               borderRadius: 6,
               backgroundColor:
                  selectedOrderIndex === null ||
                  selectedOrderIndex >= totalOrders - 1
                     ? theme.colors.surface
                     : theme.colors.primary,
               opacity:
                  selectedOrderIndex === null ||
                  selectedOrderIndex >= totalOrders - 1
                     ? 0.5
                     : 0.9,
            }}
            activeOpacity={0.7}
         >
            <Ionicons
               name="chevron-forward"
               size={20}
               color={
                  selectedOrderIndex === null ||
                  selectedOrderIndex >= totalOrders - 1
                     ? theme.colors.textSecondary
                     : "#ffffff"
               }
            />
         </TouchableOpacity>
      </View>
   );
};
