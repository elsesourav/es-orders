import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { CustomAlert } from "../ui/CustomAlert";
import { TextInput } from "../ui/TextInput";
import { Button } from "./../ui/Button";

export const SignIn = ({ onSignIn, onSwitchToSignUp }) => {
   const { theme } = useTheme();
   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const [loading, setLoading] = useState(false);
   const [alert, setAlert] = useState(null);

   const handleSubmit = async () => {
      setLoading(true);
      setAlert(null);

      // Validate empty fields
      if (!username || !username.trim()) {
         setAlert({ type: "error", message: "Username is required" });
         setLoading(false);
         return;
      }

      if (!password || !password.trim()) {
         setAlert({ type: "error", message: "Password is required" });
         setLoading(false);
         return;
      }

      try {
         console.log("SignIn: About to call onSignIn with:", {
            username: username,
            password: password,
         });

         const result = await onSignIn({
            username: username,
            password: password,
         });

         if (!result.success) {
            setAlert({ type: "error", message: result.error });
         } else {
            setAlert({ type: "success", message: "Login successful!" });
         }
      } catch (error) {
         setAlert({ type: "error", message: error.message });
      } finally {
         setLoading(false);
      }
   };

   return (
      <ScrollView
         contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 32,
         }}
         style={{ backgroundColor: theme.colors.background }}
         showsVerticalScrollIndicator={false}
      >
         <View
            style={{
               flex: 1,
               justifyContent: "center",
               maxWidth: 400,
               alignSelf: "center",
               width: "100%",
            }}
         >
            {/* Header */}
            <View style={{ alignItems: "center", marginBottom: 48 }}>
               <Text
                  style={{
                     fontSize: 32,
                     fontWeight: "bold",
                     color: theme.colors.text,
                     marginBottom: 8,
                     textAlign: "center",
                  }}
               >
                  Welcome Back
               </Text>
               <Text
                  style={{
                     fontSize: 18,
                     color: theme.colors.textSecondary,
                     textAlign: "center",
                     lineHeight: 24,
                  }}
               >
                  Sign in to your account
               </Text>
            </View>

            {/* Form */}
            <View style={{ marginBottom: 32 }}>
               <TextInput
                  label="Username"
                  placeholder="Enter your username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  required
               />

               <TextInput
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                  showPasswordToggle={true}
                  required
               />

               <Button
                  onPress={handleSubmit}
                  loading={loading}
                  style={{ marginTop: 8, marginBottom: 16 }}
                  size="lg"
               >
                  Sign In
               </Button>

               <Button onPress={onSwitchToSignUp} variant="ghost" size="lg">
                  Don't have an account? Sign Up
               </Button>
            </View>

            {/* Footer */}
            <View style={{ alignItems: "center", marginTop: 32 }}>
               <Text
                  style={{
                     fontSize: 14,
                     color: theme.colors.textSecondary,
                     textAlign: "center",
                     lineHeight: 20,
                  }}
               >
                  Secure login with custom authentication
               </Text>
            </View>
         </View>

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
