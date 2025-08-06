import { createContext, useContext, useEffect, useState } from "react";
import {
   getUserCookie,
   removeUserCookie,
   signin,
   signup,
} from "../api/usersApi";

const AuthContext = createContext();

export const useAuth = () => {
   const context = useContext(AuthContext);
   if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
   }
   return context;
};

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      // Check for existing user on mount
      const existingUser = getUserCookie();
      if (existingUser) {
         setUser(existingUser);
      }
      setLoading(false);
   }, []);

   const login = async ({ username, password }) => {
      try {
         const { data, error } = await signin({ username, password });
         if (error) {
            throw new Error(error);
         }
         setUser(data);
         return { success: true, user: data };
      } catch (error) {
         return { success: false, error: error.message };
      }
   };

   const register = async ({ name, username, password }) => {
      try {
         const { data, error } = await signup({ name, username, password });
         if (error) {
            throw new Error(error.message);
         }
         setUser(data);
         return { success: true, user: data };
      } catch (error) {
         return { success: false, error: error.message };
      }
   };

   const logout = () => {
      removeUserCookie();
      setUser(null);
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
