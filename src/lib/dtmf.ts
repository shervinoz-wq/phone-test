const FREQS: Record<string, [number, number]> = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
}

let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (ctx) return ctx
  const w = window as unknown as { webkitAudioContext?: typeof AudioContext }
  const Ctor = window.AudioContext ?? w.webkitAudioContext
  if (!Ctor) return null
  ctx = new Ctor()
  return ctx
}

/** Starts a DTMF tone (generated locally, no audio files). Returns a stop function. */
export function startTone(key: string): () => void {
  const freqs = FREQS[key]
  const c = getContext()
  if (!freqs || !c) return () => {}
  if (c.state === 'suspended') void c.resume()
  const start = c.currentTime
  const gain = c.createGain()
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(0.12, start + 0.008)
  gain.connect(c.destination)
  const oscillators = freqs.map((hz) => {
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.value = hz
    o.connect(gain)
    o.start(start)
    return o
  })
  let stopped = false
  return () => {
    if (stopped) return
    stopped = true
    const end = Math.max(c.currentTime, start + 0.12)
    gain.gain.setValueAtTime(0.12, end)
    gain.gain.linearRampToValueAtTime(0, end + 0.03)
    oscillators.forEach((o) => o.stop(end + 0.05))
  }
}
