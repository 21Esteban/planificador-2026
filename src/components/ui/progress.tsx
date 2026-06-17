import { cn } from "@/lib/utils"

function Progress({
  value = 0,
  className,
  indicatorColor,
}: {
  value?: number
  className?: string
  indicatorColor?: string
}) {
  const pct = Math.min(100, Math.max(0, value || 0))
  return (
    <div
      data-slot="progress"
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        data-slot="progress-indicator"
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${pct}%`, ...(indicatorColor ? { background: indicatorColor } : {}) }}
      />
    </div>
  )
}

export { Progress }
