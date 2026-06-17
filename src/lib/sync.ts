import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { State } from "./types"

export interface SyncConfig { url: string; key: string; code: string; enabled: boolean }
export type SyncStatus = "off" | "connecting" | "live" | "error"

const CKEY = "planificador2026-sync"

export function loadSyncConfig(): SyncConfig {
  try {
    const r = localStorage.getItem(CKEY)
    if (r) return { url: "", key: "", code: "", enabled: false, ...JSON.parse(r) }
  } catch { /* ignore */ }
  return { url: "", key: "", code: "", enabled: false }
}
export function saveSyncConfig(c: SyncConfig) {
  localStorage.setItem(CKEY, JSON.stringify(c))
}

export function makeClient(c: SyncConfig): SupabaseClient | null {
  if (!c.url || !c.key) return null
  try {
    return createClient(c.url.trim().replace(/\/$/, ""), c.key.trim())
  } catch {
    return null
  }
}

export async function pullRemote(client: SupabaseClient, code: string): Promise<State | null> {
  const { data, error } = await client.from("planners").select("data").eq("code", code).maybeSingle()
  if (error) throw error
  return (data?.data as State) ?? null
}

export async function pushRemote(client: SupabaseClient, code: string, state: State): Promise<void> {
  const { error } = await client
    .from("planners")
    .upsert({ code, data: state, updated_at: new Date().toISOString() })
  if (error) throw error
}

export function genCode(): string {
  return "sync-" + Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6)
}
