import { useState } from 'react'
import { CheckIcon, CloseIcon } from '../components/Icons'
import { useStore } from '../hooks/useStore'
import type { DeviceIds } from '../types'
import { DEFAULT_DEVICE_IDS, imeiCheckDigit, validateId } from '../utils/deviceIds'

interface Props {
  onCancel: () => void
  onSave: (ids: DeviceIds) => void
}

const FIELDS: { key: keyof DeviceIds; label: string; max: number }[] = [
  { key: 'eid', label: 'EID', max: 32 },
  { key: 'imei', label: 'IMEI', max: 15 },
  { key: 'imei2', label: 'IMEI2', max: 15 },
  { key: 'meid', label: 'MEID', max: 14 },
]

/** Sheet for editing the identifiers shown by *#06# (opened by dialing *1*1#) (saved locally). */
export function DeviceIdsForm({ onCancel, onSave }: Props) {
  const { state } = useStore()
  const [ids, setIds] = useState<DeviceIds>(state.settings.deviceIds)
  const [touched, setTouched] = useState<Partial<Record<keyof DeviceIds, boolean>>>({})

  const errors = Object.fromEntries(FIELDS.map((f) => [f.key, validateId(f.key, ids[f.key])])) as Record<
    keyof DeviceIds,
    string
  >
  const valid = FIELDS.every((f) => !errors[f.key])

  const set = (key: keyof DeviceIds, raw: string, max: number) => {
    const value = raw.replace(/\D/g, '').slice(0, max)
    setIds((prev) => {
      const next = { ...prev, [key]: value }
      // MEID follows the first 14 digits of the IMEI while it still matches it (as on the reference phone).
      if (key === 'imei' && prev.meid === prev.imei.slice(0, 14)) next.meid = value.slice(0, 14)
      return next
    })
  }

  const fixCheckDigit = (key: 'imei' | 'imei2') => {
    const body = ids[key].slice(0, 14)
    if (body.length === 14) set(key, body + imeiCheckDigit(body), 15)
  }

  return (
    <div className="form">
      <div className="grabber" aria-hidden />
      <header className="sheet-bar">
        <button type="button" className="glass-btn round" aria-label="Cancel" onClick={onCancel}>
          <CloseIcon size={22} />
        </button>
        <span className="sheet-title">Device Identifiers</span>
        <button
          type="button"
          className={`glass-btn round done${valid ? ' ready' : ''}`}
          aria-label="Done"
          disabled={!valid}
          onClick={() => onSave(ids)}
        >
          <CheckIcon size={22} />
        </button>
      </header>

      <div className="scroll">
        <p className="ids-note">These values are shown when you dial *#06#. EID is 32 digits, IMEI is 15 digits with a valid check digit.</p>
        <div className="round-card">
          {FIELDS.map((f) => {
            const err = touched[f.key] || ids[f.key] ? errors[f.key] : ''
            const isImei = f.key === 'imei' || f.key === 'imei2'
            return (
              <div key={f.key} className="ids-row">
                <div className="ids-line">
                  <span className="ids-label">{f.label}</span>
                  <input
                    value={ids[f.key]}
                    inputMode="numeric"
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(e) => set(f.key, e.target.value, f.max)}
                    onBlur={() => setTouched((t) => ({ ...t, [f.key]: true }))}
                    placeholder={DEFAULT_DEVICE_IDS[f.key]}
                  />
                </div>
                {err && (
                  <div className="ids-error">
                    {err}
                    {isImei && ids[f.key].length === 14 && (
                      <button type="button" className="ids-fix" onClick={() => fixCheckDigit(f.key as 'imei' | 'imei2')}>
                        Add check digit
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <button type="button" className="pill-row link" onClick={() => setIds({ ...DEFAULT_DEVICE_IDS })}>
          Restore Defaults
        </button>
      </div>
    </div>
  )
}
