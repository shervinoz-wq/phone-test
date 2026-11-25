import { useState } from 'react'
import { CloseIcon } from '../components/Icons'
import { useRubberBand } from '../hooks/useRubberBand'
import { useStore } from '../hooks/useStore'
import { barcodeBars } from '../utils/code128'

interface Props {
  onClose: () => void
}

/** Barcode module width per identifier (the 32-digit EID is drawn narrower to fit). */
const MODULE = { eid: 0.92, imei: 1.85, imei2: 1.85, meid: 1.85 } as const

function Barcode({ value, module }: { value: string; module: number }) {
  const { bars, modules } = barcodeBars(value)
  return (
    <svg
      className="imei-barcode"
      width={modules * module}
      height={41}
      viewBox={`0 0 ${modules} 41`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      role="img"
      aria-label={`Barcode ${value}`}
    >
      {bars.map(([x, w]) => (
        <rect key={x} x={x} y={0} width={w} height={41} fill="#000" />
      ))}
    </svg>
  )
}

export function ImeiSheet({ onClose }: Props) {
  const { state } = useStore()
  const ids = state.settings.deviceIds
  const IDS = (['imei', 'imei2'] as const).map((k) => ({
    label: k === 'imei2' ? 'IMEI2' : k.toUpperCase(),
    value: ids[k],
    module: MODULE[k],
  }))
  const { scroller, inner } = useRubberBand()
  // Once the large title has scrolled away it moves up into the bar (iOS large-title behavior).
  const [scrolled, setScrolled] = useState(false)
  return (
    <div className="imei-page">
      <div ref={scroller} className="imei-scroll" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 44)}>
        <div ref={inner} className="imei-inner">
          <h1 className="imei-title">Share Device Identifiers</h1>
          <p className="imei-sub">You can share IMEIs by scanning the barcodes.</p>
          {IDS.map((d) => (
            <section key={d.label} className="imei-block">
              <div className="imei-label">
                {d.label} {d.value}
              </div>
              <Barcode value={d.value} module={d.module} />
            </section>
          ))}
        </div>
      </div>

      <div className={`imei-bar${scrolled ? ' on' : ''}`} aria-hidden={!scrolled}>
        <span className="imei-bar-title">Share Device Identifiers</span>
      </div>
      <button type="button" className="imei-close" aria-label="Close" onClick={onClose}>
        <CloseIcon size={19} />
      </button>
    </div>
  )
}
