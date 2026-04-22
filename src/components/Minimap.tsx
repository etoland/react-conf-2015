import type { Point, Talk } from '../types'
import { talks } from '../data/talks'
import {
  calculatePosition,
  DAY_START,
  DAY_END,
  PIXELS_PER_MINUTE,
  STAGE_Y,
  STAGE_HEIGHT,
} from '../utils/coordinates'

interface MinimapProps {
  zoom: number
  pan: Point
  activeDay: string
  viewportWidth: number
  viewportHeight: number
  onJump: (pan: Point) => void
}

const TAG_COLORS: Record<string, string> = {
  'core-react':  '#3B82F6',
  'performance': '#A855F7',
  'ux-design':   '#F97316',
  'ecosystem':   '#94A3B8',
}

const WORLD_WIDTH  = (DAY_END - DAY_START) * PIXELS_PER_MINUTE
const WORLD_HEIGHT = 600
const MAP_WIDTH    = 180
const MAP_HEIGHT   = 80
const SCALE_X      = MAP_WIDTH  / WORLD_WIDTH
const SCALE_Y      = MAP_HEIGHT / WORLD_HEIGHT

export default function Minimap({
  zoom,
  pan,
  activeDay,
  viewportWidth,
  viewportHeight,
  onJump,
}: MinimapProps) {
  const visibleTalks = talks.filter(t => t.day === activeDay)

  // Viewport rectangle in minimap space
  const vpX = (-pan.x / zoom) * SCALE_X
  const vpY = (-pan.y / zoom) * SCALE_Y
  const vpW = (viewportWidth  / zoom) * SCALE_X
  const vpH = (viewportHeight / zoom) * SCALE_Y

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect    = e.currentTarget.getBoundingClientRect()
    const clickX  = e.clientX - rect.left
    const clickY  = e.clientY - rect.top

    // Convert minimap click to world position then to pan
    const worldX  = clickX  / SCALE_X
    const worldY  = clickY  / SCALE_Y

    onJump({
      x: -(worldX * zoom) + viewportWidth  / 2,
      y: -(worldY * zoom) + viewportHeight / 2,
    })
  }

  return (
    <div style={{
      position:        'absolute',
      bottom:          16,
      right:           16,
      zIndex:          40,
      backgroundColor: '#F5F5F0',
      border:          '1px solid #E5E0D8',
      borderRadius:    8,
      overflow:        'hidden',
      boxShadow:       '0 2px 12px rgba(0,0,0,0.08)',
    }}>
      {/* Label */}
      <div style={{
        padding:         '4px 8px',
        borderBottom:    '1px solid #E5E0D8',
        backgroundColor: '#FAFAF8',
      }}>
        <span style={{
          fontSize:      9,
          fontWeight:    700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color:         '#A8A098',
        }}>
          Overview
        </span>
      </div>

      {/* SVG map */}
      <svg
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        style={{ display: 'block', cursor: 'crosshair' }}
        onClick={handleClick}
      >
        {/* Stage lane backgrounds */}
        {(['main', 'workshop'] as const).map(stage => (
          <rect
            key={stage}
            x={0}
            y={STAGE_Y[stage] * SCALE_Y}
            width={MAP_WIDTH}
            height={STAGE_HEIGHT['headliner'] * SCALE_Y}
            fill={stage === 'main' ? '#E07B5418' : '#7BAE8418'}
          />
        ))}

        {/* Talk blocks */}
        {visibleTalks.map(talk => {
          const pos   = calculatePosition(talk)
          const color = TAG_COLORS[talk.tag]
          return (
            <rect
              key={talk.id}
              x={pos.left   * SCALE_X}
              y={pos.top    * SCALE_Y}
              width={Math.max(pos.width  * SCALE_X, 2)}
              height={Math.max(pos.height * SCALE_Y, 3)}
              fill={color}
              rx={1}
              opacity={0.8}
            />
          )
        })}

        {/* Viewport rectangle */}
        <rect
          x={Math.max(0, vpX)}
          y={Math.max(0, vpY)}
          width={Math.min(vpW, MAP_WIDTH)}
          height={Math.min(vpH, MAP_HEIGHT)}
          fill="rgba(255,255,255,0.15)"
          stroke="#1F1F1F"
          strokeWidth={1}
          rx={1}
        />
      </svg>
    </div>
  )
}