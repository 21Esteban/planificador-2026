import { useState } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { PageHeader } from "@/components/page-header"
import { Stat } from "@/components/stat"
import { AnimatedNumber } from "@/components/animated-number"
import { useStore, monthAgg } from "@/lib/store"
import { CATG, CATCOL, MESES, TIPOS, id, isoNow, fmtDate, money } from "@/lib/data"
import type { TxType } from "@/lib/types"

const tipoBadge: Record<string, string> = {
  Ingreso: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  Gasto: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
  Ahorro: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  Inversión: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
}
const ieConfig = { ing: { label: "Ingresos", color: "var(--chart-3)" }, gasto: { label: "Gastos", color: "#f43f5e" } } satisfies ChartConfig

export function Finance() {
  const { s, mutate } = useStore()
  const [date, setDate] = useState(isoNow())
  const [type, setType] = useState<TxType>("Gasto")
  const [cat, setCat] = useState("Sin categoría")
  const [desc, setDesc] = useState("")
  const [amt, setAmt] = useState("")

  const m = new Date().getMonth() + 1
  const a = monthAgg(s, m)
  const sorted = [...s.tx].sort((x, y) => (y.d || "").localeCompare(x.d || ""))
  const totG = s.tx.filter((x) => x.t === "Gasto").reduce((acc, x) => acc + (+x.a || 0), 0)
  const ieData = MESES.map((mes, i) => { const ag = monthAgg(s, i + 1); return { mes, ing: ag.ing, gasto: ag.gasto } })
    .filter((d) => d.ing || d.gasto)

  function add() {
    const n = +amt
    if (!n) { toast.error("Pon un monto"); return }
    mutate((d) => { d.tx.push({ id: id(), d: date || isoNow(), t: type, c: cat === "Sin categoría" ? "" : cat, desc: desc || "(sin descripción)", a: n }) })
    setDesc(""); setAmt(""); toast.success("Movimiento añadido")
  }

  return (
    <>
      <PageHeader kicker="Dinero y libertad" title="Finanzas personales"
        sub="Registra movimientos y el resumen mensual se calcula automáticamente." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 stagger">
        <Stat label={`Ingresos · ${MESES[m - 1]}`} value={<AnimatedNumber value={a.ing} format={money} />} color="#10b981" />
        <Stat label={`Gastos · ${MESES[m - 1]}`} value={<AnimatedNumber value={a.gasto} format={money} />} color="#f43f5e" />
        <Stat label={`Ahorro · ${MESES[m - 1]}`} value={<AnimatedNumber value={a.ahorro} format={money} />} color="var(--chart-5)" />
        <Stat label={`Balance · ${MESES[m - 1]}`} value={<AnimatedNumber value={a.balance} format={money} />} color={a.balance >= 0 ? "var(--chart-4)" : "#f43f5e"} />
      </div>

      <div className="grid lg:grid-cols-[1fr_1.25fr] gap-4 items-start">
        <Card>
          <CardHeader><CardTitle>Nuevo movimiento</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Fecha</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Tipo</Label>
                <Select value={type} onValueChange={(v) => setType(v as TxType)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2"><Label>Categoría</Label>
                <Select value={cat} onValueChange={(v) => setCat(v ?? "Sin categoría")}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Sin categoría">— (sin categoría)</SelectItem>{CATG.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2"><Label>Descripción</Label><Input value={desc} placeholder="ej. Supermercado" onChange={(e) => setDesc(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Monto</Label><Input type="number" min={0} value={amt} placeholder="0" onChange={(e) => setAmt(e.target.value)} /></div>
              <div className="flex items-end"><Button className="w-full" onClick={add}>Añadir</Button></div>
            </div>

            <div className="pt-2">
              <div className="text-sm font-semibold mb-3">Gastos por categoría</div>
              <div className="space-y-2.5">
                {CATG.map((c, i) => {
                  const v = s.tx.filter((x) => x.t === "Gasto" && x.c === c).reduce((acc, x) => acc + (+x.a || 0), 0)
                  const p = totG ? Math.round((v / totG) * 100) : 0
                  return (
                    <div key={c} className="flex items-center gap-3">
                      <div className="w-24 text-xs text-muted-foreground">{c}</div>
                      <Progress value={p} className="flex-1" indicatorColor={CATCOL[i]} />
                      <div className="w-16 text-right font-mono text-xs">{money(v)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Movimientos</CardTitle></CardHeader>
          <CardContent>
            <div className="max-h-[420px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead><TableHead>Tipo</TableHead><TableHead>Categoría</TableHead>
                    <TableHead>Descripción</TableHead><TableHead className="text-right">Monto</TableHead><TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((x) => (
                    <TableRow key={x.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{fmtDate(x.d)}</TableCell>
                      <TableCell><Badge variant="outline" className={tipoBadge[x.t]}>{x.t}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{x.c || "—"}</TableCell>
                      <TableCell>{x.desc}</TableCell>
                      <TableCell className={"text-right font-mono " + (x.t === "Ingreso" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                        {x.t === "Ingreso" ? "+" : "−"}{money(x.a)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-rose-500"
                          onClick={() => mutate((d) => { d.tx = d.tx.filter((t) => t.id !== x.id) })}><X /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader><CardTitle>Ingresos vs Gastos</CardTitle></CardHeader>
          <CardContent>
            {ieData.length ? (
              <ChartContainer config={ieConfig} className="h-[240px] w-full">
                <BarChart data={ieData} margin={{ left: -6, right: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} width={42} fontSize={10} tickFormatter={(v) => "$" + v} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="ing" name="Ingresos" fill="var(--color-ing)" radius={4} animationDuration={900} activeBar={{ fillOpacity: 0.8 }} />
                  <Bar dataKey="gasto" name="Gastos" fill="var(--color-gasto)" radius={4} animationDuration={900} animationBegin={150} activeBar={{ fillOpacity: 0.8 }} />
                </BarChart>
              </ChartContainer>
            ) : <div className="text-sm text-muted-foreground text-center py-12">Sin datos</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Resumen mensual</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mes</TableHead><TableHead className="text-right">Ingresos</TableHead>
                  <TableHead className="text-right">Gastos</TableHead><TableHead className="text-right">Ahorro</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MESES.map((mes, i) => { const ag = monthAgg(s, i + 1); return { mes, ag } })
                  .filter(({ ag }) => ag.ing || ag.gasto || ag.ahorro || ag.inv)
                  .map(({ mes, ag }) => (
                    <TableRow key={mes}>
                      <TableCell className="font-medium">{mes}</TableCell>
                      <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">{money(ag.ing)}</TableCell>
                      <TableCell className="text-right font-mono text-rose-600 dark:text-rose-400">{money(ag.gasto)}</TableCell>
                      <TableCell className="text-right font-mono">{money(ag.ahorro)}</TableCell>
                      <TableCell className={"text-right font-mono " + (ag.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>{money(ag.balance)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
