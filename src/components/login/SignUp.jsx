import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { CustomAlert } from "../index";
import { TextInput } from "../inputs";

const SignUp = ({ onSignUp, onSwitchToSignIn }) => {
   const [formData, setFormData] = useState({
      name: "",
      username: "",
      password: "",
   });
   const [showPassword, setShowPassword] = useState(false);
   const [loading, setLoading] = useState(false);
   const [alert, setAlert] = useState(null);

   const handleChange = (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setAlert(null);

      // Validate empty fields
      if (!formData.name.trim()) {
         setAlert({
            type: "error",
            message: "Full name is required",
         });
         setLoading(false);
         return;
      }

      if (!formData.username.trim()) {
         setAlert({
            type: "error",
            message: "Username is required",
         });
         setLoading(false);
         return;
      }

      if (!formData.password.trim()) {
         setAlert({
            type: "error",
            message: "Password is required",
         });
         setLoading(false);
         return;
      }

      // Additional validation for password strength
      if (formData.password.length < 4) {
         setAlert({
            type: "error",
            message: "Password must be at least 4 characters long",
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
            setAlert({ type: "success", message: "Registration successful!" });
         }
      } catch (error) {
         setAlert({ type: "error", message: error.message });
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="flex items-center justify-center min-h-[60vh]">
         <div className="w-full max-w-sm mx-auto">
            <div className="text-center mb-8">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Create Account
               </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
               <TextInput
                  label="Full Name"
                  value={formData.name}
                  onChange={(value) => handleChange("name", value)}
                  placeholder="Enter your full name"
                  required
               />

               <TextInput
                  label="Username"
                  value={formData.username}
                  onChange={(value) => handleChange("username", value)}
                  placeholder="Enter your username"
                  required
               />

               <div className="relative">
                  <TextInput
                     label="Password"
                     type={showPassword ? "text" : "password"}
                     value={formData.password}
                     onChange={(value) => handleChange("password", value)}
                     placeholder="Enter your password"
                     required
                  />
                  <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-3 bottom-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
               </div>

               <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 active:scale-[0.98] disabled:bg-primary-400 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center transform"
               >
                  {loading ? (
                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                     <span>Create Account</span>
                  )}
               </button>

               <div className="text-center mt-6">
                  <button
                     type="button"
                     onClick={onSwitchToSignIn}
                     className="text-primary-600 hover:text-primary-700 active:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 dark:active:text-primary-200 font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95 transform"
                  >
                     Already have an account? Sign in
                  </button>
               </div>
            </form>

            {alert && (
               <CustomAlert
                  type={alert.type}
                  message={alert.message}
                  onClose={() => setAlert(null)}
               />
            )}
         </div>
      </div>
   );
};

export default SignUp;
