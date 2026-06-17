export function PageHeader({ kicker, title, sub, right }: {
  kicker: string; title: string; sub?: string; right?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-7">
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">{kicker}</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">{title}</h1>
        {sub && <p className="text-muted-foreground mt-2 max-w-2xl">{sub}</p>}
      </div>
      {right}
    </div>
  )
}
