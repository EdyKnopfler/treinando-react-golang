import { useState, useEffect, createContext, useMemo } from "react";

const LS_USER_KEY = 'authenticated_user'
const API_URL = import.meta.env.VITE_API_URL

export type LoggedUser = {
  id: number;
  name: string;
  email: string;
  accessToken: string;
}

export type AuthHook = {
  user: LoggedUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchAuthenticated: (endpoint: string, method?: string, body?: object | null) => Promise<unknown>
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

  const logout = async () => {
    await fetch(API_URL + '/logout', { method: 'POST' })
    localStorage.removeItem(LS_USER_KEY);
    setUser(null);
  }

  const refresh = async () => {
    const response = await fetch(`${API_URL}/refresh`, { method: 'POST', credentials: 'include' });

    if (response.status === 200) {
      const newData = await response.json()
      user!.accessToken = newData.accessToken  // Store the new token silently, without trigger a re-render
      localStorage.setItem(LS_USER_KEY, JSON.stringify(user))
      return true
    } else {
      await logout()
      return false
    }
  }

  const fetchAuthenticated = async (endpoint: string, method: string = 'GET', body: object | null = null): Promise<unknown> => {
    const accessToken = user!.accessToken
    
    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        method,
        headers: {
          Authorization: 'Bearer ' + accessToken,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      }
    )

    if (response.ok) {
      return await response.json();
    }

    if (response.statusText === 'Forbidden') {
      if (await refresh()) {
        return fetchAuthenticated(endpoint, method)
      }
    }
  }

  // Pegadinha loca: o Context está reagindo ao auth
  return useMemo(() => ({ user, login, logout, fetchAuthenticated }), [user])
}