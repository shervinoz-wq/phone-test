import { useEffect } from 'react'

/**
 * Publishes the height of the on-screen keyboard as the CSS variable --kb so
 * bottom-anchored UI (the search field) can sit right above it on iOS.
 */
export function useKeyboardInset(active: boolean) {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv || !active) {
      document.documentElement.style.setProperty('--kb', '0px')
      return
    }
    const update = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      document.documentElement.style.setProperty('--kb', `${Math.round(kb)}px`)
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      document.documentElement.style.setProperty('--kb', '0px')
    }
  }, [active])
}
