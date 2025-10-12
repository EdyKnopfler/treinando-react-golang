import { type ReactNode } from "react"
import { useAuth } from "./useAuth"

export function Protected({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  if (!user) {
    return null
  }
  
  return children
}