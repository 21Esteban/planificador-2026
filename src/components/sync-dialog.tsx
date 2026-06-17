import { useState } from "react"
import { toast } from "sonner"
import { Cloud, RefreshCw, Check } from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import { genCode } from "@/lib/sync"

const STATUS: Record<string, { label: string; cls: string }> = {
  off: { label: "Desconectado", cls: "bg-muted text-muted-foreground" },
  connecting: { label: "Conectando…", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  live: { label: "● En vivo", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  error: { label: "Error de conexión", cls: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
}

export function SyncDialog() {
  const { syncCfg, syncStatus, updateSync } = useStore()
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState(syncCfg.url)
  const [key, setKey] = useState(syncCfg.key)
  const [code, setCode] = useState(syncCfg.code || genCode())

  function connect() {
    if (!url || !key) { toast.error("Falta la URL o la clave de Supabase"); return }
    updateSync({ url, key, code, enabled: true })
    toast.success("Conectando a la nube…")
  }
  function disconnect() {
    updateSync({ ...syncCfg, enabled: false })
    toast.success("Sincronización desactivada")
  }

  const st = STATUS[syncStatus] ?? STATUS.off

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="w-full justify-start gap-2" />}>
        <Cloud className="size-4" />
        Sincronizar
        <span className={"ml-auto text-[10px] px-1.5 py-0.5 rounded " + st.cls}>
          {syncStatus === "live" ? "●" : syncStatus === "connecting" ? "…" : syncStatus === "error" ? "!" : "off"}
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Cloud className="size-5" /> Sincronización en la nube</DialogTitle>
          <DialogDescription>
            Mantén los mismos datos en tu celular y tu PC, en tiempo real. Gratis con Supabase.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 -mt-1">
          <span className="text-sm text-muted-foreground">Estado:</span>
          <Badge variant="secondary" className={st.cls}>{st.label}</Badge>
        </div>

        <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Cómo obtener tus datos (1 sola vez):</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Crea una cuenta gratis en <span className="font-mono">supabase.com</span> y un proyecto nuevo.</li>
            <li>En el proyecto: <span className="font-medium">SQL Editor</span> → pega el SQL que te pasé → Run.</li>
            <li>Ve a <span className="font-medium">Project Settings → API</span> y copia <span className="font-medium">Project URL</span> y la clave <span className="font-medium">anon public</span>.</li>
            <li>Pégalas aquí abajo, usa el mismo <span className="font-medium">código</span> en todos tus dispositivos y pulsa Conectar.</li>
          </ol>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Project URL</Label>
            <Input placeholder="https://xxxxx.supabase.co" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Clave anon public</Label>
            <Input type="password" placeholder="eyJhbGciOi..." value={key} onChange={(e) => setKey(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Código de sincronización (igual en todos tus dispositivos)</Label>
            <div className="flex gap-2">
              <Input value={code} onChange={(e) => setCode(e.target.value)} className="font-mono" />
              <Button variant="outline" type="button" onClick={() => setCode(genCode())}><RefreshCw className="size-4" /></Button>
            </div>
            <p className="text-xs text-muted-foreground">Trátalo como una contraseña: cualquiera con este código y la clave podría ver tus datos.</p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          {syncCfg.enabled && <Button variant="ghost" onClick={disconnect}>Desactivar</Button>}
          <Button onClick={connect} className="gap-2"><Check className="size-4" /> Conectar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
