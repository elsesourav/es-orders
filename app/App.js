import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import "./global.css";
import { AuthProvider, useAuth } from "./src/lib/AuthContext";
import { ThemeProvider, useTheme } from "./src/lib/ThemeContext";
import { AccountScreen } from "./src/screens/AccountScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { OrdersScreen } from "./src/screens/OrdersScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Loading component
const LoadingScreen = () => {
   const { theme } = useTheme();
   return (
      <View
         className="flex-1 justify-center items-center"
         style={{ backgroundColor: theme.colors.background }}
      >
         <Text style={{ color: theme.colors.text }}>Loading...</Text>
      </View>
   );
};

// Main Tab Navigator for authenticated users
const MainTabNavigator = () => {
   const { theme } = useTheme();

   return (
      <Tab.Navigator
         screenOptions={{
            headerStyle: {
               backgroundColor: theme.colors.surface,
            },
            headerTintColor: theme.colors.text,
            headerTitleStyle: {
               fontWeight: "bold",
            },
            tabBarStyle: {
               backgroundColor: theme.colors.surface,
               borderTopColor: theme.colors.border,
               borderTopWidth: 1,
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.textSecondary,
            tabBarLabelStyle: {
               fontSize: 12,
               fontWeight: "500",
            },
         }}
      >
         <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
               title: "Dashboard",
               tabBarIcon: ({ color, size }) => (
                  <Text style={{ color, fontSize: size }}>🏠</Text>
               ),
            }}
         />
         <Tab.Screen
            name="Orders"
            component={OrdersScreen}
            options={{
               title: "Orders",
               tabBarIcon: ({ color, size }) => (
                  <Text style={{ color, fontSize: size }}>📦</Text>
               ),
            }}
         />
         <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
               title: "Settings",
               tabBarIcon: ({ color, size }) => (
                  <Text style={{ color, fontSize: size }}>⚙️</Text>
               ),
            }}
         />
         <Tab.Screen
            name="Account"
            component={AccountScreen}
            options={{
               title: "Account",
               tabBarIcon: ({ color, size }) => (
                  <Text style={{ color, fontSize: size }}>👤</Text>
               ),
            }}
         />
      </Tab.Navigator>
   );
};

// App Navigator
const AppNavigator = () => {
   const { user, loading } = useAuth();
   const { theme } = useTheme();

   if (loading) {
      return <LoadingScreen />;
   }

   return (
      <NavigationContainer>
         <Stack.Navigator
            screenOptions={{
               headerShown: false, // Hide headers since tabs will handle them
            }}
         >
            {user ? (
               <Stack.Screen
                  name="MainTabs"
                  component={MainTabNavigator}
                  options={{ headerShown: false }}
               />
            ) : (
               <Stack.Screen
                  name="Login"
                  component={LoginScreen}
                  options={{ headerShown: false }}
               />
            )}
         </Stack.Navigator>
      </NavigationContainer>
   );
};

// Main App component
export default function App() {
   return (
      <ThemeProvider>
         <AuthProvider>
            <AppNavigator />
            <StatusBar style="auto" />
         </AuthProvider>
      </ThemeProvider>
   );
}
