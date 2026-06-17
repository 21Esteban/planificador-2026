import { createContext, useContext, useEffect, useRef, useState } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { State } from "./types"
import { defaultState } from "./data"
import {
  type SyncConfig, type SyncStatus, loadSyncConfig, saveSyncConfig, makeClient, pullRemote, pushRemote,
} from "./sync"

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
  syncCfg: SyncConfig
  syncStatus: SyncStatus
  updateSync: (cfg: SyncConfig) => void
}

const StoreContext = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<State>(load)
  const [savedAt, setSavedAt] = useState("")
  const [syncCfg, setSyncCfg] = useState<SyncConfig>(loadSyncConfig)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("off")

  const clientRef = useRef<SupabaseClient | null>(null)
  const channelRef = useRef<ReturnType<SupabaseClient["channel"]> | null>(null)
  const applyingRemote = useRef(false)
  const lastSynced = useRef<string>("")
  const pushTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const sRef = useRef(s)
  sRef.current = s

  // ---- persist locally on every change
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(s))
    setSavedAt(new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }))
  }, [s])

  // ---- (re)connect to cloud when config changes
  useEffect(() => {
    // teardown previous
    if (channelRef.current && clientRef.current) clientRef.current.removeChannel(channelRef.current)
    channelRef.current = null
    clientRef.current = null

    if (!syncCfg.enabled || !syncCfg.url || !syncCfg.key || !syncCfg.code) {
      setSyncStatus("off")
      return
    }
    const client = makeClient(syncCfg)
    if (!client) { setSyncStatus("error"); return }
    clientRef.current = client
    setSyncStatus("connecting")
    let cancelled = false

    ;(async () => {
      try {
        const remote = await pullRemote(client, syncCfg.code)
        if (cancelled) return
        if (remote && remote.hours) {
          lastSynced.current = JSON.stringify(remote)
          applyingRemote.current = true
          setS(remote)
        } else {
          // no remote yet -> seed it with current local data
          await pushRemote(client, syncCfg.code, sRef.current)
          lastSynced.current = JSON.stringify(sRef.current)
        }
        // realtime subscription
        const channel = client
          .channel("planner-" + syncCfg.code)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "planners", filter: "code=eq." + syncCfg.code },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (payload: any) => {
              const d = payload.new?.data as State | undefined
              if (!d) return
              const j = JSON.stringify(d)
              if (j === lastSynced.current) return // our own write echoed back
              lastSynced.current = j
              applyingRemote.current = true
              setS(d)
            },
          )
          .subscribe()
        channelRef.current = channel
        if (!cancelled) setSyncStatus("live")
      } catch {
        if (!cancelled) setSyncStatus("error")
      }
    })()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncCfg])

  // ---- push local changes to cloud (debounced)
  useEffect(() => {
    if (applyingRemote.current) { applyingRemote.current = false; return }
    if (syncStatus !== "live") return
    const client = clientRef.current
    if (!client) return
    const j = JSON.stringify(s)
    if (j === lastSynced.current) return
    clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(async () => {
      try {
        await pushRemote(client, syncCfg.code, s)
        lastSynced.current = j
      } catch { /* keep trying on next change */ }
    }, 1200)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, syncStatus])

  const mutate = (fn: (draft: State) => void) => {
    setS((prev) => { const draft = structuredClone(prev); fn(draft); return draft })
  }
  const replace = (next: State) => setS(next)
  const reset = () => setS(defaultState())
  const updateSync = (cfg: SyncConfig) => { saveSyncConfig(cfg); setSyncCfg(cfg) }

  return (
    <StoreContext.Provider value={{ s, mutate, replace, reset, savedAt, syncCfg, syncStatus, updateSync }}>
      {children}
    </StoreContext.Provider>
  )
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
