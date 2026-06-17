import { useRef, useState } from "react"
import {
  LayoutDashboard, CalendarRange, Target, Flame, Wallet, NotebookPen,
  Sun, Moon, Download, Upload, RotateCcw,
} from "lucide-react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "@/lib/theme"
import { StoreProvider, useStore } from "@/lib/store"
import { isoNow } from "@/lib/data"
import type { State } from "@/lib/types"
import { Dashboard } from "@/views/dashboard"
import { Schedule } from "@/views/schedule"
import { Goals } from "@/views/goals"
import { Habits } from "@/views/habits"
import { Finance } from "@/views/finance"
import { Review } from "@/views/review"

const NAV = [
  { id: "dash", label: "Panel", icon: LayoutDashboard, group: "General" },
  { id: "sched", label: "Horario", icon: CalendarRange, group: "General" },
  { id: "goals", label: "Objetivos", icon: Target, group: "General" },
  { id: "habits", label: "Hábitos", icon: Flame, group: "Seguimiento" },
  { id: "money", label: "Finanzas", icon: Wallet, group: "Seguimiento" },
  { id: "review", label: "Revisión", icon: NotebookPen, group: "Seguimiento" },
] as const

function Shell() {
  const [view, setView] = useState<string>("dash")
  const { s, replace, reset, savedAt } = useStore()
  const { theme, toggle } = useTheme()
  const fileRef = useRef<HTMLInputElement>(null)

  function exportJson() {
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: "application/json" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "planificador-2026-" + isoNow() + ".json"
    a.click()
    toast.success("Copia descargada")
  }
  function importJson(file: File) {
    const r = new FileReader()
    r.onload = () => {
      try { replace(JSON.parse(r.result as string) as State); toast.success("Datos importados") }
      catch { toast.error("Archivo inválido") }
    }
    r.readAsText(file)
  }

  let lastGroup = ""
  return (
    <div className="grid grid-cols-1 md:grid-cols-[264px_1fr] min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col gap-1 border-r bg-sidebar p-4 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2 pt-1 pb-4">
          <div className="size-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold text-lg">P</div>
          <div>
            <div className="font-semibold leading-tight">Planificador</div>
            <div className="text-xs text-muted-foreground">2026</div>
          </div>
        </div>
        {NAV.map((n) => {
          const header = n.group !== lastGroup ? ((lastGroup = n.group), n.group) : null
          const Icon = n.icon
          return (
            <div key={n.id}>
              {header && <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-2 pt-3 pb-1">{header}</div>}
              <button onClick={() => setView(n.id)}
                className={cn("flex items-center gap-3 w-full rounded-lg px-2.5 py-2.5 text-sm font-medium transition-colors",
                  view === n.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground")}>
                <Icon className="size-4" />{n.label}
              </button>
            </div>
          )
        })}
        <div className="flex-1" />
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={toggle}>{theme === "dark" ? <Sun /> : <Moon />} Tema</Button>
          <Button variant="outline" size="sm" onClick={exportJson}><Download /> Export</Button>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload /> Import</Button>
          <Button variant="outline" size="sm" className="text-rose-500" onClick={() => { if (confirm("¿Borrar todo y volver a los datos de ejemplo?")) { reset(); toast.success("Datos reiniciados") } }}><RotateCcw /> Reset</Button>
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-3 px-1">
          <span className="size-1.5 rounded-full bg-emerald-500" /> Guardado · {savedAt}
        </div>
        <input ref={fileRef} type="file" accept="application/json" className="hidden"
          onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden flex gap-1 overflow-x-auto border-b bg-sidebar p-2 sticky top-0 z-20">
        {NAV.map((n) => {
          const Icon = n.icon
          return (
            <button key={n.id} onClick={() => setView(n.id)}
              className={cn("flex flex-col items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-medium whitespace-nowrap",
                view === n.id ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>
              <Icon className="size-4" />{n.label}
            </button>
          )
        })}
      </div>

      <main className="px-6 md:px-12 py-8 md:py-9 pb-28 w-full">
        <div key={view} className="view-enter">
          {view === "dash" && <Dashboard />}
          {view === "sched" && <Schedule />}
          {view === "goals" && <Goals />}
          {view === "habits" && <Habits />}
          {view === "money" && <Finance />}
          {view === "review" && <Review />}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
      <Toaster />
    </StoreProvider>
  )
}
