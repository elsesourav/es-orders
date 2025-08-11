import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { version } from "../../package.json";
import { Button } from "../components/ui/Button";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { useTheme } from "../lib/ThemeContext";

export const SettingsScreen = () => {
   const { theme } = useTheme();

   const SettingsSection = ({ title, children }) => (
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

   const SettingsRow = ({ label, value, onPress, children }) => (
      <View className="flex-row justify-between items-center py-3">
         <Text
            className="text-base"
            style={{ color: theme.colors.textSecondary }}
         >
            {label}
         </Text>
         {children || (
            <Text
               className="text-base font-medium"
               style={{ color: theme.colors.text }}
            >
               {value}
            </Text>
         )}
      </View>
   );

   return (
      <SafeAreaView
         className="flex-1"
         style={{ backgroundColor: theme.colors.background }}
      >
         <ScrollView
            className="flex-1 px-4"
            contentContainerStyle={{ paddingVertical: 20 }}
         >
            {/* App Settings */}
            <SettingsSection title="App Settings">
               <SettingsRow label="Theme">
                  <ThemeToggle />
               </SettingsRow>
               <SettingsRow label="Version" value={version} />
            </SettingsSection>

            {/* Notification Settings */}
            <SettingsSection title="Notifications">
               <SettingsRow label="Order Updates" value="Enabled" />
               <SettingsRow label="Push Notifications" value="Enabled" />
            </SettingsSection>

            {/* Data & Privacy */}
            <SettingsSection title="Data & Privacy">
               <View className="space-y-3">
                  <Button
                     variant="secondary"
                     onPress={() => {}}
                     className="w-full"
                  >
                     Export Data
                  </Button>

                  <Button
                     variant="secondary"
                     onPress={() => {}}
                     className="w-full"
                  >
                     Clear Cache
                  </Button>
               </View>
            </SettingsSection>

            {/* About */}
            <SettingsSection title="About">
               <SettingsRow label="App Name" value="ES Orders" />
               <SettingsRow label="Developer" value="elsesourav" />
               <SettingsRow label="Build" value={`${version} (2025)`} />
            </SettingsSection>

            {/* App Info */}
            <View className="mt-6 items-center">
               <Text
                  className="text-sm text-center"
                  style={{ color: theme.colors.textSecondary }}
               >
                  ES Orders App v{version}
               </Text>
               <Text
                  className="text-xs text-center mt-1"
                  style={{ color: theme.colors.textSecondary }}
               >
                  © {new Date().getFullYear()} elsesourav
               </Text>
            </View>
         </ScrollView>
      </SafeAreaView>
   );
};
