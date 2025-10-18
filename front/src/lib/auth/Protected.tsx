import { useContext, type ReactNode } from "react"
import { AuthContext } from "./useAuth"

export function Protected({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);

  if (!auth?.user) {
    return null
  }
  
  return children
}