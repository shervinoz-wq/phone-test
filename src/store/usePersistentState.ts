import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

export function usePersistentState<T>(key: string, initial: () => T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw) as T
    } catch {
      /* storage unavailable: fall back to defaults */
    }
    return initial()
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* ignore quota / private mode errors */
    }
  }, [key, value])
  return [value, setValue]
}
