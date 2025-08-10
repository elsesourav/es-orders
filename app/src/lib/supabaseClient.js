import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "your-supabase-url";
const supabaseAnonKey =
   process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "your-supabase-anon-key";

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key exists:", !!supabaseAnonKey);

// Use localStorage for web, AsyncStorage for mobile
const storage =
   Platform.OS === "web"
      ? typeof window !== "undefined"
         ? window.localStorage
         : AsyncStorage
      : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
   auth: {
      storage: storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === "web",
   },
});
