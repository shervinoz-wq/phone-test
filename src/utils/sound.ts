/**
 * Keypad tones (DTMF) generated locally with the Web Audio API,
 * so no audio files and no network are needed.
 */
const ROWS = [697, 770, 852, 941]
const COLS = [1209, 1336, 1477]
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      ctx = new Ctor()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

export function playTone(key: string, ms = 140) {
  const i = KEYS.indexOf(key)
  if (i < 0) return
  const ac = getCtx()
  if (!ac) return
  const now = ac.currentTime
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.084, now + 0.01)
  gain.gain.setValueAtTime(0.084, now + ms / 1000 - 0.02)
  gain.gain.linearRampToValueAtTime(0, now + ms / 1000)
  gain.connect(ac.destination)
  for (const f of [ROWS[Math.floor(i / 3)], COLS[i % 3]]) {
    const osc = ac.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = f
    osc.connect(gain)
    osc.start(now)
    osc.stop(now + ms / 1000)
  }
}
