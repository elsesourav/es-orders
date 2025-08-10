import { supabase } from "./src/lib/supabaseClient.js";

// Simple test script to create a test user
async function createTestUser() {
   try {
      const { data, error } = await supabase.auth.signUp({
         email: "test@example.com",
         password: "test123456",
         options: {
            data: {
               name: "Test User",
            },
         },
      });

      if (error) {
         console.error("Error creating user:", error);
      } else {
         console.log("User created successfully:", data);
      }
   } catch (err) {
      console.error("Exception:", err);
   }
}

createTestUser();
