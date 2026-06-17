export type Estado = "No iniciado" | "En progreso" | "Completado"
export type Prioridad = "Alta" | "Media" | "Baja"
export type TxType = "Ingreso" | "Gasto" | "Ahorro" | "Inversión"

export interface Hours { week: string; saas: number; musica: number; gym: number; uni: number }
export interface Goal { id: string; n: string; c: string; f: string; p: number; e: Estado; pr: Prioridad }
export interface Habit { id: string; n: string; meta: number }
export interface Tx { id: string; d: string; t: TxType; c: string; desc: string; a: number }
export interface Review { id: string; w: string; bien: string; mal: string; apr: string; mej: string; obj: string; nota: number }

export type Sched = Record<string, Record<number, string>>

export interface State {
  hours: Hours[]
  sched: Sched
  goals: Goal[]
  habits: { month: string; list: Habit[]; log: Record<string, Record<number, boolean>> }
  tx: Tx[]
  review: Review[]
}
