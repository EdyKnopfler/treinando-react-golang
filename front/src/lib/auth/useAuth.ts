import { useState, createContext, useMemo, useCallback } from "react";

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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchAuthenticated: <T>(endpoint: string, method?: string, body?: object | null) => Promise<T>
};

export const AuthContext = createContext<AuthHook | null>(null)

const getStoredUser = (): LoggedUser | null => {
  const userJson = localStorage.getItem(LS_USER_KEY)
  if (!userJson) {
    return null
  }
  return JSON.parse(userJson)
}

export const useAuth = () => {
  const [user, setUser] = useState<LoggedUser | null>(getStoredUser)

  const logout = useCallback(async () => {
    try {
      await fetch(API_URL + '/logout', { method: 'POST' })
    } finally {
      localStorage.removeItem(LS_USER_KEY);
      setUser(null);
    }
  }, [])

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const response = await fetch(API_URL + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })

    if (response.ok) {
      const user = await response.json()
      localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
      setUser(user);
      return true
    } else {
      return false
    }
  }, [])

  const refresh = useCallback(async () => {
    const currentUser = getStoredUser();
    if (!currentUser) {
      await logout()
      return false
    }

    const response = await fetch(`${API_URL}/refresh`, { method: 'POST', credentials: 'include' });

    if (response.status === 200) {
      const newData = await response.json()
      currentUser.accessToken = newData.accessToken
      localStorage.setItem(LS_USER_KEY, JSON.stringify(currentUser))
      setUser(currentUser)
      return true
    } else {
      await logout()
      return false
    }
  }, [logout])

  const fetchAuthenticated = useCallback(async <T>(endpoint: string, method: string = 'GET', body: object | null = null): Promise<T> => {
    if (!user) {
      throw new Error("User not authenticated")
    }

    const accessToken = user.accessToken

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
      return await response.json() as T;
    }

    if (response.status === 403 || response.statusText === 'Forbidden') {
      if (await refresh()) {
        return fetchAuthenticated(endpoint, method, body)
      }
    }

    throw new Error(`Request failed with status ${response.status}`)
  }, [user, refresh])

  return useMemo(() => ({ user, login, logout, fetchAuthenticated }), [user, login, logout, fetchAuthenticated])
}