import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { useStore } from "@/lib/store"
import { ACT, ACT_COLOR, DIAS, HOURS } from "@/lib/data"

function cellStyle(v: string): React.CSSProperties {
  if (!v) return {}
  const c = ACT_COLOR[v]
  const vivid = ["SaaS", "Música", "Gimnasio", "Fútbol", "Universidad"].includes(v)
  return {
    background: `color-mix(in srgb, ${c} 16%, transparent)`,
    color: vivid ? c : "var(--foreground)",
  }
}

export function Schedule() {
  const { s, mutate } = useStore()
  return (
    <>
      <PageHeader
        kicker="Rutina semanal"
        title="Tu horario por bloques"
        sub="Trabajo 9–18, gimnasio L–J por la noche, fútbol los viernes. Cambia cualquier bloque. En agosto añade tus clases."
      />
      <Card>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-1 min-w-[820px]">
            <thead>
              <tr>
                <th className="w-14" />
                {DIAS.map((d) => <th key={d} className="text-sm font-medium text-muted-foreground pb-2">{d.slice(0, 3)}</th>)}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((h) => (
                <tr key={h}>
                  <td className="text-xs font-mono text-muted-foreground text-center whitespace-nowrap pr-2">{String(h).padStart(2, "0")}:00</td>
                  {DIAS.map((d) => {
                    const v = s.sched[d]?.[h] || ""
                    return (
                      <td key={d}>
                        <select
                          value={v}
                          onChange={(e) => mutate((draft) => { (draft.sched[d] ||= {})[h] = e.target.value })}
                          style={cellStyle(v)}
                          className="w-full rounded-md text-xs font-medium py-1.5 px-1 text-center border-transparent outline-none focus:ring-2 focus:ring-ring cursor-pointer appearance-none"
                        >
                          {ACT.map((a) => <option key={a} value={a} className="bg-background text-foreground">{a || "—"}</option>)}
                        </select>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-wrap gap-2 mt-5">
            {Object.entries(ACT_COLOR).map(([k, c]) => (
              <span key={k} className="flex items-center gap-1.5 text-xs font-medium border rounded-md px-2.5 py-1">
                <span className="size-2 rounded-sm" style={{ background: c }} />{k}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
