import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { version } from "../../../package.json";
import { useAuth } from "../../lib/AuthContext";
import { useTheme } from "../../lib/ThemeContext";
import { LoginPage } from "../login/LoginPage";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { CustomAlert } from "../ui/CustomAlert";
import { Button } from "./../ui/Button";

export const AccountPage = () => {
   const { user, isAuthenticated, signout } = useAuth();
   const { theme, toggleTheme } = useTheme();
   const [showLogoutDialog, setShowLogoutDialog] = useState(false);
   const [alert, setAlert] = useState(null);

   // If not authenticated, show login page
   if (!isAuthenticated) {
      return <LoginPage />;
   }

   const handleLogout = async () => {
      try {
         await signout();
         setAlert({ type: "success", message: "Successfully logged out" });
         setShowLogoutDialog(false);
      } catch (error) {
         setAlert({ type: "error", message: "Error logging out" });
      }
   };

   const getInitials = (name) => {
      if (!name) return "U";
      return name
         .split(" ")
         .map((word) => word[0])
         .join("")
         .toUpperCase()
         .slice(0, 2);
   };

   const AccountSection = ({ title, children }) => (
      <View
         className="rounded-xl p-4 mb-4"
         style={{ backgroundColor: theme.colors.card }}
      >
         <Text
            className="text-lg font-semibold mb-3"
            style={{ color: theme.colors.text }}
         >
            {title}
         </Text>
         {children}
      </View>
   );

   const AccountRow = ({ label, value, onPress, showArrow = false }) => (
      <TouchableOpacity
         onPress={onPress}
         disabled={!onPress}
         className="flex-row justify-between items-center py-3"
      >
         <Text
            className="text-base"
            style={{ color: theme.colors.textSecondary }}
         >
            {label}
         </Text>
         <View className="flex-row items-center">
            <Text
               className="text-base font-medium"
               style={{ color: theme.colors.text }}
            >
               {value}
            </Text>
            {showArrow && (
               <Text
                  className="ml-2 text-lg"
                  style={{ color: theme.colors.textSecondary }}
               >
                  →
               </Text>
            )}
         </View>
      </TouchableOpacity>
   );

   return (
      <ScrollView
         className="flex-1 px-4"
         contentContainerStyle={{ paddingVertical: 20 }}
         style={{ backgroundColor: theme.colors.background }}
      >
         {/* Profile Header */}
         <View className="items-center mb-6">
            <View
               className="w-24 h-24 rounded-full items-center justify-center mb-4"
               style={{ backgroundColor: theme.colors.primary + "20" }}
            >
               <Text
                  className="text-3xl font-bold"
                  style={{ color: theme.colors.primary }}
               >
                  {getInitials(user?.name)}
               </Text>
            </View>
            <Text
               className="text-2xl font-bold text-center mb-1"
               style={{ color: theme.colors.text }}
            >
               {user?.name || "User"}
            </Text>
            <Text
               className="text-base text-center"
               style={{ color: theme.colors.textSecondary }}
            >
               @{user?.username}
            </Text>
         </View>

         {/* Account Information */}
         <AccountSection title="Account Information">
            <AccountRow label="Full Name" value={user?.name || "Not set"} />
            <AccountRow label="Username" value={user?.username || "Not set"} />
            <AccountRow label="User ID" value={user?.id || "Not set"} />
         </AccountSection>

         {/* Sign Out Button */}
         <View className="items-center mt-6 px-4">
            <Button
               title="Sign Out"
               variant="destructiveSoft"
               className="w-1/2"
               onPress={() => setShowLogoutDialog(true)}
               backgroundOpacity={0.2}
               borderOpacity={0.4}
               outlineOpacity={0.05}
            />
         </View>

         {/* App Info */}
         <View className="mt-6 items-center">
            <Text
               className="text-sm text-center"
               style={{ color: theme.colors.textSecondary }}
            >
               ES Orders App v{version}
            </Text>
         </View>

         {/* Logout Confirmation Dialog */}
         <ConfirmDialog
            visible={showLogoutDialog}
            title="Sign Out"
            message="Are you sure you want to sign out?"
            confirmText="Sign Out"
            cancelText="Cancel"
            onConfirm={handleLogout}
            onCancel={() => setShowLogoutDialog(false)}
         />

         {/* Alert */}
         {alert && (
            <CustomAlert
               type={alert.type}
               message={alert.message}
               onClose={() => setAlert(null)}
            />
         )}
      </ScrollView>
   );
};
