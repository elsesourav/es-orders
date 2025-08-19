import { Eye, EyeOff, Lock, Mail, User, UserPlus, X } from "lucide-react";
import { useState } from "react";

const SignUp = ({ onSignUp, onSwitchToSignIn, onClose }) => {
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

   // Handle escape key
   const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) {
         onClose();
      }
   };

   // If there's an onClose prop, render as a modal
   if (onClose) {
      return (
         <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
         >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full mx-4 animate-scale-in">
               {/* Header */}
               <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-green-600 dark:text-green-400" />
                     </div>
                     <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Create Account
                     </h2>
                  </div>
                  <button
                     onClick={onClose}
                     className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                     <X className="w-4 h-4" />
                  </button>
               </div>

               {/* Form */}
               <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Show alert if there's an error */}
                  {alert && (
                     <div
                        className={`p-3 rounded-lg text-sm ${
                           alert.type === "error"
                              ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
                              : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                        }`}
                     >
                        {alert.message}
                     </div>
                  )}

                  {/* Full Name Input */}
                  <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name
                     </label>
                     <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                           type="text"
                           value={formData.name}
                           onChange={(e) =>
                              handleChange("name", e.target.value)
                           }
                           required
                           className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                           placeholder="Enter your full name"
                        />
                     </div>
                  </div>

                  {/* Username Input */}
                  <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Username
                     </label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                           type="text"
                           value={formData.username}
                           onChange={(e) =>
                              handleChange("username", e.target.value)
                           }
                           required
                           className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                           placeholder="Enter your username"
                        />
                     </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                     </label>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                           type={showPassword ? "text" : "password"}
                           value={formData.password}
                           onChange={(e) =>
                              handleChange("password", e.target.value)
                           }
                           required
                           className="w-full pl-10 pr-12 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                           placeholder="Enter your password"
                        />
                        <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                        >
                           {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                           ) : (
                              <Eye className="w-4 h-4" />
                           )}
                        </button>
                     </div>
                     <p className="text-xs text-gray-500 dark:text-gray-400">
                        Password must be at least 4 characters long
                     </p>
                  </div>

                  {/* Submit Button */}
                  <button
                     type="submit"
                     disabled={loading}
                     className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                     {loading ? (
                        <div className="flex items-center justify-center gap-2">
                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                           Creating account...
                        </div>
                     ) : (
                        "Create Account"
                     )}
                  </button>
               </form>

               {/* Footer */}
               <div className="flex items-center justify-center p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                     Already have an account?{" "}
                     <button
                        onClick={onSwitchToSignIn}
                        className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors duration-200"
                     >
                        Sign in
                     </button>
                  </p>
               </div>
            </div>

            <style>{`
               @keyframes fadeIn {
                  0% { opacity: 0; }
                  100% { opacity: 1; }
               }
               @keyframes scaleIn {
                  0% {
                     opacity: 0;
                     transform: scale(0.95) translateY(-10px);
                  }
                  100% {
                     opacity: 1;
                     transform: scale(1) translateY(0);
                  }
               }
               .animate-fade-in {
                  animation: fadeIn 0.2s ease-out;
               }
               .animate-scale-in {
                  animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
               }
            `}</style>
         </div>
      );
   }

   // If no onClose prop, don't render anything (no embedded component)
   return null;
};

export default SignUp;
