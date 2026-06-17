import { createContext, useContext, useEffect, useRef, useState } from "react"
import type { State } from "./types"
import { defaultState } from "./data"

const KEY = "planificador2026"

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw)
      if (s && s.hours) return s
    }
  } catch { /* ignore */ }
  return defaultState()
}

interface Ctx {
  s: State
  mutate: (fn: (draft: State) => void) => void
  replace: (s: State) => void
  reset: () => void
  savedAt: string
}

const StoreContext = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<State>(load)
  const [savedAt, setSavedAt] = useState("")
  const first = useRef(true)

  useEffect(() => {
    if (first.current) { first.current = false }
    localStorage.setItem(KEY, JSON.stringify(s))
    setSavedAt(new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }))
  }, [s])

  const mutate = (fn: (draft: State) => void) => {
    setS((prev) => { const draft = structuredClone(prev); fn(draft); return draft })
  }
  const replace = (next: State) => setS(next)
  const reset = () => setS(defaultState())

  return <StoreContext.Provider value={{ s, mutate, replace, reset, savedAt }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const c = useContext(StoreContext)
  if (!c) throw new Error("useStore must be used within StoreProvider")
  return c
}

/* ---- Aggregations ---- */
export function monthAgg(s: State, m: number) {
  const r = { ing: 0, gasto: 0, ahorro: 0, inv: 0, balance: 0 }
  for (const x of s.tx) {
    if (!x.d) continue
    if (+x.d.split("-")[1] !== m) continue
    if (x.t === "Ingreso") r.ing += +x.a || 0
    else if (x.t === "Gasto") r.gasto += +x.a || 0
    else if (x.t === "Ahorro") r.ahorro += +x.a || 0
    else if (x.t === "Inversión") r.inv += +x.a || 0
  }
  r.balance = r.ing - r.gasto - r.ahorro - r.inv
  return r
}

export function habitsOverall(s: State) {
  const h = s.habits
  if (!h.list.length) return 0
  let sum = 0
  for (const x of h.list) {
    const log = h.log[x.id] || {}
    const c = Object.values(log).filter(Boolean).length
    sum += Math.min(1, c / (x.meta || 1))
  }
  return sum / h.list.length
}
