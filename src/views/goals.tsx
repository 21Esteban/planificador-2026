import { Plus, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/page-header"
import { Stat } from "@/components/stat"
import { AnimatedNumber } from "@/components/animated-number"
import { useStore } from "@/lib/store"
import { CAT_OBJ, ESTADOS, PRIORIDADES, id, isoNow, fmtDate } from "@/lib/data"
import type { Estado, Prioridad } from "@/lib/types"

const estadoCls: Record<string, string> = {
  "Completado": "text-emerald-600 dark:text-emerald-400",
  "En progreso": "text-amber-600 dark:text-amber-400",
  "No iniciado": "text-rose-600 dark:text-rose-400",
}
const priCls: Record<string, string> = {
  "Alta": "text-rose-600 dark:text-rose-400", "Media": "text-amber-600 dark:text-amber-400", "Baja": "text-sky-600 dark:text-sky-400",
}

export function Goals() {
  const { s, mutate } = useStore()
  const done = s.goals.filter((g) => g.e === "Completado").length
  const prog = s.goals.filter((g) => g.e === "En progreso").length
  const todo = s.goals.filter((g) => g.e === "No iniciado").length
  const glob = s.goals.length ? Math.round(s.goals.reduce((a, g) => a + (+g.p || 0), 0) / s.goals.length) : 0

  return (
    <>
      <PageHeader kicker="Metas 2026" title="Lo que vas a conquistar"
        right={<Button onClick={() => mutate((d) => { d.goals.push({ id: id(), n: "Nuevo objetivo", c: "Personal", f: "", p: 0, e: "No iniciado", pr: "Media" }) })}><Plus />Nuevo objetivo</Button>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 stagger">
        <Stat label="Progreso global" value={<AnimatedNumber value={glob} format={(n) => Math.round(n) + "%"} />} color="var(--chart-1)" />
        <Stat label="Completados" value={<AnimatedNumber value={done} />} color="#10b981" />
        <Stat label="En progreso" value={<AnimatedNumber value={prog} />} color="#f59e0b" />
        <Stat label="Sin iniciar" value={<AnimatedNumber value={todo} />} color="#f43f5e" />
      </div>

      <Card>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">Objetivo</TableHead>
                <TableHead>Categoría</TableHead><TableHead>Fecha límite</TableHead>
                <TableHead className="w-[210px]">Progreso</TableHead>
                <TableHead>Estado</TableHead><TableHead>Prioridad</TableHead><TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {s.goals.map((g, i) => {
                const vencido = g.f && g.f < isoNow() && g.e !== "Completado"
                return (
                  <TableRow key={g.id}>
                    <TableCell>
                      <Input value={g.n} className="h-8 border-transparent hover:border-input font-medium"
                        onChange={(e) => mutate((d) => { d.goals[i].n = e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <Select value={g.c} onValueChange={(v) => mutate((d) => { d.goals[i].c = v ?? "" })}>
                        <SelectTrigger size="sm" className="border-transparent hover:border-input w-[130px]"><SelectValue /></SelectTrigger>
                        <SelectContent>{CAT_OBJ.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input type="date" value={g.f} className={"h-8 border-transparent hover:border-input w-[140px] " + (vencido ? "text-rose-600 dark:text-rose-400" : "")}
                        onChange={(e) => mutate((d) => { d.goals[i].f = e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Slider value={[g.p]} min={0} max={100} step={5} className="flex-1"
                          onValueChange={(v) => mutate((d) => { d.goals[i].p = Array.isArray(v) ? v[0] : v })} />
                        <span className="font-mono text-xs w-9 text-right text-muted-foreground">{g.p}%</span>
                      </div>
                      <Progress value={g.p} className="mt-1.5 h-1.5" />
                    </TableCell>
                    <TableCell>
                      <Select value={g.e} onValueChange={(v) => mutate((d) => { d.goals[i].e = v as Estado })}>
                        <SelectTrigger size="sm" className={"border-transparent hover:border-input font-medium w-[130px] " + estadoCls[g.e]}><SelectValue /></SelectTrigger>
                        <SelectContent>{ESTADOS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select value={g.pr} onValueChange={(v) => mutate((d) => { d.goals[i].pr = v as Prioridad })}>
                        <SelectTrigger size="sm" className={"border-transparent hover:border-input font-medium w-[100px] " + priCls[g.pr]}><SelectValue /></SelectTrigger>
                        <SelectContent>{PRIORIDADES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-rose-500"
                        onClick={() => mutate((d) => { d.goals.splice(i, 1) })}><X /></Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
