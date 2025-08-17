import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { CustomAlert } from "../ui/CustomAlert";
import { TextInput } from "../ui/TextInput";
import { Button } from "./../ui/Button";

export const SignUp = ({ onSignUp, onSwitchToSignIn }) => {
   const { theme } = useTheme();
   const [formData, setFormData] = useState({
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
   });
   const [loading, setLoading] = useState(false);
   const [alert, setAlert] = useState(null);

   const handleChange = (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
   };

   const handleSubmit = async () => {
      setLoading(true);
      setAlert(null);

      // Validate empty fields
      if (!formData.name.trim()) {
         setAlert({ type: "error", message: "Full name is required" });
         setLoading(false);
         return;
      }

      if (!formData.username.trim()) {
         setAlert({ type: "error", message: "Username is required" });
         setLoading(false);
         return;
      }

      if (!formData.password.trim()) {
         setAlert({ type: "error", message: "Password is required" });
         setLoading(false);
         return;
      }

      if (formData.password !== formData.confirmPassword) {
         setAlert({ type: "error", message: "Passwords do not match" });
         setLoading(false);
         return;
      }

      if (formData.password.length < 6) {
         setAlert({
            type: "error",
            message: "Password must be at least 6 characters",
         });
         setLoading(false);
         return;
      }

      // Username validation
      if (formData.username.length < 3) {
         setAlert({
            type: "error",
            message: "Username must be at least 3 characters",
         });
         setLoading(false);
         return;
      }

      try {
         const result = await onSignUp({
            name: formData.name,
            username: formData.username,
            password: formData.password,
         });

         if (!result.success) {
            setAlert({ type: "error", message: result.error });
         } else {
            setAlert({
               type: "success",
               message: "Account created successfully!",
            });
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
            <View style={{ alignItems: "center", marginBottom: 40 }}>
               <Text
                  style={{
                     fontSize: 32,
                     fontWeight: "bold",
                     color: theme.colors.text,
                     marginBottom: 8,
                     textAlign: "center",
                  }}
               >
                  Create Account
               </Text>
               <Text
                  style={{
                     fontSize: 18,
                     color: theme.colors.textSecondary,
                     textAlign: "center",
                     lineHeight: 24,
                  }}
               >
                  Join our platform today
               </Text>
            </View>

            {/* Form */}
            <View style={{ marginBottom: 24 }}>
               <TextInput
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChangeText={(value) => handleChange("name", value)}
                  autoCapitalize="words"
                  required
               />

               <TextInput
                  label="Username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChangeText={(value) => handleChange("username", value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  helperText="Must be at least 3 characters"
                  required
               />

               <TextInput
                  label="Password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChangeText={(value) => handleChange("password", value)}
                  secureTextEntry={true}
                  showPasswordToggle={true}
                  helperText="Must be at least 6 characters"
                  required
               />

               <TextInput
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChangeText={(value) =>
                     handleChange("confirmPassword", value)
                  }
                  secureTextEntry={true}
                  showPasswordToggle={true}
                  required
               />

               <Button
                  title="Create Account"
                  onPress={handleSubmit}
                  loading={loading}
                  style={{ marginTop: 8, marginBottom: 16 }}
                  size="lg"
               />

               <Button
                  title="Already have an account? Sign In"
                  onPress={onSwitchToSignIn}
                  variant="ghost"
                  size="lg"
               />
            </View>

            {/* Footer */}
            <View style={{ alignItems: "center", marginTop: 24 }}>
               <Text
                  style={{
                     fontSize: 14,
                     color: theme.colors.textSecondary,
                     textAlign: "center",
                     lineHeight: 20,
                     paddingHorizontal: 16,
                  }}
               >
                  By signing up, you agree to our Terms of Service and Privacy
                  Policy
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
