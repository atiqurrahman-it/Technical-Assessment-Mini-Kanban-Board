import Cookies from "js-cookie";
import { AuthUser } from "@/types/auth";

const TOKEN_KEY = "kanban_token";
const PRE_AUTH_TOKEN_KEY = "kanban_pre_auth_token";
const USER_KEY = "kanban_user";

const COOKIE_OPTS = { expires: 7, sameSite: "lax" as const };

export const getToken = (): string | undefined => Cookies.get(TOKEN_KEY);
export const setToken = (token: string) => Cookies.set(TOKEN_KEY, token, COOKIE_OPTS);
export const removeToken = () => Cookies.remove(TOKEN_KEY);

// Kept for interface parity with the original multi-step (OTP) login flow —
// this app's login is single-step, so these are unused today but harmless.
export const getPreAuthToken = (): string | undefined => Cookies.get(PRE_AUTH_TOKEN_KEY);
export const setPreAuthToken = (token: string) => Cookies.set(PRE_AUTH_TOKEN_KEY, token, COOKIE_OPTS);
export const removePreAuthToken = () => Cookies.remove(PRE_AUTH_TOKEN_KEY);

export const getStoredUser = (): AuthUser | null => {
  const raw = Cookies.get(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};
export const setStoredUser = (user: AuthUser) => Cookies.set(USER_KEY, JSON.stringify(user), COOKIE_OPTS);
export const removeStoredUser = () => Cookies.remove(USER_KEY);
