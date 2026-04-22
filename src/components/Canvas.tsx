import { useRef, useCallback, useEffect } from 'react'
import type { Talk, Point, Priority, Tag } from '../types'
import { talks } from '../data/talks'
import {
  calculatePosition,
  scrubberToX,
  screenToWorld,
  minutesToLabel,
  DAY_START,
  DAY_END,
  PIXELS_PER_MINUTE,
  STAGE_Y,
  STAGE_HEIGHT,
} from '../utils/coordinates'
import { TAG_COLORS, STAGE_COLORS } from '../constants'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CanvasProps {
  zoom: number
  pan: Point
  scrubberTime: number
  selectedTalk: Talk | null
  activeTag: string | null
  activeDay: string
  onPanChange: (pan: Point) => void
  onZoomChange: (zoom: number) => void
  onTalkSelect: (talk: Talk | null) => void
}
const CANVAS_WIDTH  = (DAY_END - DAY_START) * PIXELS_PER_MINUTE
const CANVAS_HEIGHT = 600

const RULER_TICKS = Array.from(
  { length: ((DAY_END - DAY_START) / 30) + 1 },
  (_, i) => DAY_START + i * 30
)

// ─── Static styles ────────────────────────────────────────────────────────────

const styles = {
  container: {
    flex:            1,
    overflow:        'hidden',
    position:        'relative',
    backgroundImage: 'radial-gradient(circle, #C8BFB0 1px, transparent 1px)',
    backgroundSize:  '24px 24px',
    backgroundColor: '#F5F5F0',
  },
  ruler: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    height:          36,
    backgroundColor: '#F5F5F0',
    borderBottom:    '1px solid #E5E0D8',
    zIndex:          10,
    overflow:        'hidden',
  },
  rulerTick: {
    position: 'absolute',
    top:      0,
    height:   '100%',
  },
  rulerTickLine: {
    position:        'absolute',
    top:             0,
    left:            0,
    width:           1,
    height:          '100%',
    backgroundColor: '#E5E0D8',
  },
  overlapBand: {
    position:        'absolute',
    top:             0,
    height:          CANVAS_HEIGHT,
    backgroundColor: '#F59E0B18',
    borderLeft:      '1px dashed #F59E0B40',
    borderRight:     '1px dashed #F59E0B40',
    pointerEvents:   'none',
  },
  nowLine: {
    position:        'absolute',
    top:             36,
    width:           2,
    bottom:          0,
    backgroundColor: '#EF4444',
    zIndex:          20,
    pointerEvents:   'none',
  },
  nowLineLabel: {
    position:        'absolute',
    top:             8,
    left:            4,
    backgroundColor: '#EF4444',
    color:           '#fff',
    fontSize:        9,
    fontWeight:      700,
    padding:         '2px 5px',
    borderRadius:    3,
    whiteSpace:      'nowrap',
  },
  headlinerBadge: {
    display:         'inline-flex',
    alignItems:      'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius:    3,
    padding:         '1px 6px',
    marginBottom:    6,
  },
  headlinerBadgeText: {
    fontSize:      9,
    fontWeight:    700,
    color:         '#fff',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
} satisfies Record<string, React.CSSProperties>

// ─── Dynamic style helpers ────────────────────────────────────────────────────

function getContainerStyle(isPanning: boolean): React.CSSProperties {
  return {
    ...styles.container,
    cursor: isPanning ? 'grabbing' : 'grab',
  }
}

