import axios from "axios";

const TOKEN_KEY = "careerflow_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

const baseURL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

if (!baseURL) {
  throw new Error("Missing VITE_API_URL");
}

export const api = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login") &&
      !error.config?.url?.includes("/auth/register")
    ) {
      clearStoredToken();
      window.dispatchEvent(new CustomEvent("careerflow:auth-expired"));
    }
    return Promise.reject(error);
  },
);
