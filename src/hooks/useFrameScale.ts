import { useEffect } from 'react'

const W = 390
const H = 844

/**
 * On big screens (desktop browsers) the app is shown inside an iPhone-shaped
 * frame. This keeps that frame fully visible by scaling it to the window.
 */
export function useFrameScale() {
  useEffect(() => {
    const apply = () => {
      const s = Math.min(1, (window.innerHeight - 32) / H, (window.innerWidth - 32) / W)
      document.documentElement.style.setProperty('--frame-scale', String(Math.max(0.4, s)))
    }
    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [])
}
