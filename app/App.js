import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { AuthProvider, useAuth } from "./src/lib/AuthContext";
import { ThemeProvider, useTheme } from "./src/lib/ThemeContext";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";

const Stack = createStackNavigator();

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
               headerStyle: {
                  backgroundColor: theme.colors.surface,
               },
               headerTintColor: theme.colors.text,
               headerTitleStyle: {
                  fontWeight: "bold",
               },
            }}
         >
            {user ? (
               <>
                  <Stack.Screen
                     name="Home"
                     component={HomeScreen}
                     options={{
                        title: "Dashboard",
                        headerShown: false,
                     }}
                  />
                  {/* Add more authenticated screens here */}
               </>
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
