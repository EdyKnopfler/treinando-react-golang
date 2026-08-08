import { useState, createContext, useMemo, useCallback, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL

export type LoggedUser = {
  id: number;
  name: string;
  accessToken: string;
}

export type AuthHook = {
  user: LoggedUser | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchAuthenticated: <T>(endpoint: string, method?: string, body?: object | null) => Promise<T>
};

export const AuthContext = createContext<AuthHook | null>(null)

export const useAuth = () => {
  const [user, setUser] = useState<LoggedUser | null>(null)
  const [initializing, setInitializing] = useState(true)

  const logout = useCallback(async () => {
    try {
      await fetch(API_URL + '/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // best-effort: mesmo com o backend inacessível, a sessão local é encerrada
    } finally {
      setUser(null);
    }
  }, [])

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const response = await fetch(API_URL + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    })

    if (response.ok) {
      const loggedUser = await response.json()
      setUser(loggedUser);
      return true
    } else {
      return false
    }
  }, [])

  // Renova a sessão a partir do cookie httpOnly do refresh token — é essa chamada,
  // não um storage local, que mantém o usuário logado ao reabrir o browser.
  const refresh = useCallback(async () => {
    const response = await fetch(`${API_URL}/refresh`, { method: 'POST', credentials: 'include' });

    if (response.status === 200) {
      const refreshedUser = await response.json()
      setUser(refreshedUser)
      return true
    } else {
      setUser(null)
      return false
    }
  }, [])

  useEffect(() => {
    let isCancelled = false;

    refresh().finally(() => {
      if (!isCancelled) {
        setInitializing(false)
      }
    })

    return () => {
      isCancelled = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAuthenticated = useCallback(async <T>(endpoint: string, method: string = 'GET', body: object | null = null, retried: boolean = false): Promise<T> => {
    if (!user) {
      throw new Error("User not authenticated")
    }

    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        method,
        headers: {
          Authorization: 'Bearer ' + user.accessToken,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      }
    )

    if (response.ok) {
      return await response.json() as T;
    }

    if (response.status === 403 && !retried) {
      if (await refresh()) {
        return fetchAuthenticated(endpoint, method, body, true)
      }
    }

    throw new Error(`Request failed with status ${response.status}`)
  }, [user, refresh])

  return useMemo(() => ({ user, initializing, login, logout, fetchAuthenticated }), [user, initializing, login, logout, fetchAuthenticated])
}