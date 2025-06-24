import React, { useState } from "react";
import { AuthContext } from "@/contexts/auth-context-definition";


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);

  const login = (email: string) => {
    setUser({ email });
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext>
  );
};
