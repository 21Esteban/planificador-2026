import type { State, Sched } from "./types"

export const ACT = ["", "Trabajo", "Gimnasio", "Fútbol", "Música", "SaaS", "Universidad", "Descanso", "Social", "Comida", "Traslado"]
export const ACT_COLOR: Record<string, string> = {
  Trabajo: "#64748b", Gimnasio: "#10b981", Fútbol: "#14b8a6", Música: "#a855f7", SaaS: "#6366f1",
  Universidad: "#0ea5e9", Descanso: "#94a3b8", Social: "#f59e0b", Comida: "#f97316", Traslado: "#94a3b8",
}
export const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
export const HOURS = Array.from({ length: 18 }, (_, i) => i + 6)
export const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
export const CATG = ["Vivienda", "Comida", "Transporte", "Gimnasio", "Universidad", "Música/Equipo", "Suscripciones", "Ocio/Fiestas", "Otros"]
export const CAT_OBJ = ["SaaS", "Música", "Universidad", "Finanzas", "Salud", "Crecimiento", "Personal"]
export const ESTADOS = ["No iniciado", "En progreso", "Completado"] as const
export const PRIORIDADES = ["Alta", "Media", "Baja"] as const
export const TIPOS = ["Ingreso", "Gasto", "Ahorro", "Inversión"] as const

export const COLORS = {
  saas: "var(--chart-1)", musica: "var(--chart-2)", gym: "var(--chart-3)", uni: "var(--chart-4)", gold: "var(--chart-5)",
}
export const CATCOL = [
  "var(--chart-1)", "#f97316", "var(--chart-4)", "var(--chart-3)", "var(--chart-2)",
  "var(--chart-5)", "#14b8a6", "#f43f5e", "#94a3b8",
]

export const id = () => Math.random().toString(36).slice(2, 9)
export const ym = (d: Date) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0")
const isoToday = (day: number) => {
  const d = new Date()
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0")
}
export const daysIn = (m: string) => { const [y, mo] = m.split("-").map(Number); return new Date(y, mo, 0).getDate() }
export const isoNow = () => {
  const d = new Date()
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0")
}
export const fmtDate = (s: string) => { if (!s) return "—"; const [y, m, d] = s.split("-"); return `${d}/${m}/${y.slice(2)}` }
export const money = (n: number) => "$" + Math.round(n || 0).toLocaleString("es-MX")

function defaultSched(): Sched {
  const base: Record<number, string> = { 6: "Descanso", 7: "SaaS", 8: "Traslado", 9: "Trabajo", 10: "Trabajo", 11: "Trabajo", 12: "Trabajo", 13: "Trabajo", 14: "Trabajo", 15: "Trabajo", 16: "Trabajo", 17: "Trabajo", 18: "Traslado", 19: "Gimnasio", 20: "Gimnasio", 21: "Gimnasio", 22: "Comida", 23: "Música" }
  const vie = { ...base, 19: "Fútbol", 20: "Fútbol", 21: "Social", 22: "Social", 23: "Social" }
  const sab: Record<number, string> = { 6: "Descanso", 7: "Descanso", 8: "Descanso", 9: "SaaS", 10: "SaaS", 11: "SaaS", 12: "Comida", 13: "Música", 14: "Música", 15: "Universidad", 16: "Universidad", 17: "Descanso", 18: "Social", 19: "Social", 20: "Social", 21: "Social", 22: "Descanso", 23: "Descanso" }
  const dom: Record<number, string> = { 6: "Descanso", 7: "Descanso", 8: "Descanso", 9: "Universidad", 10: "Universidad", 11: "Universidad", 12: "Comida", 13: "Descanso", 14: "SaaS", 15: "SaaS", 16: "Música", 17: "Música", 18: "Descanso", 19: "Comida", 20: "Descanso", 21: "SaaS", 22: "Descanso", 23: "Descanso" }
  const plan = [base, base, base, base, vie, sab, dom]
  const o: Sched = {}
  DIAS.forEach((d, i) => (o[d] = { ...plan[i] }))
  return o
}

export function defaultState(): State {
  const hours = []
  for (let i = 0; i < 12; i++) hours.push({ week: "Sem " + (i + 1), saas: 0, musica: 0, gym: 0, uni: 0 })
  hours[0] = { week: "Sem 1", saas: 6, musica: 2, gym: 8, uni: 0 }
  hours[1] = { week: "Sem 2", saas: 8, musica: 3, gym: 7, uni: 0 }
  hours[2] = { week: "Sem 3", saas: 5, musica: 1, gym: 8, uni: 2 }
  return {
    hours,
    sched: defaultSched(),
    goals: [
      { id: id(), n: "Lanzar MVP del SaaS", c: "SaaS", f: "2026-09-30", p: 30, e: "En progreso", pr: "Alta" },
      { id: id(), n: "Conseguir primeros 10 clientes de pago", c: "SaaS", f: "2026-12-15", p: 0, e: "No iniciado", pr: "Alta" },
      { id: id(), n: "Aprobar primer semestre de universidad", c: "Universidad", f: "2026-12-20", p: 0, e: "No iniciado", pr: "Alta" },
      { id: id(), n: "Producir y publicar 3 canciones", c: "Música", f: "2026-11-30", p: 10, e: "En progreso", pr: "Media" },
      { id: id(), n: "Fondo de emergencia (6 meses)", c: "Finanzas", f: "2026-12-31", p: 15, e: "En progreso", pr: "Alta" },
      { id: id(), n: "Reducir gastos en fiestas un 50%", c: "Finanzas", f: "2026-07-31", p: 20, e: "En progreso", pr: "Media" },
      { id: id(), n: "Gimnasio 4×/semana constante", c: "Salud", f: "2026-12-31", p: 60, e: "En progreso", pr: "Media" },
      { id: id(), n: "Leer 12 libros en el año", c: "Crecimiento", f: "2026-12-31", p: 25, e: "En progreso", pr: "Baja" },
    ],
    habits: {
      month: ym(new Date()),
      list: [
        { id: id(), n: "🏋 Gimnasio", meta: 16 }, { id: id(), n: "🎵 Música", meta: 12 },
        { id: id(), n: "⌨ Trabajo en SaaS", meta: 20 }, { id: id(), n: "🌙 Dormir antes de medianoche", meta: 25 },
        { id: id(), n: "📖 Lectura", meta: 20 },
      ],
      log: {},
    },
    tx: [
      { id: id(), d: isoToday(1), t: "Ingreso", c: "", desc: "Salario", a: 1500 },
      { id: id(), d: isoToday(2), t: "Gasto", c: "Vivienda", desc: "Renta", a: 400 },
      { id: id(), d: isoToday(3), t: "Gasto", c: "Comida", desc: "Supermercado", a: 180 },
      { id: id(), d: isoToday(5), t: "Ahorro", c: "", desc: "A ahorro", a: 300 },
      { id: id(), d: isoToday(7), t: "Gasto", c: "Ocio/Fiestas", desc: "Salida", a: 60 },
      { id: id(), d: isoToday(10), t: "Inversión", c: "", desc: "Fondo indexado", a: 150 },
    ],
    review: [{ id: id(), w: "Semana 1", bien: "", mal: "", apr: "", mej: "", obj: "", nota: 0 }],
  }
}
