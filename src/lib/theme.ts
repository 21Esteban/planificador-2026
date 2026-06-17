import { useEffect, useState } from "react"

const TKEY = "planificador2026-theme"

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem(TKEY) as "light" | "dark") || "light"
  })
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem(TKEY, theme)
  }, [theme])
  return { theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) }
}
