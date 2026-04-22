import type { Talk, Priority } from '../types'
import { minutesToLabel } from '../utils/coordinates'
import { TAG_COLORS, TAG_LABELS } from '../constants'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TalkDetailProps {
  talk: Talk
  onClose: () => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_LABELS: Record<Priority, string> = {
  headliner: 'Headliner',
  main_act:  'Main Act',
  support:   'Support',
}

// ─── Static styles ────────────────────────────────────────────────────────────

const styles = {
  container: {
    position:        'absolute',
    top:             0,
    right:           0,
    width:           340,
    height:          '100%',
    backgroundColor: '#FFFFFF',
    borderLeft:      '1px solid #E5E0D8',
    zIndex:          30,
    display:         'flex',
    flexDirection:   'column',
    animation:       'slideIn 0.2s ease-out',
  },
  closeButton: {
    position:       'absolute',
    top:            12,
    right:          12,
    width:          28,
    height:         28,
    borderRadius:   '50%',
    background:     'rgba(255,255,255,0.2)',
    border:         'none',
    color:          '#fff',
    cursor:         'pointer',
    fontSize:       16,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
  },
  priorityBadge: {
    display:         'inline-flex',
    alignItems:      'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius:    4,
    padding:         '2px 8px',
    marginBottom:    10,
  },
  priorityBadgeText: {
    fontSize:      10,
    fontWeight:    700,
    color:         '#fff',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  speakerName: {
    fontSize:   18,
    fontWeight: 800,
    color:      '#fff',
    margin:     '0 0 4px',
    lineHeight: 1.2,
  },
  timeLabel: {
    fontSize: 12,
    color:    'rgba(255,255,255,0.8)',
    margin:   0,
  },
  body: {
    flex:          1,
    overflowY:     'auto',
    padding:       '20px',
    display:       'flex',
    flexDirection: 'column',
    gap:           20,
  },
  sectionLabel: {
    fontSize:      10,
    fontWeight:    700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color:         '#A8A098',
    marginBottom:  6,
  },
  talkTitle: {
    fontSize:   15,
    fontWeight: 700,
    color:      '#1F1F1F',
    margin:     0,
    lineHeight: 1.4,
  },
  bodyText: {
    fontSize:   13,
    color:      '#4B4B4B',
    lineHeight: 1.7,
    margin:     0,
  },
  trackDot: {
    width:        8,
    height:       8,
    borderRadius: '50%',
  },
  youtubeLink: {
    fontSize:       12,
    fontWeight:     600,
    color:          '#CC0000',
    textDecoration: 'none',
  },
} satisfies Record<string, React.CSSProperties>

// ─── Dynamic style helpers ────────────────────────────────────────────────────

function getHeaderStyle(color: string): React.CSSProperties {
  return {
    backgroundColor: color,
    padding:         '24px 20px 20px',
    position:        'relative',
  }
}

function getTrackBadgeStyle(color: string): React.CSSProperties {
  return {
    display:         'inline-flex',
    alignItems:      'center',
    gap:             6,
    backgroundColor: color + '18',
    border:          `1px solid ${color}44`,
    borderRadius:    4,
    padding:         '4px 10px',
  }
}

function getTrackLabelStyle(color: string): React.CSSProperties {
  return {
    fontSize:   12,
    fontWeight: 600,
    color,
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TalkDetail({ talk, onClose }: TalkDetailProps) {
  const color   = TAG_COLORS[talk.tag]
  const endTime = talk.startTime + talk.duration

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={getHeaderStyle(color)}>
        <button onClick={onClose} style={styles.closeButton}>
          x
        </button>

        <div style={styles.priorityBadge}>
          <span style={styles.priorityBadgeText}>
            {PRIORITY_LABELS[talk.priority]}
          </span>
        </div>

        <h2 style={styles.speakerName}>
          {talk.speaker}
        </h2>

        <p style={styles.timeLabel}>
          {minutesToLabel(talk.startTime)} — {minutesToLabel(endTime)} · {talk.duration} min
        </p>
      </div>

      {/* ── Body ── */}
      <div style={styles.body}>

        {/* Title */}
        <div>
          <p style={styles.sectionLabel}>Talk</p>
          <h3 style={styles.talkTitle}>{talk.title}</h3>
        </div>

        {/* Description */}
        <div>
          <p style={styles.sectionLabel}>About</p>
          <p style={styles.bodyText}>{talk.description}</p>
        </div>

        {/* Bio */}
        <div>
          <p style={styles.sectionLabel}>Speaker</p>
          <p style={styles.bodyText}>{talk.bio}</p>
        </div>

        {/* Track */}
        <div>
          <p style={styles.sectionLabel}>Track</p>
          <div style={getTrackBadgeStyle(color)}>
            <div style={{ ...styles.trackDot, backgroundColor: color }} />
            <span style={getTrackLabelStyle(color)}>
              {TAG_LABELS[talk.tag]}
            </span>
          </div>
        </div>

        {/* YouTube */}
        {talk.youtubeId && (
          <div>
            <p style={styles.sectionLabel}>Watch</p>
            <a
              href={`https://www.youtube.com/watch?v=${talk.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.youtubeLink}
            >
              Watch on YouTube
            </a>
          </div>
        )}

      </div>
    </div>
  )
}