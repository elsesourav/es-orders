import { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../lib/ThemeContext";
import { ThemeToggle } from "./ThemeToggle";

export const ResponsiveNav = ({
   activeTab,
   onTabChange,
   title = "ES Orders",
}) => {
   const { theme } = useTheme();
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

   const navItems = [
      { id: "home", label: "Home", icon: "🏠" },
      { id: "orders", label: "Orders", icon: "📦" },
      { id: "settings", label: "Settings", icon: "⚙️" },
      { id: "account", label: "Account", icon: "👤" },
   ];

   const getCurrentPageName = () => {
      const currentItem = navItems.find((item) => item.id === activeTab);
      return currentItem ? currentItem.label : "Home";
   };

   const handleNavClick = (tabId) => {
      onTabChange(tabId);
      setIsMobileMenuOpen(false);
   };

   return (
      <>
         {/* Main Navigation Header */}
         <View
            className="flex-row justify-between items-center px-4 py-3 border-b"
            style={{
               backgroundColor: theme.colors.surface,
               borderBottomColor: theme.colors.border,
            }}
         >
            <View className="flex-row items-center">
               <TouchableOpacity
                  onPress={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-lg mr-3"
                  style={{ backgroundColor: theme.colors.background }}
               >
                  <Text>☰</Text>
               </TouchableOpacity>
               <Text
                  className="text-lg font-bold"
                  style={{ color: theme.colors.text }}
               >
                  {title}
               </Text>
            </View>

            <View className="flex-row items-center space-x-2">
               <ThemeToggle size="sm" />
               <Text
                  className="text-sm font-medium"
                  style={{ color: theme.colors.textSecondary }}
               >
                  {getCurrentPageName()}
               </Text>
            </View>
         </View>

         {/* Mobile Menu Modal */}
         <Modal
            visible={isMobileMenuOpen}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setIsMobileMenuOpen(false)}
         >
            <SafeAreaView
               style={{ flex: 1, backgroundColor: theme.colors.background }}
            >
               {/* Menu Header */}
               <View
                  className="flex-row justify-between items-center px-4 py-3 border-b"
                  style={{ borderBottomColor: theme.colors.border }}
               >
                  <Text
                     className="text-xl font-bold"
                     style={{ color: theme.colors.text }}
                  >
                     Menu
                  </Text>
                  <TouchableOpacity
                     onPress={() => setIsMobileMenuOpen(false)}
                     className="p-2 rounded-lg"
                     style={{ backgroundColor: theme.colors.surface }}
                  >
                     <Text>✕</Text>
                  </TouchableOpacity>
               </View>

               {/* Menu Items */}
               <ScrollView className="flex-1 px-4 py-4">
                  {navItems.map((item) => (
                     <TouchableOpacity
                        key={item.id}
                        onPress={() => handleNavClick(item.id)}
                        className={`flex-row items-center px-4 py-4 mb-2 rounded-lg ${
                           activeTab === item.id ? "opacity-100" : "opacity-70"
                        }`}
                        style={{
                           backgroundColor:
                              activeTab === item.id
                                 ? theme.colors.primary + "20"
                                 : theme.colors.surface,
                        }}
                     >
                        <Text className="text-xl mr-4">{item.icon}</Text>
                        <Text
                           className="text-lg font-medium"
                           style={{
                              color:
                                 activeTab === item.id
                                    ? theme.colors.primary
                                    : theme.colors.text,
                           }}
                        >
                           {item.label}
                        </Text>
                     </TouchableOpacity>
                  ))}
               </ScrollView>

               {/* Menu Footer */}
               <View
                  className="px-4 py-4 border-t"
                  style={{ borderTopColor: theme.colors.border }}
               >
                  <View className="flex-row justify-between items-center">
                     <Text
                        className="text-sm"
                        style={{ color: theme.colors.textSecondary }}
                     >
                        Version 1.0.8
                     </Text>
                     <ThemeToggle />
                  </View>
               </View>
            </SafeAreaView>
         </Modal>
      </>
   );
};
