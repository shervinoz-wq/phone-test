import { useEffect, useState } from 'react'
import { CheckIcon } from '../components/Icons'
import { LargeTitleScreen } from '../components/LargeTitleScreen'
import { Toggle } from '../components/Toggle'
import { useAppStore } from '../store/useAppStore'

export function SettingsScreen() {
  const { settings, updateSettings, resetData } = useAppStore()
  const [offlineReady, setOfflineReady] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    let alive = true
    navigator.serviceWorker.ready.then(() => alive && setOfflineReady(true)).catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  return (
    <LargeTitleScreen title="Settings">
      <div className="settings-body">
        <div className="group">
          <div className="setting-cell">
            <span>Keypad Sounds</span>
            <Toggle
              label="Keypad Sounds"
              checked={settings.keypadSounds}
              onChange={(v) => updateSettings({ keypadSounds: v })}
            />
          </div>
          <div className="setting-cell">
            <span>Available Offline</span>
            <span className="setting-value">
              {offlineReady ? (
                <>
                  <span className="ok">
                    <CheckIcon size={18} />
                  </span>
                  Ready
                </>
              ) : (
                'Preparing…'
              )}
            </span>
          </div>
        </div>
        <p className="group-note">
          This is a demo. No real calls are placed and no system call history or contacts are accessed. All data stays on
          this device.
        </p>

        <div className="group">
          {confirmReset ? (
            <div className="confirm-row">
              <button
                className="plain-cell red"
                onClick={() => {
                  resetData()
                  setConfirmReset(false)
                }}
              >
                Reset Now
              </button>
              <button className="plain-cell blue" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="plain-cell red" onClick={() => setConfirmReset(true)}>
              Reset Sample Data
            </button>
          )}
        </div>

        <div className="group">
          <div className="setting-cell">
            <span>Version</span>
            <span className="setting-value">1.0.0</span>
          </div>
        </div>
      </div>
    </LargeTitleScreen>
  )
}
