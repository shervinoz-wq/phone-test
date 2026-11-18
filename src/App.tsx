import { useState } from 'react'
import { BatteryIcon, SignalIcon, WifiIcon } from './components/Icons'
import { TabBar } from './components/TabBar'
import { useFrameScale } from './hooks/useFrameScale'
import { KeypadPage } from './pages/KeypadPage'
import type { TabId } from './types'

function Shell() {
  const [tab, setTab] = useState<TabId>('keypad')

  return (
    <div className="stage">
      <div className="device">
        <div className="screen">
          <div className="fake-status" aria-hidden>
            <span className="fs-time">9:41</span>
            <span className="fs-icons">
              <SignalIcon />
              <WifiIcon />
              <BatteryIcon />
            </span>
          </div>
          <div className="island" aria-hidden />

          <main className="panels">
            {/* Demo: only Keypad has content; Calls and Contacts are blank white pages. */}
            <div className={`panel blank${tab === 'calls' ? ' active' : ''}`} aria-hidden={tab !== 'calls'} />
            <div className={`panel blank${tab === 'contacts' ? ' active' : ''}`} aria-hidden={tab !== 'contacts'} />
            <div className={`panel${tab === 'keypad' ? ' active' : ''}`} aria-hidden={tab !== 'keypad'}>
              <KeypadPage />
            </div>
          </main>

          <TabBar active={tab} missedBadge={0} onSearch={() => {}} onChange={setTab} />

          <div className="home-indicator" aria-hidden />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  useFrameScale()
  return <Shell />
}
