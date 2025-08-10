import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import bcrypt from "bcryptjs";
import { supabase } from "./supabaseClient";

const AuthContext = createContext();

export const useAuth = () => {
   const context = useContext(AuthContext);
   if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
   }
   return context;
};

// Authentication functions - all in one place
const AuthAPI = {
   // Secure password hashing using bcrypt
   hashPassword: async (password) => {
      try {
         const saltRounds = 10;
         const hashedPassword = await bcrypt.hash(password, saltRounds);
         return hashedPassword;
      } catch (error) {
         console.error("Error hashing password:", error);
         throw new Error("Failed to hash password");
      }
   },

   verifyPassword: async (password, hashedPassword) => {
      try {
         const isMatch = await bcrypt.compare(password, hashedPassword);
         return isMatch;
      } catch (error) {
         console.error("Error verifying password:", error);
         return false;
      }
   },

   // Storage functions
   setUserStorage: async (id, name, username) => {
      const userData = { id, name, username };
      try {
         await AsyncStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
         console.error("Error setting user storage:", error);
      }
   },

   getUserStorage: async () => {
      try {
         const userData = await AsyncStorage.getItem("user");
         if (userData) {
            return JSON.parse(userData);
         }
      } catch (error) {
         console.error("Error getting user storage:", error);
      }
      return null;
   },

   removeUserStorage: async () => {
      try {
         await AsyncStorage.removeItem("user");
      } catch (error) {
         console.error("Error removing user storage:", error);
      }
   },

   getUserId: async () => {
      try {
         const userData = await AsyncStorage.getItem("user");
         if (userData) {
            const parsed = JSON.parse(userData);
            return parsed?.id || null;
         }
      } catch (error) {
         console.error("Error getting user ID:", error);
      }
      return null;
   },

   // Database functions
   getUserByUsername: async (username) => {
      return supabase
         .from("users")
         .select("*")
         .eq("username", username)
         .single();
   },

   createUser: async ({ name, username, password }) => {
      return supabase
         .from("users")
         .insert([{ name, username: username.toLowerCase(), password }])
         .select()
         .single();
   },

   // Main auth functions
   signup: async ({ name, username, password }) => {
      try {
         const hashedPassword = await AuthAPI.hashPassword(password);
         const { data, error } = await supabase
            .from("users")
            .insert([
               {
                  name,
                  username: username.toLowerCase(),
                  password: hashedPassword,
               },
            ])
            .select()
            .single();

         if (data && !error) {
            await AuthAPI.setUserStorage(data.id, data.name, data.username);
         }
         return { data, error };
      } catch (error) {
         console.error("Signup error:", error);
         return { data: null, error: error.message };
      }
   },

   signin: async ({ username, password }) => {
      try {
         const { data: user, error } = await AuthAPI.getUserByUsername(
            username.toLowerCase()
         );
         if (error || !user) {
            return { data: null, error: "User not found" };
         }

         const isMatch = await AuthAPI.verifyPassword(password, user.password);
         if (!isMatch) {
            return { data: null, error: "Invalid password" };
         }

         await AuthAPI.setUserStorage(user.id, user.name, user.username);
         return { data: user, error: null };
      } catch (error) {
         console.error("Signin error:", error);
         return { data: null, error: error.message };
      }
   },

   signout: async () => {
      await AuthAPI.removeUserStorage();
   },
};

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      // Check if user is stored locally
      const checkStoredUser = async () => {
         try {
            setLoading(true);
            const storedUser = await AuthAPI.getUserStorage();
            if (storedUser) {
               setUser(storedUser);
            }
         } catch (error) {
            console.error("Error checking stored user:", error);
         } finally {
            setLoading(false);
         }
      };

      checkStoredUser();
   }, []);

   const login = async ({ username, password }) => {
      try {
         setLoading(true);
         console.log("Attempting login with:", { username });

         if (!username || !password) {
            throw new Error("Username and password are required");
         }

         const { data, error } = await AuthAPI.signin({
            username: username.trim().toLowerCase(),
            password,
         });

         console.log("Login response:", { data, error });

         if (error) {
            console.error("Login error:", error);
            throw new Error(error);
         }

         if (data) {
            setUser(data);
            return { success: true, user: data };
         }

         throw new Error("Login failed");
      } catch (error) {
         console.error("Login error:", error);
         return { success: false, error: error.message };
      } finally {
         setLoading(false);
      }
   };

   const register = async ({ name, username, password }) => {
      try {
         setLoading(true);
         console.log("Attempting signup with:", { name, username });

         if (!name || !username || !password) {
            throw new Error("All fields are required");
         }

         const { data, error } = await AuthAPI.signup({
            name,
            username: username.trim().toLowerCase(),
            password,
         });

         console.log("Signup response:", { data, error });

         if (error) {
            console.error("Signup error:", error);
            // Handle specific database errors
            if (error.code === "23505") {
               throw new Error("Username already exists");
            }
            throw new Error(error.message || "Signup failed");
         }

         if (data) {
            setUser(data);
            return { success: true, user: data };
         }

         throw new Error("Signup failed");
      } catch (error) {
         console.error("Signup error:", error);
         return { success: false, error: error.message };
      } finally {
         setLoading(false);
      }
   };

   const signout = async () => {
      try {
         await AuthAPI.signout();
         setUser(null);
      } catch (error) {
         console.error("Error during logout:", error);
      }
   };

   const value = {
      user,
      loading,
      login,
      register,
      logout: signout, // Provide both names for compatibility
      signout,
      isAuthenticated: !!user,
      // Debug function to check auth state
      getAuthState: () => ({
         user,
         loading,
         isAuthenticated: !!user,
         hasStoredUser: user !== null,
      }),
   };

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export getUserId for use in other API files
export const getUserId = AuthAPI.getUserId;
