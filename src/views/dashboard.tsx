import { useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Pie, PieChart, Bar, BarChart, Cell, Label } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { Stat } from "@/components/stat"
import { AnimatedNumber } from "@/components/animated-number"
import { useStore, monthAgg, habitsOverall } from "@/lib/store"
import { MESES, money, fmtDate } from "@/lib/data"

const hoursConfig = {
  saas: { label: "SaaS", color: "var(--chart-1)" },
  musica: { label: "Música", color: "var(--chart-2)" },
  gym: { label: "Gimnasio", color: "var(--chart-3)" },
  uni: { label: "Universidad", color: "var(--chart-4)" },
} satisfies ChartConfig

export function Dashboard() {
  const { s, mutate } = useStore()
  const [activeSlice, setActiveSlice] = useState<number | undefined>(undefined)
  const sum = (k: "saas" | "musica" | "gym" | "uni") => s.hours.reduce((a, h) => a + (+h[k] || 0), 0)
  const saas = sum("saas"), mus = sum("musica"), gym = sum("gym"), uni = sum("uni")
  const total = saas + mus + gym + uni
  const ahorroMes = monthAgg(s, new Date().getMonth() + 1).ahorro
  const habPct = Math.round(habitsOverall(s) * 100)

  const lineData = s.hours.map((h) => ({ week: h.week.replace("Sem ", "S"), saas: +h.saas || 0, musica: +h.musica || 0, gym: +h.gym || 0, uni: +h.uni || 0 }))
  const dist = [
    { k: "SaaS", value: saas, fill: "var(--chart-1)" },
    { k: "Música", value: mus, fill: "var(--chart-2)" },
    { k: "Gimnasio", value: gym, fill: "var(--chart-3)" },
    { k: "Universidad", value: uni, fill: "var(--chart-4)" },
  ]
  const saveData = MESES.map((m, i) => ({ mes: m, ahorro: monthAgg(s, i + 1).ahorro }))
  const topGoals = [...s.goals].sort((a, b) => b.p - a.p).slice(0, 5)

  return (
    <>
      <PageHeader
        kicker="Centro de mando"
        title="Más libertad, ingresos propios"
        sub="Tu progreso semanal en SaaS, música, gimnasio, universidad y dinero, en un vistazo."
        right={<div className="text-sm text-muted-foreground border rounded-lg px-3 py-2 bg-card">{new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}</div>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-4 stagger">
        <Stat label="Horas SaaS" value={<AnimatedNumber value={saas} />} unit="h" meta="acumulado" color="var(--chart-1)" />
        <Stat label="Horas Música" value={<AnimatedNumber value={mus} />} unit="h" meta="acumulado" color="var(--chart-2)" />
        <Stat label="Horas Gimnasio" value={<AnimatedNumber value={gym} />} unit="h" meta="acumulado" color="var(--chart-3)" />
        <Stat label="Universidad" value={<AnimatedNumber value={uni} />} unit="h" meta="acumulado" color="var(--chart-4)" />
        <Stat label="Ahorro del mes" value={<AnimatedNumber value={ahorroMes} format={money} />} meta={MESES[new Date().getMonth()]} color="var(--chart-5)" />
        <Stat label="Hábitos del mes" value={<AnimatedNumber value={habPct} format={(n) => Math.round(n) + "%"} />} meta="cumplimiento" color="#f43f5e" />
      </div>

      <div className="grid lg:grid-cols-[1.55fr_1fr] gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Evolución semanal de horas</CardTitle>
            <CardDescription>horas reales por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={hoursConfig} className="h-[240px] w-full">
              <LineChart data={lineData} margin={{ left: -12, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} width={32} fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {(["saas", "musica", "gym", "uni"] as const).map((k) => (
                  <Line key={k} dataKey={k} type="monotone" stroke={`var(--color-${k})`} strokeWidth={2.2} dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }} animationDuration={1100} animationEasing="ease-out" />
                ))}
              </LineChart>
            </ChartContainer>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
              {Object.entries(hoursConfig).map(([k, v]) => (
                <span key={k} className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: v.color }} />{v.label}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Distribución</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={hoursConfig} className="h-[240px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="k" />} />
                <Pie data={dist} dataKey="value" nameKey="k" innerRadius={62} outerRadius={92} strokeWidth={2}
                  animationDuration={900} animationEasing="ease-out"
                  onMouseEnter={(_: any, i: number) => setActiveSlice(i)} onMouseLeave={() => setActiveSlice(undefined)}>
                  {dist.map((d, i) => (
                    <Cell key={d.k} fill={d.fill} className="transition-all duration-200 cursor-pointer"
                      style={{ opacity: activeSlice === undefined || activeSlice === i ? 1 : 0.35 }} />
                  ))}
                  <Label content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-semibold">{total}</tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">horas</tspan>
                        </text>
                      )
                    }
                  }} />
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center text-xs text-muted-foreground">
              {dist.map((d) => <span key={d.k} className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: d.fill }} />{d.k} · {d.value}h</span>)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1.55fr_1fr] gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Registro semanal de horas</CardTitle>
            <CardDescription>edita y se recalcula todo</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Semana</TableHead><TableHead>SaaS</TableHead><TableHead>Música</TableHead>
                  <TableHead>Gym</TableHead><TableHead>Uni</TableHead><TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {s.hours.map((h, i) => {
                  const tot = (+h.saas || 0) + (+h.musica || 0) + (+h.gym || 0) + (+h.uni || 0)
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-muted-foreground">{h.week}</TableCell>
                      {(["saas", "musica", "gym", "uni"] as const).map((k) => (
                        <TableCell key={k}>
                          <Input type="number" min={0} step={0.5} value={h[k] || ""} className="h-8 w-16 border-transparent hover:border-input"
                            onChange={(e) => mutate((d) => { d.hours[i][k] = +e.target.value || 0 })} />
                        </TableCell>
                      ))}
                      <TableCell className="text-right font-mono font-medium">{tot}h</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ahorro mensual</CardTitle>
            <CardDescription>desde Finanzas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ ahorro: { label: "Ahorro", color: "var(--chart-5)" } }} className="h-[240px] w-full">
              <BarChart data={saveData} margin={{ left: -8, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                <YAxis tickLine={false} axisLine={false} width={42} fontSize={10} tickFormatter={(v) => "$" + v} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="ahorro" fill="var(--color-ahorro)" radius={6} animationDuration={900} animationEasing="ease-out"
                  activeBar={{ fillOpacity: 0.8 }} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Objetivos en marcha</CardTitle>
          <CardDescription>tus metas con mayor progreso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {topGoals.map((g) => (
            <div key={g.id} className="flex items-center gap-4 py-2.5 border-b last:border-0">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{g.n}</div>
                <div className="text-xs text-muted-foreground">{g.c} · vence {fmtDate(g.f)}</div>
              </div>
              <Progress value={g.p} className="w-36" />
              <div className="font-mono text-sm w-11 text-right text-muted-foreground">{g.p}%</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}
