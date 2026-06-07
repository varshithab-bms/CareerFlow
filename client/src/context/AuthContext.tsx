import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AxiosError } from "axios";
import { api, clearStoredToken, getStoredToken, setStoredToken } from "../lib/api";
import { queryClient } from "../lib/queryClient";

const USER_KEY = "careerflow_user";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: { email: string; password: string; name?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeStoredUser(user: AuthUser | null): void {
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const ax = err as AxiosError<{ error?: { message?: string } }>;
    const msg = ax.response?.data?.error?.message;
    if (typeof msg === "string") return msg;
  }
  return "Something went wrong";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const t = getStoredToken();
    const u = readStoredUser();
    if (t && u) {
      setToken(t);
      setUser(u);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    function onExpired() {
      setUser(null);
      setToken(null);
      writeStoredUser(null);
    }
    window.addEventListener("careerflow:auth-expired", onExpired);
    return () => window.removeEventListener("careerflow:auth-expired", onExpired);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{
      success: boolean;
      data: { user: AuthUser; token: string };
    }>("/auth/login", { email, password });
    if (!data.success) throw new Error("Login failed");
    setStoredToken(data.data.token);
    writeStoredUser(data.data.user);
    setToken(data.data.token);
    setUser(data.data.user);
  }, []);

  const signup = useCallback(
    async (input: { email: string; password: string; name?: string }) => {
      const { data } = await api.post<{
        success: boolean;
        data: { user: AuthUser; token: string };
      }>("/auth/register", input);
      if (!data.success) throw new Error("Signup failed");
      setStoredToken(data.data.token);
      writeStoredUser(data.data.user);
      setToken(data.data.token);
      setUser(data.data.user);
    },
    [],
  );

  const logout = useCallback(() => {
    clearStoredToken();
    writeStoredUser(null);
    setToken(null);
    setUser(null);
    void queryClient.clear();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isReady,
      isAuthenticated: Boolean(token && user),
      login,
      signup,
      logout,
    }),
    [user, token, isReady, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
