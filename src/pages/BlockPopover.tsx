import { useRef } from 'react'
import { useTransitionMount } from '../hooks/useTransitionMount'
import { useSheetDrag } from '../hooks/useSheetDrag'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

/** iOS 26 confirmation popover for "Block Contact". */
export function BlockPopover({ open, onClose, onConfirm }: Props) {
  const { mounted, shown } = useTransitionMount(open, 220)
  const popRef = useRef<HTMLDivElement>(null)
  useSheetDrag({
    sheetRef: popRef,
    mounted,
    active: open,
    onClose,
    baseTransform: 'translateX(-50%)',
    exitTransform: 'translateX(-50%) translateY(150%)',
    exitTransition: 'transform 0.2s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s',
  })
  if (!mounted) return null
  return (
    <div className={`block-root${shown ? ' is-open' : ''}`}>
      <div className="block-backdrop" onClick={onClose} />
      <div ref={popRef} className="block-pop glass" role="alertdialog" aria-modal="true">
        <p>You will not receive phone calls, messages, email or FaceTime from blocked contacts.</p>
        <button
          type="button"
          className="block-btn"
          onClick={() => {
            onClose()
            onConfirm()
          }}
        >
          Block Contact
        </button>
      </div>
    </div>
  )
}