function getWorldStyle(pan: Point, zoom: number): React.CSSProperties {
  return {
    position:        'absolute',
    transform:       `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
    transformOrigin: '0 0',
    width:           CANVAS_WIDTH,
    height:          CANVAS_HEIGHT,
    top:             36,
  }
}

function getStageLaneStyle(stage: 'main' | 'workshop'): React.CSSProperties {
  return {
    position:        'absolute',
    left:            0,
    top:             STAGE_Y[stage] - 8,
    width:           CANVAS_WIDTH,
    height:          STAGE_HEIGHT['headliner'] + 24,
    backgroundColor: STAGE_COLORS[stage] + '12',
    borderTop:       `1px solid ${STAGE_COLORS[stage]}30`,
  }
}

function getStageLabelStyle(stage: 'main' | 'workshop', zoom: number, panY: number): React.CSSProperties {
  return {
    position:      'absolute',
    left:          8,
    top:           STAGE_Y[stage] * zoom + panY + 36 + 8,
    pointerEvents: 'none',
    zIndex:        5,
  }
}

function getStageLabelTextStyle(stage: 'main' | 'workshop'): React.CSSProperties {
  return {
    fontSize:        10,
    fontWeight:      700,
    letterSpacing:   '0.1em',
    textTransform:   'uppercase',
    color:           STAGE_COLORS[stage],
    backgroundColor: '#F5F5F0',
    padding:         '2px 6px',
    borderRadius:    3,
  }
}

function getRulerTickLabelStyle(t: number): React.CSSProperties {
  return {
    position:   'absolute',
    top:        10,
    left:       4,
    fontSize:   10,
    color:      t % 60 === 0 ? '#6B7280' : '#A8A098',
    whiteSpace: 'nowrap',
    fontWeight: t % 60 === 0 ? 700 : 400,
  }
}

function getStatusBadgeStyle(isCurrent: boolean): React.CSSProperties {
  return {
    display:         'inline-flex',
    alignItems:      'center',
    backgroundColor: isCurrent ? '#EF4444' : '#FBB724',
    color:           '#fff',
    fontSize:        8,
    fontWeight:      700,
    padding:         '2px 6px',
    borderRadius:    3,
    letterSpacing:   '0.08em',
    textTransform:   'uppercase',
    marginBottom:    4,
  }
}

function getTalkBlockStyle(
  pos: { left: number; top: number; width: number; height: number },
  color: string,
  priority: Priority,
  isSelected: boolean,
  isFiltered: boolean,
  isCurrent: boolean,
  isNext: boolean,
): React.CSSProperties {
  const base: React.CSSProperties = {
    position:      'absolute',
    left:          pos.left + 2,
    top:           pos.top,
    width:         pos.width - 4,
    height:        pos.height,
    borderRadius:  priority === 'headliner' ? 8 : 6,
    cursor:        'pointer',
    padding:       priority === 'headliner' ? '10px 12px' : '6px 8px',
    transition:    'transform 0.1s ease, box-shadow 0.1s ease, opacity 0.2s ease',
    overflow:      'hidden',
    opacity:       isFiltered ? 0.15 : 1,
    animation:     isCurrent
      ? 'pulse-ring 1.5s ease-out infinite'
      : isNext
      ? 'pulse-next 1.5s ease-out infinite'
      : 'none',
    outline:       isCurrent
      ? '2px solid #EF4444'
      : isNext
      ? '2px solid #FBB724'
      : 'none',
    outlineOffset: 2,
  }

  if (priority === 'headliner') {
    return {
      ...base,
      backgroundColor: color,
      border:          `2px solid ${color}`,
      boxShadow:       `0 4px 24px ${color}44`,
    }
  }

  if (priority === 'main_act') {
    return {
      ...base,
      backgroundColor: isSelected ? color + 'EE' : color + '33',
      border:          `2px solid ${color}`,
    }
  }

  return {
    ...base,
    backgroundColor: isSelected ? color + 'CC' : color + '28',
    border:          `1.5px solid ${color}88`,
  }
}

function getSpeakerTextStyle(
  priority: Priority,
  color: string,
  isSelected: boolean,
  speakerOpacity: number,
): React.CSSProperties {
  const colorMap = {
    headliner: '#ffffff',
    main_act:  isSelected ? '#ffffff' : color,
    support:   isSelected ? '#ffffff' : '#374151',
  }
  return {
    fontSize:     priority === 'headliner' ? 14 : priority === 'main_act' ? 12 : 10,
    fontWeight:   priority === 'headliner' ? 800 : priority === 'main_act' ? 700 : 500,
    color:        colorMap[priority],
    margin:       0,
    lineHeight:   1.2,
    whiteSpace:   'nowrap',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    opacity:      speakerOpacity,
    transition:   'opacity 0.2s',
  }
}

function getTitleTextStyle(
  priority: Priority,
  color: string,
  isSelected: boolean,
  titleOpacity: number,
): React.CSSProperties {
  const colorMap = {
    headliner: 'rgba(255,255,255,0.9)',
    main_act:  isSelected ? 'rgba(255,255,255,0.9)' : '#374151',
    support:   isSelected ? 'rgba(255,255,255,0.85)' : '#6B7280',
  }
  return {
    fontSize:        priority === 'headliner' ? 11 : 10,
    color:           colorMap[priority],
    margin:          '3px 0 0',
    lineHeight:      1.3,
    opacity:         titleOpacity,
    transition:      'opacity 0.2s',
    overflow:        'hidden',
    display:         '-webkit-box',
    WebkitLineClamp: priority === 'headliner' ? 3 : 2,
    WebkitBoxOrient: 'vertical',
  }
}

function getDescriptionTextStyle(priority: Priority): React.CSSProperties {
  return {
    fontSize:        9,
    color:           priority === 'headliner' ? 'rgba(255,255,255,0.7)' : '#9CA3AF',
    margin:          '4px 0 0',
    lineHeight:      1.4,
    overflow:        'hidden',
    display:         '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Canvas({
  zoom,
  pan,
  scrubberTime,
  selectedTalk,
  activeTag,
  activeDay,
  onPanChange,
  onZoomChange,
  onTalkSelect,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isPanning    = useRef(false)
  const lastMouse    = useRef<Point>({ x: 0, y: 0 })

  const visibleTalks = talks.filter(t => t.day === activeDay)

  const currentTalk = visibleTalks.find(t =>
    scrubberTime >= t.startTime &&
    scrubberTime < t.startTime + t.duration
  )

  const nextTalk = visibleTalks
    .filter(t => t.startTime > scrubberTime)
    .sort((a, b) => a.startTime - b.startTime)[0]

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isPanning.current = true
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    lastMouse.current = { x: e.clientX, y: e.clientY }

    const containerWidth  = containerRef.current?.clientWidth  ?? 1200
    const containerHeight = containerRef.current?.clientHeight ?? 800

    const minX = -(CANVAS_WIDTH  * zoom - containerWidth  * 0.5)
    const maxX = containerWidth  * 0.3
    const minY = -(CANVAS_HEIGHT * zoom - containerHeight * 0.5)
    const maxY = containerHeight * 0.3

    const newX = Math.min(maxX, Math.max(minX, pan.x + dx * 0.6))
    const newY = Math.min(maxY, Math.max(minY, pan.y + dy * 0.6))

    onPanChange({ x: newX, y: newY })
  }, [pan, zoom, onPanChange])

  const onMouseUp = useCallback(() => {
    isPanning.current = false
  }, [])

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta   = e.deltaY > 0 ? -0.03 : 0.03
    const newZoom = Math.min(Math.max(zoom + delta, 0.5), 3)

    const rect     = containerRef.current!.getBoundingClientRect()
    const mouseX   = e.clientX - rect.left
    const mouseY   = e.clientY - rect.top
    const worldPos = screenToWorld(mouseX, mouseY, pan, zoom)

    onPanChange({
      x: mouseX - worldPos.x * newZoom,
      y: mouseY - worldPos.y * newZoom,
    })
    onZoomChange(newZoom)
  }, [zoom, pan, onPanChange, onZoomChange])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  const animateTo = useCallback((
    targetPan: Point,
    targetZoom: number,
    duration: number = 400
  ) => {
    const startPan  = { ...pan }
    const startZoom = zoom
    const startTime = performance.now()

    function frame(now: number) {
      const elapsed = now - startTime
      const t       = Math.min(elapsed / duration, 1)
      const ease    = 1 - Math.pow(1 - t, 3)
      onZoomChange(lerp(startZoom, targetZoom, ease))
      onPanChange({
        x: lerp(startPan.x, targetPan.x, ease),
        y: lerp(startPan.y, targetPan.y, ease),
      })
      if (t < 1) requestAnimationFrame(frame)
    }

    requestAnimationFrame(frame)
  }, [pan, zoom, onPanChange, onZoomChange])

  const handleTalkDoubleClick = useCallback((
    e: React.MouseEvent,
    talk: Talk
  ) => {
    e.stopPropagation()
    const pos             = calculatePosition(talk)
    const targetZoom      = 1.8
    const containerWidth  = containerRef.current?.clientWidth  ?? 1200
    const containerHeight = containerRef.current?.clientHeight ?? 800

    animateTo({
      x: containerWidth  / 2 - (pos.left + pos.width  / 2) * targetZoom,
      y: containerHeight / 2 - (pos.top  + pos.height / 2) * targetZoom,
    }, targetZoom)
  }, [animateTo])

  const nowX = scrubberToX(scrubberTime) * zoom + pan.x

  return (
    <div
      ref={containerRef}
      style={getContainerStyle(isPanning.current)}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <style>{`
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0px rgba(239,68,68,0.4); }
          100% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }
        @keyframes pulse-next {
          0%   { box-shadow: 0 0 0 0px rgba(251,191,36,0.4); }
          100% { box-shadow: 0 0 0 8px rgba(251,191,36,0); }
        }
      `}</style>

      {/* ── Time ruler ── */}
      <div style={styles.ruler}>
        {RULER_TICKS.map(t => {
          const screenX = (t - DAY_START) * PIXELS_PER_MINUTE * zoom + pan.x
          if (screenX < -100 || screenX > (containerRef.current?.clientWidth ?? 2000) + 100) return null
          return (
            <div key={t} style={{ ...styles.rulerTick, left: screenX }}>
              <div style={styles.rulerTickLine} />
              <span style={getRulerTickLabelStyle(t)}>
                {minutesToLabel(t)}
              </span>
            </div>
          )
        })}
      </div>

      {/* ── World ── */}
      <div style={getWorldStyle(pan, zoom)}>

        {/* Stage lane backgrounds */}
        {(['main', 'workshop'] as const).map(stage => (
          <div key={stage} style={getStageLaneStyle(stage)} />
        ))}

        {/* Overlap highlight bands */}
        {visibleTalks.filter(t => t.stage === 'main').map(mainTalk => {
          const workshopOverlaps = visibleTalks.filter(w =>
            w.stage === 'workshop' &&
            w.startTime < mainTalk.startTime + mainTalk.duration &&
            w.startTime + w.duration > mainTalk.startTime
          )
          if (workshopOverlaps.length === 0) return null
          const pos = calculatePosition(mainTalk)
          return (
            <div
              key={`overlap-${mainTalk.id}`}
              style={{ ...styles.overlapBand, left: pos.left, width: pos.width }}
            />
          )
        })}

        {/* Talk blocks */}
        {visibleTalks.map(talk => {
          const pos         = calculatePosition(talk)
          const color       = TAG_COLORS[talk.tag]
          const isSelected  = selectedTalk?.id === talk.id
          const isHeadliner = talk.priority === 'headliner'
          const isFiltered  = activeTag !== null && talk.tag !== activeTag
          const isCurrent   = currentTalk?.id === talk.id
          const isNext      = nextTalk?.id === talk.id

          const titleOpacity = zoom < 0.7 ? 0 : zoom < 0.9 ? (zoom - 0.7) / 0.2 : 1

          return (
            <div
              key={talk.id}
              onClick={(e) => { e.stopPropagation(); onTalkSelect(isSelected ? null : talk) }}
              onDoubleClick={(e) => handleTalkDoubleClick(e, talk)}
              style={getTalkBlockStyle(pos, color, talk.priority, isSelected, isFiltered, isCurrent, isNext)}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                if (isHeadliner) e.currentTarget.style.boxShadow = `0 8px 32px ${color}66`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = isHeadliner ? `0 4px 24px ${color}44` : 'none'
              }}
            >
              {(isCurrent || isNext) && (
                <div style={getStatusBadgeStyle(isCurrent)}>
                  {isCurrent ? 'Now' : 'Up Next'}
                </div>
              )}

              {isHeadliner && (
                <div style={styles.headlinerBadge}>
                  <span style={styles.headlinerBadgeText}>Headliner</span>
                </div>
              )}

              <p style={getSpeakerTextStyle(talk.priority, color, isSelected, 1)}>
                {talk.speaker}
              </p>

              {pos.height > 80 && (
                <p style={getTitleTextStyle(talk.priority, color, isSelected, titleOpacity)}>
                  {talk.title}
                </p>
              )}

              {zoom > 1.2 && pos.height > 100 && (
                <p style={getDescriptionTextStyle(talk.priority)}>
                  {talk.description}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Stage labels */}
      {(['main', 'workshop'] as const).map(stage => (
        <div key={stage} style={getStageLabelStyle(stage, zoom, pan.y)}>
          <span style={getStageLabelTextStyle(stage)}>
            {stage === 'main' ? 'Main Stage' : 'Workshop'}
          </span>
        </div>
      ))}

      {/* Now line */}
      <div style={{ ...styles.nowLine, left: nowX }}>
        <div style={styles.nowLineLabel}>
          {minutesToLabel(scrubberTime)}
        </div>
      </div>

    </div>
  )
}