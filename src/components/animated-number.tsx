import { useEffect, useRef, useState } from "react"

export function AnimatedNumber({
  value,
  format,
  duration = 900,
}: {
  value: number
  format?: (n: number) => string
  duration?: number
}) {
  const [disp, setDisp] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef(0)

  useEffect(() => {
    const from = fromRef.current
    const to = value
    if (from === to) return
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const e = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setDisp(from + (to - from) * e)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else fromRef.current = to
    }
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  const f = format || ((n: number) => String(Math.round(n)))
  return <>{f(disp)}</>
}
