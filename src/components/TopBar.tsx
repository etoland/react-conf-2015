import type { Tag, Day } from '../types'
import { TAG_COLORS, TAG_LABELS } from '../constants'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TopBarProps {
  onMyCardClick: () => void
  showCard: boolean
  activeTag: string | null
  onTagClick: (tag: string) => void
  activeDay: Day
  onDayChange: (day: Day) => void
}

// ─── Static styles ────────────────────────────────────────────────────────────

const styles = {
  tagDot: {
    width:        8,
    height:       8,
    borderRadius: '50%',
    flexShrink:   0,
  },
  clearButton: {
    fontSize:       11,
    color:          '#9CA3AF',
    background:     'none',
    border:         'none',
    cursor:         'pointer',
    padding:        '4px 6px',
    textDecoration: 'underline',
  },
} satisfies Record<string, React.CSSProperties>

// ─── Dynamic style helpers ────────────────────────────────────────────────────

function getTagButtonStyle(
  color: string,
  isActive: boolean,
  isDimmed: boolean,
): React.CSSProperties {
  return {
    display:         'flex',
    alignItems:      'center',
    gap:             6,
    padding:         '4px 10px',
    borderRadius:    20,
    border:          `1px solid ${isActive ? color : 'transparent'}`,
    backgroundColor: isActive ? color + '18' : 'transparent',
    opacity:         isDimmed ? 0.35 : 1,
    cursor:          'pointer',
    transition:      'all 0.15s ease',
  }
}

function getTagLabelStyle(color: string, isActive: boolean): React.CSSProperties {
  return {
    fontSize:   11,
    fontWeight: isActive ? 700 : 500,
    color:      isActive ? color : '#6B7280',
    whiteSpace: 'nowrap',
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TopBar({
  onMyCardClick,
  showCard,
  activeTag,
  onTagClick,
  activeDay,
  onDayChange,
}: TopBarProps) {
  return (
    <div className="h-12 w-full flex items-center justify-between px-6 bg-white border-b border-gray-200 shrink-0 z-20">

      {/* Left — conference name + day switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-widest uppercase text-gray-800">
            React Conf
          </span>
          <span className="text-xs text-gray-400 tracking-widest uppercase">
            2015
          </span>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          {(['day1', 'day2'] as Day[]).map(day => (
            <button
              key={day}
              onClick={() => onDayChange(day)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeDay === day
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {day === 'day1' ? 'Jan 28' : 'Jan 29'}
            </button>
          ))}
        </div>
      </div>

      {/* Centre — clickable tag legend */}
      <div className="flex items-center gap-2">
        {(Object.keys(TAG_LABELS) as Tag[]).map(tag => {
          const isActive = activeTag === tag
          const isDimmed = activeTag !== null && !isActive
          const color    = TAG_COLORS[tag]
          return (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              style={getTagButtonStyle(color, isActive, isDimmed)}
            >
              <div style={{ ...styles.tagDot, backgroundColor: color }} />
              <span style={getTagLabelStyle(color, isActive)}>
                {TAG_LABELS[tag]}
              </span>
            </button>
          )
        })}

        {activeTag && (
          <button
            onClick={() => onTagClick(activeTag)}
            style={styles.clearButton}
          >
            clear
          </button>
        )}
      </div>

      {/* Right — my card button */}
      <button
        onClick={onMyCardClick}
        className={`text-xs font-medium tracking-wide uppercase px-3 py-1.5 rounded transition-colors border ${
          showCard
            ? 'bg-gray-900 text-white border-gray-900'
            : 'text-gray-500 hover:text-gray-900 border-gray-200 hover:border-gray-400'
        }`}
      >
        My Card
      </button>

    </div>
  )
}