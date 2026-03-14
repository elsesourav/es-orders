import { createContext, useContext, useEffect, useState } from "react";
import {
  getSavedAccountPassword,
  getSavedAccountsCookie,
  getUserCookie,
  removeAllAuthCookies,
  removeSavedAccountFromCookie,
  removeUserCookie,
  saveAccountToCookie,
  setUserCookie,
  signin,
  signup,
  verifyUserCredentials,
} from "../api/usersApi";

type AuthContextValue = {
  user: any;
  savedAccounts: any[];
  loading: boolean;
  login: (payload: { username: string; password: string }) => Promise<any>;
  addAccount: (payload: { username: string; password: string }) => Promise<any>;
  register: (payload: {
    name: string;
    username: string;
    password: string;
  }) => Promise<any>;
  logout: () => void;
  switchAccount: (
    username: string,
  ) => Promise<{ success: boolean; error?: string }>;
  disconnectAccount: (username: string) => {
    success: boolean;
    error?: string;
    disconnectedCurrent?: boolean;
  };
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user on mount
    const existingUser = getUserCookie();
    const accounts = getSavedAccountsCookie();
    setSavedAccounts(accounts);
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
      setSavedAccounts((prev) => {
        const username = String(data?.username || "").toLowerCase();
        const filtered = prev.filter(
          (account) =>
            String(account?.username || "").toLowerCase() !== username,
        );
        const next = [
          {
            id: data.id,
            name: data.name ?? null,
            username: data.username,
            lastUsedAt: new Date().toISOString(),
          },
          ...filtered,
        ];
        saveAccountToCookie(data.id, data.name ?? null, data.username);
        return next;
      });
      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const addAccount = async ({ username, password }) => {
    try {
      const { data, error } = await verifyUserCredentials({
        username,
        password,
      });
      if (error) {
        throw new Error(error);
      }

      const updated = saveAccountToCookie(
        data.id,
        data.name ?? null,
        data.username,
        password,
      );
      setSavedAccounts(updated);

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
      setSavedAccounts((prev) => {
        const username = String(data?.username || "").toLowerCase();
        const filtered = prev.filter(
          (account) =>
            String(account?.username || "").toLowerCase() !== username,
        );
        const next = [
          {
            id: data.id,
            name: data.name ?? null,
            username: data.username,
            lastUsedAt: new Date().toISOString(),
          },
          ...filtered,
        ];
        saveAccountToCookie(data.id, data.name ?? null, data.username);
        return next;
      });
      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const switchAccount = async (username: string) => {
    const target = savedAccounts.find(
      (account) =>
        String(account?.username || "").toLowerCase() ===
        String(username || "").toLowerCase(),
    );

    if (!target) {
      return { success: false, error: "Account not found" };
    }

    const savedPassword = getSavedAccountPassword(target.username);
    if (!savedPassword) {
      return {
        success: false,
        error: "Saved password not found. Please add account again.",
      };
    }

    const { data, error } = await signin({
      username: target.username,
      password: savedPassword,
    });

    if (error || !data) {
      return { success: false, error: error || "Switch failed" };
    }

    setUser(data);
    const updated = saveAccountToCookie(
      data.id,
      data.name ?? null,
      data.username,
      savedPassword,
    );
    setSavedAccounts(updated);

    return { success: true };
  };

  const disconnectAccount = (username: string) => {
    const targetUsername = String(username || "").toLowerCase();
    const isCurrent =
      String(user?.username || "").toLowerCase() === targetUsername;

    const updated = removeSavedAccountFromCookie(username);
    setSavedAccounts(updated);

    if (isCurrent) {
      const nextAccount = updated[0];
      if (nextAccount) {
        setUser({
          id: nextAccount.id,
          name: nextAccount.name ?? null,
          username: nextAccount.username,
        });
        setUserCookie(
          nextAccount.id,
          nextAccount.name ?? null,
          nextAccount.username,
        );
        saveAccountToCookie(
          nextAccount.id,
          nextAccount.name ?? null,
          nextAccount.username,
        );
      } else {
        setUser(null);
        removeUserCookie();
      }
    }

    return { success: true, disconnectedCurrent: isCurrent };
  };

  const logout = () => {
    removeAllAuthCookies();
    setSavedAccounts([]);
    setUser(null);
  };

  const value = {
    user,
    savedAccounts,
    loading,
    login,
    addAccount,
    register,
    logout,
    switchAccount,
    disconnectAccount,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
