import { Plus, X, Flame } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/page-header"
import { Stat } from "@/components/stat"
import { AnimatedNumber } from "@/components/animated-number"
import { useStore, habitsOverall } from "@/lib/store"
import { CATCOL, daysIn, id, ym } from "@/lib/data"
import { cn } from "@/lib/utils"

const WD = ["L", "M", "X", "J", "V", "S", "D"]

function Ring({ pct, color }: { pct: number; color: string }) {
  const r = 30, c = 2 * Math.PI * r
  const off = c * (1 - pct / 100)
  return (
    <div className="relative size-[78px] shrink-0">
      <svg viewBox="0 0 78 78" className="size-[78px] -rotate-90">
        <circle cx="39" cy="39" r={r} fill="none" stroke="var(--muted)" strokeWidth="7" />
        <circle cx="39" cy="39" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} className="transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-lg font-bold tabular-nums"><AnimatedNumber value={pct} />
          <span className="text-xs font-semibold text-muted-foreground">%</span></span>
      </div>
    </div>
  )
}

export function Habits() {
  const { s, mutate } = useStore()
  const h = s.habits
  const [y, mo] = h.month.split("-").map(Number)
  const nd = daysIn(h.month)
  const offset = (new Date(y, mo - 1, 1).getDay() + 6) % 7
  const today = new Date()
  const todayD = ym(today) === h.month ? today.getDate() : -1
  const monthLabel = new Date(y, mo - 1, 1).toLocaleDateString("es", { month: "long", year: "numeric" })
  const overall = Math.round(habitsOverall(s) * 100)
  const totalMarks = h.list.reduce((a, x) => a + Object.values(h.log[x.id] || {}).filter(Boolean).length, 0)

  function streakOf(log: Record<number, boolean>) {
    let start = todayD > 0 ? todayD : nd
    if (todayD > 0 && !log[todayD]) start = todayD - 1
    let n = 0
    for (let d = start; d >= 1; d--) { if (log[d]) n++; else break }
    return n
  }

  return (
    <>
      <PageHeader kicker="Disciplina diaria" title="Seguimiento de hábitos"
        sub="Marca cada día cumplido en el calendario. El % se calcula contra tu meta mensual."
        right={
          <div className="flex gap-2 items-center">
            <Input type="month" value={h.month} className="w-auto" onChange={(e) => mutate((d) => { d.habits.month = e.target.value })} />
            <Button onClick={() => mutate((d) => { d.habits.list.push({ id: id(), n: "✨ Nuevo hábito", meta: 20 }) })}><Plus />Hábito</Button>
          </div>
        } />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5 stagger">
        <Stat label="Cumplimiento del mes" value={<AnimatedNumber value={overall} format={(n) => Math.round(n) + "%"} />} color="#f43f5e" meta={monthLabel} />
        <Stat label="Hábitos activos" value={<AnimatedNumber value={h.list.length} />} color="var(--chart-2)" />
        <Stat label="Días marcados" value={<AnimatedNumber value={totalMarks} />} color="var(--chart-3)" meta="este mes" />
        <Stat label="Mejor racha" value={<AnimatedNumber value={Math.max(0, ...h.list.map((x) => streakOf(h.log[x.id] || {})))} />} unit="días" color="var(--chart-5)" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 stagger">
        {h.list.map((x, i) => {
          const log = h.log[x.id] || {}
          const done = Object.values(log).filter(Boolean).length
          const pct = Math.min(100, Math.round((done / (x.meta || 1)) * 100))
          const color = CATCOL[i % CATCOL.length]
          const streak = streakOf(log)
          return (
            <Card key={x.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Ring pct={pct} color={color} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <Input value={x.n} className="h-9 border-transparent hover:border-input focus:border-input font-semibold text-base px-2 -ml-2"
                        onChange={(e) => mutate((d) => { d.habits.list[i].n = e.target.value })} />
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-rose-500 shrink-0"
                        onClick={() => mutate((d) => { d.habits.list.splice(i, 1); delete d.habits.log[x.id] })}><X /></Button>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-sm flex-wrap">
                      <span className="font-medium tabular-nums">{done} <span className="text-muted-foreground font-normal">de</span> {x.meta} días</span>
                      <span className="flex items-center gap-1 font-medium" style={{ color: streak > 0 ? "#f97316" : "var(--muted-foreground)" }}>
                        <Flame className="size-4" /> {streak} racha
                      </span>
                      <label className="flex items-center gap-1.5 text-muted-foreground ml-auto">
                        meta
                        <Input type="number" min={0} max={31} value={x.meta} className="h-7 w-14 text-center px-1"
                          onChange={(e) => mutate((d) => { d.habits.list[i].meta = +e.target.value || 0 })} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                    {WD.map((w, k) => <div key={k} className="text-center text-[11px] font-semibold text-muted-foreground">{w}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {Array.from({ length: offset }).map((_, k) => <div key={"e" + k} />)}
                    {Array.from({ length: nd }, (_, k) => k + 1).map((d) => {
                      const on = !!log[d]
                      return (
                        <button key={d}
                          onClick={() => mutate((draft) => {
                            const l = (draft.habits.log[x.id] ||= {})
                            if (l[d]) delete l[d]; else l[d] = true
                          })}
                          title={`${d}`}
                          style={on ? { background: color, borderColor: color, color: "#fff" } : undefined}
                          className={cn(
                            "aspect-square rounded-md border text-xs font-medium grid place-items-center transition-all duration-150 hover:scale-110 active:scale-90",
                            on ? "shadow-sm" : "bg-muted/40 text-muted-foreground hover:border-foreground/30 hover:bg-muted",
                            d === todayD && !on && "ring-2 ring-amber-400 ring-offset-1 ring-offset-background",
                            d === todayD && on && "ring-2 ring-amber-400 ring-offset-1 ring-offset-background",
                          )}>
                          {d}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}
