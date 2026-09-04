"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import useFetchData from "@/hook/TanstackQueries/useFetchData";
import {
  getStoredUser,
  getToken,
  removePreAuthToken,
  removeStoredUser,
  removeToken,
  setPreAuthToken,
  setStoredUser,
  setToken,
} from "@/lib/cookie";
import { AuthUser } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser) => void;
  setTokens: (token: string, preAuthToken?: string) => void;
  clearAuth: () => void;
}

// A real (non-undefined) default value — not just a convenience. `useFetchData`
// itself calls `useAuthStore()` internally, and `AuthProvider` below calls
// `useFetchData` (for the auto `/auth/me` refresh) *before* it renders its own
// `<AuthContext.Provider>`. At that moment `useContext(AuthContext)` sees no
// provider yet, so a `createContext(undefined)` + "throw if missing" pattern
// would break AuthProvider on its own first render. A harmless default avoids
// the chicken-and-egg problem — it's never actually relied on there, since
// `AuthProvider` passes its own local `token` state into that `useFetchData`
// call explicitly rather than reading it back out of context.
const defaultAuthContext: AuthContextValue = {
  user: null,
  token: "",
  isAuthenticated: false,
  isLoading: true,
  setUser: () => {},
  setTokens: () => {},
  clearAuth: () => {},
};

const AuthContext = createContext<AuthContextValue>(defaultAuthContext);

/**
 * Holds the authenticated user's identity for the whole app. On mount it
 * restores whatever session cookies the browser already had, then re-fetches
 * `/auth/me` to confirm the token is still valid and pick up any changes —
 * the actual auth/me call lives here so every consumer of `useAuthStore`
 * automatically stays in sync, instead of each page fetching it itself.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getStoredUser();
    if (storedToken) setTokenState(storedToken);
    if (storedUser) setUserState(storedUser);
    setHydrated(true);
  }, []);

  const {
    data: meResponse,
    isFetching: isFetchingMe,
    isError: meFailed,
  } = useFetchData<{ data: AuthUser }>({
    path: "auth/me",
    queryKey: "currentUser",
    token,
    enabled: hydrated && !!token,
  });

  useEffect(() => {
    if (meResponse?.data) {
      setUserState(meResponse.data);
      setStoredUser(meResponse.data);
    }
  }, [meResponse]);

  useEffect(() => {
    if (hydrated && token && meFailed) clearAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meFailed]);

  function setUser(nextUser: AuthUser) {
    setUserState(nextUser);
    setStoredUser(nextUser);
  }

  function setTokens(nextToken: string, preAuthToken?: string) {
    if (nextToken) {
      setTokenState(nextToken);
      setToken(nextToken);
    }
    if (preAuthToken) setPreAuthToken(preAuthToken);
  }

  function clearAuth() {
    setUserState(null);
    setTokenState("");
    removeToken();
    removePreAuthToken();
    removeStoredUser();
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading: !hydrated || (!!token && !user && isFetchingMe),
      setUser,
      setTokens,
      clearAuth,
    }),
    [user, token, hydrated, isFetchingMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthStore() {
  return useContext(AuthContext);
}
