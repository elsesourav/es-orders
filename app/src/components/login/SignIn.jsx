import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { Button } from "../Button";
import { CustomAlert } from "../CustomAlert";
import { TextInput } from "../ui/TextInput";

export const SignIn = ({ onSignIn, onSwitchToSignUp }) => {
   const { theme } = useTheme();
   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const [showPassword, setShowPassword] = useState(false);
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
         className="flex-1 px-6"
         contentContainerStyle={{ paddingVertical: 20 }}
         style={{ backgroundColor: theme.colors.background }}
      >
         <View className="flex-1 justify-center">
            <View className="mb-8">
               <Text
                  className="text-3xl font-bold text-center mb-2"
                  style={{ color: theme.colors.text }}
               >
                  Welcome Back
               </Text>
               <Text
                  className="text-lg text-center"
                  style={{ color: theme.colors.textSecondary }}
               >
                  Sign in to your account
               </Text>
            </View>

            <View className="space-y-4">
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
                  secureTextEntry={!showPassword}
                  required
               />

               <Button
                  title="Sign In"
                  onPress={handleSubmit}
                  loading={loading}
                  style={{ marginTop: 16 }}
               />

               <Button
                  title="Don't have an account? Sign Up"
                  onPress={onSwitchToSignUp}
                  variant="ghost"
               />
            </View>

            <View className="mt-8">
               <Text
                  className="text-center text-sm"
                  style={{ color: theme.colors.textSecondary }}
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
