import type { DeviceIds } from '../types'

/** Values of the reference iPhone. */
export const DEFAULT_DEVICE_IDS: DeviceIds = {
  eid: '89049032007008882600097528220310',
  imei: '351884703323602',
  imei2: '351884703880395',
  meid: '35188470332360',
}

export function luhnValid(digits: string): boolean {
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i])
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  return sum % 10 === 0
}

/** Returns an error message, or '' when the value is valid. */
export function validateId(kind: keyof DeviceIds, value: string): string {
  if (!/^\d*$/.test(value)) return 'Digits only'
  switch (kind) {
    case 'eid':
      return value.length === 32 ? '' : `EID must be 32 digits (${value.length})`
    case 'meid':
      return value.length === 14 ? '' : `MEID must be 14 digits (${value.length})`
    default:
      if (value.length !== 15) return `IMEI must be 15 digits (${value.length})`
      return luhnValid(value) ? '' : 'Invalid check digit'
  }
}

/** Check digit (last digit) that makes a 14-digit IMEI body Luhn-valid. */
export function imeiCheckDigit(body14: string): string {
  for (let c = 0; c < 10; c++) if (luhnValid(body14 + c)) return String(c)
  return '0'
}
