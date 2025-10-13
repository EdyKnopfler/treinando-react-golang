import { useState, useEffect, createContext, useMemo } from "react";

const LS_USER_KEY = 'authenticated_user'
const API_URL = import.meta.env.VITE_API_URL

type LoggedUser = {
  id: number;
  name: string;
  email: string;
  authToken: string;
}

type AuthHook = {
  user: LoggedUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthHook | null>(null)

export const useAuth = () => {
  const [user, setUser] = useState<LoggedUser | null>(null)

  useEffect(() => {
    const userJson = localStorage.getItem(LS_USER_KEY)

    if (userJson) {
      setUser(JSON.parse(userJson))
    }
  }, [])

  const login = async (username: string, password: string) => {
    const response = await fetch(API_URL + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })

    if (response.ok) {
      const user = await response.json()
      localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
      setUser(user);
    }
  }

  const logout = () => {
    localStorage.removeItem(LS_USER_KEY);
    setUser(null);
  }

  // Pegadinha loca: o Context está reagindo ao auth
  return useMemo(() => ({ user, login, logout }), [user])
}