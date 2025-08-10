import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
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
   // Simple password hashing for React Native (using basic encoding)
   hashPassword: (password) => {
      // For demo purposes - in production, use a proper crypto library
      // Simple hash using string manipulation for React Native compatibility
      let hash = 0;
      const saltedPassword = password + "salt_key_here";
      for (let i = 0; i < saltedPassword.length; i++) {
         const char = saltedPassword.charCodeAt(i);
         hash = (hash << 5) - hash + char;
         hash = hash & hash; // Convert to 32-bit integer
      }
      return hash.toString(36);
   },

   verifyPassword: (password, hashedPassword) => {
      return AuthAPI.hashPassword(password) === hashedPassword;
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
      const hashedPassword = AuthAPI.hashPassword(password);
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
   },

   signin: async ({ username, password }) => {
      const { data: user, error } = await AuthAPI.getUserByUsername(
         username.toLowerCase()
      );
      if (error || !user) {
         return { data: null, error: "User not found" };
      }

      const isMatch = AuthAPI.verifyPassword(password, user.password);
      if (!isMatch) {
         return { data: null, error: "Invalid password" };
      }

      await AuthAPI.setUserStorage(user.id, user.name, user.username);
      return { data: user, error: null };
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
         console.log("Attempting login with:", { username, password });

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
      }
   };

   const register = async ({ name, username, password }) => {
      try {
         console.log("Attempting signup with:", { name, username });

         const { data, error } = await AuthAPI.signup({
            name,
            username: username.trim().toLowerCase(),
            password,
         });

         console.log("Signup response:", { data, error });

         if (error) {
            console.error("Signup error:", error);
            throw new Error(error);
         }

         if (data) {
            setUser(data);
            return { success: true, user: data };
         }

         throw new Error("Signup failed");
      } catch (error) {
         console.error("Signup error:", error);
         return { success: false, error: error.message };
      }
   };

   const logout = async () => {
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
      logout,
      isAuthenticated: !!user,
   };

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export getUserId for use in other API files
export const getUserId = AuthAPI.getUserId;
