// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

/**
 * user: {
 *   token: string,
 *   userId: number,
 *   name: string,
 *   email: string,
 *   role: "CLIENT" | "ADMIN"
 * }
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar desde localStorage al iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem("auth");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const login = (authData) => {
    // Normalizamos por si acaso
    const normalized = {
      token: authData.token,
      userId: authData.userId,
      name: authData.name,
      email: authData.email,
      role: authData.role,
    };
    setUser(normalized);
    localStorage.setItem("auth", JSON.stringify(normalized));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
