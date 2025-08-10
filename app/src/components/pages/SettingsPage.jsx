import { useState } from "react";
import {
   Alert,
   ScrollView,
   Switch,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../lib/AuthContext";
import { useTheme } from "../lib/ThemeContext";
import { ConfirmDialog } from "./ConfirmDialog";

export const SettingsPage = () => {
   const { theme, isDark, toggleTheme } = useTheme();
   const { user, logout } = useAuth();
   const [notifications, setNotifications] = useState(true);
   const [autoSync, setAutoSync] = useState(false);
   const [showLogoutDialog, setShowLogoutDialog] = useState(false);

   const settingSections = [
      {
         title: "Appearance",
         items: [
            {
               title: "Dark Mode",
               subtitle: "Switch between light and dark themes",
               type: "switch",
               value: isDark,
               onToggle: toggleTheme,
               icon: "🌙",
            },
         ],
      },
      {
         title: "Notifications",
         items: [
            {
               title: "Push Notifications",
               subtitle: "Receive notifications for new orders",
               type: "switch",
               value: notifications,
               onToggle: setNotifications,
               icon: "🔔",
            },
         ],
      },
      {
         title: "Data & Sync",
         items: [
            {
               title: "Auto Sync",
               subtitle: "Automatically sync data when online",
               type: "switch",
               value: autoSync,
               onToggle: setAutoSync,
               icon: "🔄",
            },
            {
               title: "Clear Cache",
               subtitle: "Free up storage space",
               type: "button",
               onPress: () =>
                  Alert.alert("Success", "Cache cleared successfully"),
               icon: "🧹",
            },
         ],
      },
      {
         title: "Account",
         items: [
            {
               title: "Export Data",
               subtitle: "Download your data",
               type: "button",
               onPress: () =>
                  Alert.alert("Info", "Data export feature coming soon"),
               icon: "📁",
            },
            {
               title: "Sign Out",
               subtitle: "Sign out of your account",
               type: "button",
               onPress: () => setShowLogoutDialog(true),
               icon: "🚪",
               destructive: true,
            },
         ],
      },
   ];

   const renderSettingItem = (item) => {
      if (item.type === "switch") {
         return (
            <View
               key={item.title}
               className="flex-row items-center justify-between p-4 mb-2 rounded-lg"
               style={{ backgroundColor: theme.colors.surface }}
            >
               <View className="flex-row items-center flex-1">
                  <Text className="text-2xl mr-3">{item.icon}</Text>
                  <View className="flex-1">
                     <Text
                        className="font-medium"
                        style={{ color: theme.colors.text }}
                     >
                        {item.title}
                     </Text>
                     <Text
                        className="text-sm mt-1"
                        style={{ color: theme.colors.textSecondary }}
                     >
                        {item.subtitle}
                     </Text>
                  </View>
               </View>
               <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{
                     false: theme.colors.border,
                     true: theme.colors.primary + "50",
                  }}
                  thumbColor={
                     item.value
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                  }
               />
            </View>
         );
      }

      if (item.type === "button") {
         return (
            <TouchableOpacity
               key={item.title}
               onPress={item.onPress}
               className="flex-row items-center p-4 mb-2 rounded-lg"
               style={{ backgroundColor: theme.colors.surface }}
            >
               <Text className="text-2xl mr-3">{item.icon}</Text>
               <View className="flex-1">
                  <Text
                     className="font-medium"
                     style={{
                        color: item.destructive ? "#EF4444" : theme.colors.text,
                     }}
                  >
                     {item.title}
                  </Text>
                  <Text
                     className="text-sm mt-1"
                     style={{ color: theme.colors.textSecondary }}
                  >
                     {item.subtitle}
                  </Text>
               </View>
               <Text style={{ color: theme.colors.textSecondary }}>›</Text>
            </TouchableOpacity>
         );
      }

      return null;
   };

   return (
      <SafeAreaView
         style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
         <ScrollView className="flex-1 px-6">
            <View className="py-6">
               <Text
                  className="text-2xl font-bold mb-2"
                  style={{ color: theme.colors.text }}
               >
                  Settings
               </Text>
               <Text
                  className="text-sm mb-6"
                  style={{ color: theme.colors.textSecondary }}
               >
                  Customize your app experience
               </Text>

               {settingSections.map((section) => (
                  <View key={section.title} className="mb-6">
                     <Text
                        className="text-lg font-semibold mb-3"
                        style={{ color: theme.colors.text }}
                     >
                        {section.title}
                     </Text>
                     {section.items.map(renderSettingItem)}
                  </View>
               ))}

               {/* App Info */}
               <View
                  className="p-4 rounded-lg mt-6"
                  style={{ backgroundColor: theme.colors.surface }}
               >
                  <Text
                     className="font-medium mb-2"
                     style={{ color: theme.colors.text }}
                  >
                     App Information
                  </Text>
                  <View className="space-y-2">
                     <View className="flex-row justify-between">
                        <Text style={{ color: theme.colors.textSecondary }}>
                           Version
                        </Text>
                        <Text style={{ color: theme.colors.text }}>1.0.8</Text>
                     </View>
                     <View className="flex-row justify-between">
                        <Text style={{ color: theme.colors.textSecondary }}>
                           User ID
                        </Text>
                        <Text
                           style={{ color: theme.colors.text }}
                           numberOfLines={1}
                        >
                           {user?.id?.slice(0, 8)}...
                        </Text>
                     </View>
                     <View className="flex-row justify-between">
                        <Text style={{ color: theme.colors.textSecondary }}>
                           Last Sync
                        </Text>
                        <Text style={{ color: theme.colors.text }}>
                           {new Date().toLocaleTimeString()}
                        </Text>
                     </View>
                  </View>
               </View>
            </View>
         </ScrollView>

         {/* Logout Confirmation Dialog */}
         <ConfirmDialog
            visible={showLogoutDialog}
            title="Sign Out"
            message="Are you sure you want to sign out of your account?"
            confirmText="Sign Out"
            cancelText="Cancel"
            onConfirm={async () => {
               await logout();
               setShowLogoutDialog(false);
            }}
            onCancel={() => setShowLogoutDialog(false)}
            confirmVariant="outline"
         />
      </SafeAreaView>
   );
};
