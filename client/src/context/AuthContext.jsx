import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  // Restore the session on first load
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(logout)
      .finally(() => setLoading(false));
  }, [logout]);

  // Any 401 from the API (expired/invalid token) signs the user out
  useEffect(() => {
    window.addEventListener("auth:expired", logout);
    return () => window.removeEventListener("auth:expired", logout);
  }, [logout]);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  /** Merge profile changes (e.g. after saving settings) into the session user. */
  const updateUser = (changes) =>
    setUser((prev) => {
      const next = { ...prev, ...changes };
      next.fullName = `${next.firstName ?? ""} ${next.lastName ?? ""}`.trim();
      return next;
    });

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
