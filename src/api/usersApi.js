import bcrypt from "bcryptjs";
import Cookies from "js-cookie";
import { supabase } from "../lib/supabaseClient";

// USERS TABLE API
export async function createUser({ name, username, password }) {
   return supabase
      .from("users")
      .insert([{ name, username: username.toLowerCase(), password }])
      .select()
      .single();
}
export async function getUserById(id) {
   return supabase.from("users").select("*").eq("id", id).single();
}
export async function getUserByUsername(username) {
   return supabase.from("users").select("*").eq("username", username).single();
}
export async function listUsers() {
   return supabase.from("users").select("*");
}

// Fetch all users (id, username, etc)
export async function fetchAllUsers() {
   const { data, error } = await supabase
      .from("users")
      .select("id, username, name");
   if (error) throw new Error(error.message);
   return data;
}

// SIGNUP: hash password, create user, set cookie
export async function signup({ name, username, password }) {
   const hashedPassword = await bcrypt.hash(password, 10);
   const { data, error } = await supabase
      .from("users")
      .insert([{ name, username, password: hashedPassword }])
      .select()
      .single();
   if (data && !error) {
      setUserCookie(data.id, data.name, data.username);
   }
   return { data, error };
}

// SIGNIN: check password, set cookie
export async function signin({ username, password }) {
   const { data: user, error } = await getUserByUsername(username);
   if (error || !user) {
      return { data: null, error: "User not found" };
   }
   const isMatch = await bcrypt.compare(password, user.password);
   if (!isMatch) {
      return { data: null, error: "Invalid password" };
   }
   setUserCookie(user.id, user.name, user.username);
   return { data: user, error: null };
}

export function setUserCookie(id, name, username) {
   const userData = {
      id,
      name,
      username,
   };

   // Set cookie for web pages
   Cookies.set("user", JSON.stringify(userData), { expires: 90 });

   // Also set in Chrome storage for background script access
   if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.set({ currentUser: userData });
   }
}

export function getUserCookie() {
   const cookie = Cookies.get("user");
   if (cookie) {
      try {
         return JSON.parse(cookie);
      } catch (error) {
         console.error("Error parsing user cookie:", error);
         return null;
      }
   }
   return null;
}

export function getUserId() {
   const cookie = Cookies.get("user");
   if (cookie) {
      try {
         return JSON.parse(cookie)?.id || null;
      } catch (error) {
         console.error("Error parsing user cookie:", error);
         return null;
      }
   }
   return null;
}

export function removeUserCookie() {
   Cookies.remove("user");
   // Also remove from Chrome storage
   if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.remove(["currentUser"]);
   }
}

export function signout() {
   removeUserCookie();
}
