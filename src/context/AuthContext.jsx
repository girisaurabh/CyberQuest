import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(payload) {
      const result = await api.login(payload);
      setUser(result.user);
      return result.user;
    },
    async signup(payload) {
      const result = await api.signup(payload);
      setUser(result.user);
      return result.user;
    },
    async phoneLogin(payload) {\n      const result = await api.verifyPhone(payload);\n      setUser(result.user);\n      return result.user;\n    },\n    async logout() {
      await api.logout();
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
