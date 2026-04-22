import { minutesToLabel } from '../utils/coordinates'
import { STAGE_COLORS, STAGE_LABELS } from '../constants'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  zoom: number
  scrubberTime: number
  onZoomIn: () => void
  onZoomOut: () => void
  onScrub: (time: number) => void
  onResetView: () => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SHORTCUTS: [string, string][] = [
  ['Drag',         'Pan'],
  ['Scroll',       'Zoom'],
  ['+ / −',        'Zoom in/out'],
  ['Arrow keys',   'Pan'],
  ['Double-click', 'Focus talk'],
  ['Esc',          'Clear all'],
]

// ─── Static styles ────────────────────────────────────────────────────────────

const styles = {
  sectionLabel: {
    fontSize:      10,
    fontWeight:    700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color:         '#A8A098',
    marginBottom:  12,
  },
  resetButton: {
    width:           '100%',
    padding:         '7px 0',
    fontSize:        11,
    fontWeight:      600,
    color:           '#6B7280',
    backgroundColor: '#F5F5F0',
    border:          '1px solid #E5E0D8',
    borderRadius:    6,
    cursor:          'pointer',
    transition:      'all 0.15s',
  },
  shortcutsContainer: {
    marginTop: 'auto',
  },
  shortcutsLabel: {
    fontSize:      10,
    fontWeight:    700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color:         '#A8A098',
    marginBottom:  10,
  },
  shortcutsList: {
    display:       'flex',
    flexDirection: 'column',
    gap:           6,
  },
  shortcutRow: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  shortcutKey: {
    fontSize:        10,
    fontWeight:      600,
    color:           '#1F1F1F',
    backgroundColor: '#F0EDE8',
    padding:         '1px 5px',
    borderRadius:    3,
    fontFamily:      'monospace',
  },
  shortcutLabel: {
    fontSize: 10,
    color:    '#A8A098',
  },
} satisfies Record<string, React.CSSProperties>

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar({
  zoom,
  scrubberTime,
  onZoomIn,
  onZoomOut,
  onScrub,
  onResetView,
}: SidebarProps) {
  return (
    <div className="w-48 h-full bg-white border-r border-gray-200 flex flex-col px-4 py-6 gap-8 shrink-0 z-10">

      {/* Stages */}
      <div>
        <p style={styles.sectionLabel}>Stages</p>
        <div className="flex flex-col gap-2">
          {(Object.keys(STAGE_LABELS) as Array<keyof typeof STAGE_LABELS>).map(key => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: STAGE_COLORS[key] }}
              />
              <span className="text-xs text-gray-600">{STAGE_LABELS[key]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zoom */}
      <div>
        <p style={styles.sectionLabel}>Zoom</p>
        <div className="flex items-center gap-2">
          <button
            onClick={onZoomOut}
            className="w-7 h-7 rounded border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 text-sm transition-colors flex items-center justify-center"
          >
            −
          </button>
          <span className="text-xs text-gray-500 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="w-7 h-7 rounded border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 text-sm transition-colors flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      {/* Time scrubber */}
      <div>
        <p style={styles.sectionLabel}>Now</p>
        <input
          type="range"
          min={540}
          max={1080}
          value={scrubberTime}
          onChange={e => onScrub(Number(e.target.value))}
          className="w-full accent-red-500"
        />
        <p className="text-xs text-red-500 font-medium mt-2">
          {minutesToLabel(scrubberTime)}
        </p>
      </div>

      {/* Reset view */}
      <div>
        <button
          onClick={onResetView}
          style={styles.resetButton}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#1F1F1F'
            e.currentTarget.style.color       = '#1F1F1F'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#E5E0D8'
            e.currentTarget.style.color       = '#6B7280'
          }}
        >
          Reset View
        </button>
      </div>

      {/* Keyboard shortcuts */}
      <div style={styles.shortcutsContainer}>
        <p style={styles.shortcutsLabel}>Shortcuts</p>
        <div style={styles.shortcutsList}>
          {SHORTCUTS.map(([key, label]) => (
            <div key={key} style={styles.shortcutRow}>
              <span style={styles.shortcutKey}>{key}</span>
              <span style={styles.shortcutLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}