import { Modal, Text, TouchableWithoutFeedback, View } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { Button } from "./Button";

export const ConfirmDialog = ({
   visible = false,
   title,
   message,
   onConfirm,
   onCancel,
   confirmText = "Confirm",
   cancelText = "Cancel",
   confirmVariant = "primary",
   cancelVariant = "outline",
}) => {
   const { theme } = useTheme();

   if (!visible) return null;

   return (
      <Modal
         transparent
         visible={visible}
         animationType="fade"
         onRequestClose={onCancel}
      >
         <TouchableWithoutFeedback onPress={onCancel}>
            <View className="flex-1 justify-center items-center bg-black/50 px-6">
               <TouchableWithoutFeedback>
                  <View
                     className="w-full max-w-sm p-6 rounded-2xl shadow-2xl"
                     style={{ backgroundColor: theme.colors.card }}
                  >
                     {title && (
                        <Text
                           className="text-lg font-bold mb-2 text-center"
                           style={{ color: theme.colors.text }}
                        >
                           {title}
                        </Text>
                     )}

                     {message && (
                        <Text
                           className="text-center mb-6"
                           style={{ color: theme.colors.textSecondary }}
                        >
                           {message}
                        </Text>
                     )}

                     <View className="flex-row gap-4 justify-center">
                        <Button
                           title={cancelText}
                           onPress={onCancel}
                           variant={cancelVariant}
                           style={{ flex: 1 }}
                        />
                        <Button
                           title={confirmText}
                           onPress={onConfirm}
                           variant={confirmVariant}
                           style={{ flex: 1 }}
                        />
                     </View>
                  </View>
               </TouchableWithoutFeedback>
            </View>
         </TouchableWithoutFeedback>
      </Modal>
   );
};
