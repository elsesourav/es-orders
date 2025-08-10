import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { ThemeProvider, useTheme } from "./src/lib/ThemeContext";

const Stack = createStackNavigator();

// Simple Login Screen without NativeWind
const SimpleLoginScreen = () => {
   const { theme } = useTheme();

   return (
      <View
         style={[
            styles.container,
            { backgroundColor: theme.colors.background },
         ]}
      >
         <Text style={[styles.title, { color: theme.colors.text }]}>
            ES Orders Mobile
         </Text>
         <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            React Native app is ready!
         </Text>
         <Text style={[styles.info, { color: theme.colors.textSecondary }]}>
            Authentication and navigation setup complete.
         </Text>
      </View>
   );
};

// Simple Home Screen
const SimpleHomeScreen = () => {
   const { user, logout } = useAuth();
   const { theme } = useTheme();

   return (
      <View
         style={[
            styles.container,
            { backgroundColor: theme.colors.background },
         ]}
      >
         <Text style={[styles.title, { color: theme.colors.text }]}>
            Welcome!
         </Text>
         <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            User: {user?.email}
         </Text>
         <Text style={[styles.info, { color: theme.colors.textSecondary }]}>
            Your React Native app is working correctly.
         </Text>
      </View>
   );
};

// Loading component
const LoadingScreen = () => {
   const { theme } = useTheme();
   return (
      <View
         style={[
            styles.container,
            { backgroundColor: theme.colors.background },
         ]}
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
               <Stack.Screen
                  name="Home"
                  component={SimpleHomeScreen}
                  options={{
                     title: "Dashboard",
                  }}
               />
            ) : (
               <Stack.Screen
                  name="Login"
                  component={SimpleLoginScreen}
                  options={{
                     title: "Welcome",
                  }}
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

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
   },
   title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
      textAlign: "center",
   },
   subtitle: {
      fontSize: 18,
      marginBottom: 10,
      textAlign: "center",
   },
   info: {
      fontSize: 14,
      textAlign: "center",
      marginTop: 20,
   },
});
