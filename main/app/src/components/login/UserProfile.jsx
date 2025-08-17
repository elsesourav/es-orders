import { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { CustomAlert } from "../ui/CustomAlert";

export const UserProfile = ({ user, onLogout }) => {
   const { theme } = useTheme();
   const [showLogoutDialog, setShowLogoutDialog] = useState(false);
   const [alert, setAlert] = useState(null);

   const handleLogout = () => {
      onLogout();
      setAlert({ type: "success", message: "Successfully logged out" });
      setShowLogoutDialog(false);
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

   const formatDate = (dateString) => {
      if (!dateString) return "Unknown";
      return new Date(dateString).toLocaleDateString();
   };

   return (
      <ScrollView
         className="flex-1 px-6"
         contentContainerStyle={{ paddingVertical: 20 }}
         style={{ backgroundColor: theme.colors.background }}
      >
         <View className="flex-1 justify-center">
            {/* Profile Header */}
            <View className="items-center mb-8">
               <View
                  className="w-20 h-20 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: theme.colors.primary + "20" }}
               >
                  {user?.user_metadata?.avatar_url ? (
                     <Image
                        source={{ uri: user.user_metadata.avatar_url }}
                        className="w-20 h-20 rounded-full"
                        resizeMode="cover"
                     />
                  ) : (
                     <Text
                        className="text-2xl font-bold"
                        style={{ color: theme.colors.primary }}
                     >
                        {getInitials(user?.user_metadata?.name || user?.email)}
                     </Text>
                  )}
               </View>

               <Text
                  className="text-3xl font-bold text-center mb-2"
                  style={{ color: theme.colors.text }}
               >
                  Welcome Back!
               </Text>
               <Text
                  className="text-lg text-center"
                  style={{ color: theme.colors.textSecondary }}
               >
                  You are successfully logged in
               </Text>
            </View>

            {/* User Info Card */}
            <View
               className="rounded-xl p-6 mb-6"
               style={{ backgroundColor: theme.colors.card }}
            >
               <View className="items-center space-y-3">
                  <Text
                     className="text-xl font-semibold text-center"
                     style={{ color: theme.colors.text }}
                  >
                     {user?.user_metadata?.name || "User"}
                  </Text>
                  <Text
                     className="text-center"
                     style={{ color: theme.colors.textSecondary }}
                  >
                     {user?.email}
                  </Text>
                  <View
                     className="px-3 py-1 rounded-full"
                     style={{ backgroundColor: "#10B981" + "20" }}
                  >
                     <Text
                        className="text-sm font-medium"
                        style={{ color: "#10B981" }}
                     >
                        ● Online
                     </Text>
                  </View>
               </View>
            </View>

            {/* User Details */}
            <View
               className="rounded-xl p-6 mb-6"
               style={{ backgroundColor: theme.colors.card }}
            >
               <Text
                  className="text-lg font-semibold mb-4"
                  style={{ color: theme.colors.text }}
               >
                  Account Details
               </Text>

               <View className="space-y-3">
                  <View className="flex-row justify-between">
                     <Text style={{ color: theme.colors.textSecondary }}>
                        User ID:
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
                        Created:
                     </Text>
                     <Text style={{ color: theme.colors.text }}>
                        {formatDate(user?.created_at)}
                     </Text>
                  </View>

                  <View className="flex-row justify-between">
                     <Text style={{ color: theme.colors.textSecondary }}>
                        Last Sign In:
                     </Text>
                     <Text style={{ color: theme.colors.text }}>
                        {formatDate(user?.last_sign_in_at)}
                     </Text>
                  </View>

                  <View className="flex-row justify-between">
                     <Text style={{ color: theme.colors.textSecondary }}>
                        Email Verified:
                     </Text>
                     <Text
                        style={{
                           color: user?.email_confirmed_at
                              ? "#10B981"
                              : "#EF4444",
                        }}
                     >
                        {user?.email_confirmed_at ? "Yes" : "No"}
                     </Text>
                  </View>
               </View>
            </View>

            {/* Logout Button */}
            <Button
               title="🚪 Sign Out"
               onPress={() => setShowLogoutDialog(true)}
               variant="outline"
               style={{
                  borderColor: "#EF4444",
               }}
               textStyle={{ color: "#EF4444" }}
            />

            {/* App Info */}
            <View className="mt-8 items-center">
               <Text
                  className="text-center text-sm"
                  style={{ color: theme.colors.textSecondary }}
               >
                  ES Orders Mobile v1.0.8
               </Text>
            </View>
         </View>

         {/* Logout Confirmation Dialog */}
         <ConfirmDialog
            visible={showLogoutDialog}
            title="Sign Out"
            message="Are you sure you want to sign out of your account?"
            confirmText="Sign Out"
            cancelText="Cancel"
            onConfirm={handleLogout}
            onCancel={() => setShowLogoutDialog(false)}
            confirmVariant="outline"
         />

         {/* Alert */}
         {alert && (
            <CustomAlert
               type={alert.type}
               message={alert.message}
               onClose={() => setAlert(null)}
               visible={true}
            />
         )}
      </ScrollView>
   );
};
