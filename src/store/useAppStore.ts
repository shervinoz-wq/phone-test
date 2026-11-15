import { useContext } from 'react'
import { AppStoreContext, type AppStore } from './context'

export function useAppStore(): AppStore {
  const store = useContext(AppStoreContext)
  if (!store) throw new Error('useAppStore must be used inside <AppStoreProvider>')
  return store
}
