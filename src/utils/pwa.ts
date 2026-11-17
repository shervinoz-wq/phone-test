import { useEffect, useState } from 'react'

/** Register the service worker (production builds only). */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}service-worker.js`)
      .then((reg) => {
        // Look for a new version whenever the app comes back to the foreground.
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') void reg.update().catch(() => {})
        })
      })
      .catch(() => {})
  })
}

export type OfflineStatus = 'unsupported' | 'checking' | 'ready'

export function useOfflineStatus(): { offline: OfflineStatus; online: boolean } {
  const supported = import.meta.env.PROD && 'serviceWorker' in navigator
  const [offline, setOffline] = useState<OfflineStatus>(supported ? 'checking' : 'unsupported')
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    let alive = true
    if (supported) {
      void navigator.serviceWorker.ready.then(() => alive && setOffline('ready'))
    }
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      alive = false
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [supported])

  return { offline, online }
}
