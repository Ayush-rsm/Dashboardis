import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getMe } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token")
  );

  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD CURRENT USER
  // =====================================================

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getMe();

        setUser(userData);
      } catch (error) {
        console.error("Failed to load user:", error);

        // Invalid / expired token
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // =====================================================
  // LOGIN
  // =====================================================

  const loginUser = async (data) => {
    localStorage.setItem(
      "access_token",
      data.access_token
    );

    if (data.refresh_token) {
      localStorage.setItem(
        "refresh_token",
        data.refresh_token
      );
    }

    setAccessToken(data.access_token);

    const userData = await getMe();

    setUser(userData);
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logoutUser = () => {
    // Remove authentication tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Clear React auth state
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =========================================================
// AUTH HOOK
// =========================================================

export function useAuth() {
  return useContext(AuthContext);
}