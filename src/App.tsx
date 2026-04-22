import { useState, useCallback, useEffect } from 'react'
import type { Talk, Connection, Point, Day } from './types'
import { seedConnections } from './data/connections'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'
import TalkDetail from './components/TalkDetail'
import MyCard from './components/MyCard'
import Minimap from './components/Minimap'
import NavHint from './components/NavHint'


export default function App() {
  // ── Canvas state ──────────────────────────────────────
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState<Point>({ x: 80, y: 40 })

  // ── Day switcher ──────────────────────────────────────
  const [activeDay, setActiveDay] = useState<Day>('day1')

  // ── Scrubber ──────────────────────────────────────────
  const [scrubberTime, setScrubberTime] = useState(600)

  // ── Talk selection ────────────────────────────────────
  const [selectedTalk, setSelectedTalk] = useState<Talk | null>(null)

  // ── Tag filtering ─────────────────────────────────────
  const [activeTag, setActiveTag] = useState<string | null>(null)

  // ── Networking ────────────────────────────────────────
  const [connections, setConnections] = useState<Connection[]>(seedConnections)
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const [showCard, setShowCard] = useState(false)

  const addConnection = useCallback((connection: Connection) => {
    setConnections(prev => [...prev, connection])
  }, [])

  const handleZoomIn  = useCallback(() => setZoom(z => Math.min(z + 0.2, 3)), [])
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(z - 0.2, 0.5)), [])

  const handleTalkSelect = useCallback((talk: Talk | null) => {
    setSelectedTalk(talk)
    if (talk) setShowCard(false)
  }, [])

  const handleShowCard = useCallback(() => {
    setShowCard(s => !s)
    setSelectedTalk(null)
  }, [])

  const handleTagClick = useCallback((tag: string) => {
    setActiveTag(prev => prev === tag ? null : tag)
  }, [])

  const handleDayChange = useCallback((day: Day) => {
    setActiveDay(day)
    setScrubberTime(600)
    setSelectedTalk(null)
    setPan({ x: 80, y: 40 })
  }, [])

  const handleResetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 80, y: 40 })
    setSelectedTalk(null)
    setActiveTag(null)
  }, [])

  // ── Keyboard shortcuts ────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case '+':
        case '=':
          setZoom(z => Math.min(z + 0.1, 3))
          break
        case '-':
          setZoom(z => Math.max(z - 0.1, 0.5))
          break
        case 'Escape':
          setSelectedTalk(null)
          setShowCard(false)
          setActiveTag(null)
          break
        case 'ArrowLeft':
          setPan(p => ({ ...p, x: p.x + 80 }))
          break
        case 'ArrowRight':
          setPan(p => ({ ...p, x: p.x - 80 }))
          break
        case 'ArrowUp':
          setPan(p => ({ ...p, y: p.y + 80 }))
          break
        case 'ArrowDown':
          setPan(p => ({ ...p, y: p.y - 80 }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // ── Mobile guard ──────────────────────────────────────
  if (window.innerWidth < 768) {
    return (
      <div className="w-screen h-screen flex items-center justify-center p-8 text-center">
        <div>
          <p className="text-2xl mb-2">🖥️</p>
          <p className="text-sm font-medium text-gray-700">
            React Conf 2015 is designed for desktop.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Open on a larger screen for the full spatial experience.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#F5F5F0] flex flex-col">
      <TopBar
        onMyCardClick={handleShowCard}
        showCard={showCard}
        activeTag={activeTag}
        onTagClick={handleTagClick}
        activeDay={activeDay}
        onDayChange={handleDayChange}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          zoom={zoom}
          scrubberTime={scrubberTime}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onScrub={setScrubberTime}
          onResetView={handleResetView}
        />
        <div className="flex-1 relative overflow-hidden flex">
          <Canvas
            zoom={zoom}
            pan={pan}
            scrubberTime={scrubberTime}
            selectedTalk={selectedTalk}
            activeTag={activeTag}
            activeDay={activeDay}
            onPanChange={setPan}
            onZoomChange={setZoom}
            onTalkSelect={handleTalkSelect}
          />
          <Minimap
            zoom={zoom}
            pan={pan}
            activeDay={activeDay}
            viewportWidth={window.innerWidth - 192}
            viewportHeight={window.innerHeight - 48}
            onJump={setPan}
          />
          <NavHint />
          {selectedTalk && !showCard && (
            <TalkDetail
              talk={selectedTalk}
              onClose={() => setSelectedTalk(null)}
            />
          )}
          {showCard && (
            <div style={{
              position:        'absolute',
              top:             0,
              right:           0,
              width:           300,
              height:          '100%',
              backgroundColor: '#FAFAF8',
              borderLeft:      '1px solid #E5E0D8',
              zIndex:          30,
              animation:       'slideIn 0.2s ease-out',
            }}>
              <style>{`
                @keyframes slideIn {
                  from { transform: translateX(100%); opacity: 0; }
                  to   { transform: translateX(0);    opacity: 1; }
                }
              `}</style>
              <MyCard
                linkedInUrl={linkedInUrl}
                onLinkedInUrlChange={setLinkedInUrl}
                connections={connections}
                onAddConnection={addConnection}
                scrubberTime={scrubberTime}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}