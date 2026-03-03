import { removeChromeLocal, setChromeLocal } from "@lib/storage";
import { supabase } from "@lib/supabaseClient";
import { STORAGE_KEYS } from "@utils/constants";
import bcrypt from "bcryptjs";
import Cookies from "js-cookie";

export type AppUser = {
  id: string;
  name: string | null;
  username: string;
  password?: string;
  created_at?: string;
  last_login?: string | null;
};

type AuthPayload = {
  name?: string;
  username: string;
  password: string;
};

const COOKIE_KEY = "user";

export async function createUser(input: AuthPayload) {
  const username = input.username.trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(input.password, 10);
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        name: input.name || null,
        username,
        password: hashedPassword,
        last_login: nowIso,
      },
    ])
    .select("id,name,username,created_at,last_login")
    .single();

  if (error) throw new Error(error.message);
  return data as AppUser;
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id,name,username,password,created_at,last_login")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as AppUser | null) || null;
}

export async function getUserByUsername(username: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id,name,username,password,created_at,last_login")
    .eq("username", username.trim().toLowerCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as AppUser | null) || null;
}

export async function listUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("id,name,username,created_at,last_login")
    .order("username", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []) as AppUser[];
}

export async function updateUserLastLogin(userId: string) {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("users")
    .update({ last_login: nowIso })
    .eq("id", userId)
    .select("id,name,username,created_at,last_login")
    .single();

  if (error) throw new Error(error.message);
  return data as AppUser;
}

export const fetchAllUsers = listUsers;

export function setUserCookie(
  id: string,
  name: string | null,
  username: string,
) {
  const userData = { id, name, username };
  Cookies.set(COOKIE_KEY, JSON.stringify(userData), { expires: 90 });
  void setChromeLocal(STORAGE_KEYS.CURRENT_USER, userData);
}

export function getUserCookie(): {
  id: string;
  name: string | null;
  username: string;
} | null {
  const cookie = Cookies.get(COOKIE_KEY);
  if (!cookie) return null;

  try {
    return JSON.parse(cookie);
  } catch {
    return null;
  }
}

export function getUserId(): string | null {
  return getUserCookie()?.id || null;
}

export function removeUserCookie() {
  Cookies.remove(COOKIE_KEY);
  void removeChromeLocal(STORAGE_KEYS.CURRENT_USER);
}

export async function signup(input: AuthPayload) {
  const user = await createUser(input);
  setUserCookie(user.id, user.name ?? null, user.username);
  return { data: user, error: null };
}

export async function signin(
  input: Pick<AuthPayload, "username" | "password">,
) {
  const user = await getUserByUsername(input.username);
  if (!user?.password) {
    return { data: null, error: "User not found" };
  }

  const isMatch = await bcrypt.compare(input.password, user.password);
  if (!isMatch) {
    return { data: null, error: "Invalid password" };
  }

  const updatedUser = await updateUserLastLogin(user.id);

  const safeUser = {
    id: updatedUser.id,
    name: updatedUser.name ?? null,
    username: updatedUser.username,
    created_at: updatedUser.created_at,
    last_login: updatedUser.last_login ?? null,
  };
  setUserCookie(safeUser.id, safeUser.name, safeUser.username);
  return { data: safeUser, error: null };
}

export function signout() {
  removeUserCookie();
}
