import { useState, useEffect, createContext } from "react";

const LS_USER_KEY = 'authenticated_user'

type LoggedUser = {
  id: number;
  name: string;
  email: string;
  authToken: string;
  refreshToken: string;
}

type AuthHook = {
  user: LoggedUser | null;
  login: (email: string, password: string) => void;
};

export const AuthContext = createContext<AuthHook | null>(null)

export const useAuth = () => {
  const [user, setUser] = useState<LoggedUser | null>(null)

  useEffect(() => {
    // TODO api
    const userJson = localStorage.getItem(LS_USER_KEY)

    if (userJson) {
      setUser(JSON.parse(userJson))
    }
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = (email: string, password: string) => {
    // TODO api
    const user = { id: 1, name: 'Kânia', email, authToken: 'xxx', refreshToken: 'yyy' };
    localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
    setUser(user);
  }

  return {
    user,
    login,
  }
}