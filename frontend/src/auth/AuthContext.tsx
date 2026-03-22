import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  clearAuthTokens,
  getAccessToken,
  getMe,
  getRefreshToken,
  login as loginRequest,
  setAccessToken,
  setRefreshToken,
  type CurrentUser,
  type LoginPayload,
} from "../api";

type AuthContextValue = {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const initializeAuth = async () => {
      const hasStoredTokens = Boolean(getAccessToken() || getRefreshToken());

      if (!hasStoredTokens) {
        if (mountedRef.current) {
          setIsLoading(false);
        }

        return;
      }

      try {
        const currentUser = await getMe();

        if (mountedRef.current) {
          setUser(currentUser);
        }
      } catch {
        clearAuthTokens();

        if (mountedRef.current) {
          setUser(null);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    void initializeAuth();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshUser = async () => {
    const currentUser = await getMe();

    if (mountedRef.current) {
      setUser(currentUser);
    }
  };

  const login = async (payload: LoginPayload) => {
    const tokens = await loginRequest(payload);
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    await refreshUser();
  };

  const logout = () => {
    clearAuthTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
