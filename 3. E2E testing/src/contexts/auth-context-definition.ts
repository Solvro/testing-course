import { createContext } from "react";

export interface AuthContextType {
  user: { email: string } | null;
  login: (email: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
