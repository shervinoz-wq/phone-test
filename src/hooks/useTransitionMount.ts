import { useEffect, useState } from 'react'

/**
 * Keeps an element mounted while its closing animation plays.
 * `mounted`  -> render the element
 * `shown`    -> apply the "open" CSS class
 */
export function useTransitionMount(open: boolean, ms = 300) {
  const [mounted, setMounted] = useState(open)
  const [entered, setEntered] = useState(false)

  // Derived-state update during render (allowed by React): mount right away.
  if (open && !mounted) setMounted(true)

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)))
      return () => cancelAnimationFrame(id)
    }
    const t = window.setTimeout(() => {
      setMounted(false)
      setEntered(false)
    }, ms)
    return () => window.clearTimeout(t)
  }, [open, ms])

  return { mounted: mounted || open, shown: open && entered }
}
