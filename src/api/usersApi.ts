import bcrypt from "bcryptjs";
import Cookies from "js-cookie";
import { supabase } from "../lib/supabaseClient";

const COOKIE_KEY = "user";
const SAVED_ACCOUNTS_COOKIE_KEY = "saved_accounts";
const COOKIE_EXPIRE_DAYS = 180;

export type SavedAccount = {
  id: string | number;
  name: string | null;
  username: string;
  lastUsedAt: string;
  passwordToken?: string;
};

function encodePasswordToken(password: string) {
  try {
    return btoa(password);
  } catch {
    return "";
  }
}

function decodePasswordToken(token?: string) {
  if (!token) return null;
  try {
    return atob(token);
  } catch {
    return null;
  }
}

function normalizeUsername(username) {
  return String(username || "")
    .trim()
    .toLowerCase();
}

export async function createUser({ name, username, password }) {
  const safeUsername = normalizeUsername(username);
  if (!safeUsername) throw new Error("Username is required");
  if (!password) throw new Error("Password is required");

  const hashedPassword = await bcrypt.hash(password, 10);
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        name: name || null,
        username: safeUsername,
        password: hashedPassword,
        last_login: nowIso,
      },
    ])
    .select("id,name,username,created_at,last_login")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getUserById(id) {
  const { data, error } = await supabase
    .from("users")
    .select("id,name,username,password,created_at,last_login")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data || null;
}

export async function getUserByUsername(username) {
  const safeUsername = normalizeUsername(username);
  const { data, error } = await supabase
    .from("users")
    .select("id,name,username,password,created_at,last_login")
    .eq("username", safeUsername)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data || null;
}

export async function listUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("id,name,username,created_at,last_login")
    .order("username", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export const fetchAllUsers = listUsers;

export async function updateUserLastLogin(userId) {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("users")
    .update({ last_login: nowIso })
    .eq("id", userId)
    .select("id,name,username,created_at,last_login")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export function setUserCookie(id, name, username) {
  const userData = { id, name, username };
  Cookies.set(COOKIE_KEY, JSON.stringify(userData), {
    expires: COOKIE_EXPIRE_DAYS,
  });
}

export function getSavedAccountsCookie(): SavedAccount[] {
  const cookie = Cookies.get(SAVED_ACCOUNTS_COOKIE_KEY);
  if (!cookie) return [];
  try {
    const parsed = JSON.parse(cookie);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function setSavedAccountsCookie(accounts: SavedAccount[]) {
  Cookies.set(SAVED_ACCOUNTS_COOKIE_KEY, JSON.stringify(accounts), {
    expires: COOKIE_EXPIRE_DAYS,
  });
}

export function saveAccountToCookie(id, name, username, password?: string) {
  const existing = getSavedAccountsCookie();
  const normalized = normalizeUsername(username);
  const now = new Date().toISOString();
  const existingAccount = existing.find(
    (account) => normalizeUsername(account?.username) === normalized,
  );

  const filtered = existing.filter(
    (account) => normalizeUsername(account?.username) !== normalized,
  );

  const passwordToken = password
    ? encodePasswordToken(password)
    : existingAccount?.passwordToken;

  const updated: SavedAccount[] = [
    {
      id,
      name: name ?? null,
      username: normalized,
      lastUsedAt: now,
      passwordToken,
    },
    ...filtered,
  ];

  setSavedAccountsCookie(updated);
  return updated;
}

export function removeSavedAccountFromCookie(username) {
  const normalized = normalizeUsername(username);
  const existing = getSavedAccountsCookie();
  const updated = existing.filter(
    (account) => normalizeUsername(account?.username) !== normalized,
  );
  setSavedAccountsCookie(updated);
  return updated;
}

export function getUserCookie() {
  const cookie = Cookies.get(COOKIE_KEY);
  if (!cookie) return null;
  try {
    return JSON.parse(cookie);
  } catch {
    return null;
  }
}

export function getSavedAccountPassword(username) {
  const normalized = normalizeUsername(username);
  const account = getSavedAccountsCookie().find(
    (item) => normalizeUsername(item?.username) === normalized,
  );
  return decodePasswordToken(account?.passwordToken);
}

export function getUserId() {
  return getUserCookie()?.id || null;
}

export function removeUserCookie() {
  Cookies.remove(COOKIE_KEY);
}

export function removeSavedAccountsCookie() {
  Cookies.remove(SAVED_ACCOUNTS_COOKIE_KEY);
}

export function removeAllAuthCookies() {
  removeUserCookie();
  removeSavedAccountsCookie();
}

export async function signup({ name, username, password }) {
  const user = await createUser({ name, username, password });
  setUserCookie(user.id, user.name ?? null, user.username);
  saveAccountToCookie(user.id, user.name ?? null, user.username, password);
  return { data: user, error: null };
}

export async function signin({ username, password }) {
  const { data: safeUser, error } = await verifyUserCredentials({
    username,
    password,
  });
  if (error) {
    return { data: null, error };
  }

  setUserCookie(safeUser.id, safeUser.name, safeUser.username);
  saveAccountToCookie(safeUser.id, safeUser.name, safeUser.username, password);
  return { data: safeUser, error: null };
}

export async function verifyUserCredentials({ username, password }) {
  const user = await getUserByUsername(username);
  if (!user?.password) {
    return { data: null, error: "User not found" };
  }

  const isMatch = await bcrypt.compare(password, user.password);
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

  return { data: safeUser, error: null };
}

export function signout() {
  removeAllAuthCookies();
}
