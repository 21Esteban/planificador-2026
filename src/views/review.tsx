import { Plus } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/page-header"
import { useStore } from "@/lib/store"
import { id } from "@/lib/data"
import { cn } from "@/lib/utils"

const fields: { k: "bien" | "mal" | "apr" | "mej" | "obj"; label: string }[] = [
  { k: "bien", label: "✅ Qué salió bien" },
  { k: "mal", label: "⚠️ Qué salió mal" },
  { k: "apr", label: "💡 Qué aprendí" },
  { k: "mej", label: "🔧 Qué mejorar" },
  { k: "obj", label: "🎯 Objetivos de la próxima semana" },
]

export function Review() {
  const { s, mutate } = useStore()
  return (
    <>
      <PageHeader kicker="Retrospectiva" title="Revisión semanal"
        sub="5 minutos cada domingo: qué funcionó, qué no, qué aprendiste y qué viene."
        right={<Button onClick={() => mutate((d) => { d.review.push({ id: id(), w: "Semana " + (d.review.length + 1), bien: "", mal: "", apr: "", mej: "", obj: "", nota: 0 }) })}><Plus />Nueva semana</Button>} />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {s.review.map((w, i) => (
          <Card key={w.id}>
            <CardHeader className="flex-row items-center justify-between">
              <input value={w.w} onChange={(e) => mutate((d) => { d.review[i].w = e.target.value })}
                className="font-semibold text-lg bg-transparent outline-none border-b border-transparent focus:border-border" />
              <div className="flex gap-1">
                {[2, 4, 6, 8, 10].map((n) => (
                  <button key={n} onClick={() => mutate((d) => { d.review[i].nota = n })}
                    className={cn("size-7 rounded-md border text-xs font-mono font-semibold transition-colors",
                      w.nota >= n ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground hover:border-foreground/30")}>
                    {n}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((f) => (
                <div key={f.k} className="space-y-1.5">
                  <Label className="text-xs">{f.label}</Label>
                  <Textarea value={w[f.k]} rows={2} onChange={(e) => mutate((d) => { d.review[i][f.k] = e.target.value })} />
                </div>
              ))}
              <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600"
                onClick={() => mutate((d) => { d.review.splice(i, 1) })}>Eliminar semana</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
