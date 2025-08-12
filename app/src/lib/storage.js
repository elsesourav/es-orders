import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
   getItem: async (key) => {
      try {
         const value = await AsyncStorage.getItem(key);
         return value ? JSON.parse(value) : null;
      } catch (error) {
         console.error("Error getting item from storage:", error);
         return null;
      }
   },

   setItem: async (key, value) => {
      try {
         await AsyncStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
         console.error("Error setting item in storage:", error);
      }
   },

   removeItem: async (key) => {
      try {
         await AsyncStorage.removeItem(key);
      } catch (error) {
         console.error("Error removing item from storage:", error);
      }
   },
};
