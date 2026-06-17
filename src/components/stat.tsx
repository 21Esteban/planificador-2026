import { Card } from "@/components/ui/card"

export function Stat({ label, value, unit, meta, color }: {
  label: string; value: React.ReactNode; unit?: string; meta?: string; color?: string
}) {
  return (
    <Card className="p-5 gap-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
        <span className="size-2 rounded-full" style={{ background: color || "var(--muted-foreground)" }} />
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
        {value}{unit && <span className="text-base text-muted-foreground font-medium"> {unit}</span>}
      </div>
      {meta && <div className="mt-1 text-xs text-muted-foreground">{meta}</div>}
    </Card>
  )
}
