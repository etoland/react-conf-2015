import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { Connection } from '../types'
import { minutesToLabel } from '../utils/coordinates'
import { simulatedAttendees } from '../data/simulatedAttendees'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MyCardProps {
  linkedInUrl: string
  onLinkedInUrlChange: (url: string) => void
  connections: Connection[]
  onAddConnection: (connection: Connection) => void
  scrubberTime: number
}

// ─── Static styles ────────────────────────────────────────────────────────────

const styles = {
  container: {
    display:       'flex',
    flexDirection: 'column',
    height:        '100%',
    overflowY:     'auto',
  },
  header: {
    padding:      '20px 20px 16px',
    borderBottom: '1px solid #E5E0D8',
  },
  headerLabel: {
    fontSize:      10,
    fontWeight:    700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color:         '#A8A098',
    margin:        '0 0 4px',
  },
  headerSubtitle: {
    fontSize: 12,
    color:    '#6B7280',
    margin:   0,
  },
  qrSection: {
    padding:       '20px',
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'center',
    gap:           16,
    borderBottom:  '1px solid #E5E0D8',
  },
  qrWrapper: {
    padding:         16,
    backgroundColor: '#fff',
    borderRadius:    12,
    border:          '1px solid #E5E0D8',
    boxShadow:       '0 2px 12px rgba(0,0,0,0.06)',
  },
  qrUrlLabel: {
    fontSize:  11,
    color:     '#A8A098',
    textAlign: 'center',
    margin:    0,
  },
  editButton: {
    fontSize:     11,
    color:        '#6B7280',
    background:   'none',
    border:       '1px solid #E5E0D8',
    borderRadius: 4,
    padding:      '4px 10px',
    cursor:       'pointer',
  },
  qrPlaceholder: {
    width:           160,
    height:          160,
    backgroundColor: '#F5F5F0',
    borderRadius:    12,
    border:          '1px dashed #D1C9BC',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
  },
  qrPlaceholderText: {
    fontSize:  11,
    color:     '#A8A098',
    textAlign: 'center',
    padding:   '0 16px',
    margin:    0,
  },
  inputWrapper: {
    width:         '100%',
    display:       'flex',
    flexDirection: 'column',
    gap:           8,
  },
  input: {
    width:        '100%',
    padding:      '8px 10px',
    fontSize:     12,
    border:       '1px solid #D1C9BC',
    borderRadius: 6,
    outline:      'none',
    boxSizing:    'border-box',
  },
  connectionLog: {
    padding: '16px 20px',
    flex:    1,
  },
  connectionLogHeader: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   12,
  },
  connectionLogLabel: {
    fontSize:      10,
    fontWeight:    700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color:         '#A8A098',
    margin:        0,
  },
  connectionCount: {
    backgroundColor: '#1F1F1F',
    color:           '#fff',
    borderRadius:    10,
    padding:         '2px 8px',
    fontSize:        11,
    fontWeight:      700,
  },
  connectionList: {
    display:       'flex',
    flexDirection: 'column',
    gap:           8,
  },
  connectionItem: {
    display:         'flex',
    alignItems:      'center',
    gap:             10,
    padding:         '10px 12px',
    backgroundColor: '#fff',
    border:          '1px solid #E5E0D8',
    borderRadius:    8,
    textDecoration:  'none',
    transition:      'border-color 0.15s',
  },
  connectionAvatar: {
    width:           32,
    height:          32,
    borderRadius:    '50%',
    backgroundColor: '#E5E0D8',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    fontSize:        12,
    fontWeight:      700,
    color:           '#6B7280',
    flexShrink:      0,
  },
  connectionInfo: {
    flex:     1,
    minWidth: 0,
  },
  connectionName: {
    fontSize:     12,
    fontWeight:   600,
    color:        '#1F1F1F',
    margin:       0,
    whiteSpace:   'nowrap',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
  },
  connectionRole: {
    fontSize:     11,
    color:        '#6B7280',
    margin:       '1px 0 0',
    whiteSpace:   'nowrap',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
  },
  connectionTime: {
    fontSize:   10,
    color:      '#A8A098',
    margin:     0,
    flexShrink: 0,
  },
} satisfies Record<string, React.CSSProperties>

// ─── Dynamic style helpers ────────────────────────────────────────────────────

function getSaveButtonStyle(hasInput: boolean): React.CSSProperties {
  return {
    padding:         '8px',
    backgroundColor: hasInput ? '#1F1F1F' : '#E5E0D8',
    color:           hasInput ? '#fff' : '#A8A098',
    border:          'none',
    borderRadius:    6,
    fontSize:        12,
    fontWeight:      600,
    cursor:          hasInput ? 'pointer' : 'default',
  }
}

function getSimulateButtonStyle(justAdded: boolean): React.CSSProperties {
  return {
    width:           '100%',
    padding:         '8px',
    backgroundColor: justAdded ? '#D1FAE5' : '#F5F5F0',
    color:           justAdded ? '#065F46' : '#6B7280',
    border:          `1px solid ${justAdded ? '#6EE7B7' : '#E5E0D8'}`,
    borderRadius:    6,
    fontSize:        11,
    fontWeight:      600,
    cursor:          'pointer',
    marginBottom:    12,
    transition:      'all 0.3s ease',
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyCard({
  linkedInUrl,
  onLinkedInUrlChange,
  connections,
  onAddConnection,
  scrubberTime,
}: MyCardProps) {
  const [inputValue, setInputValue] = useState(linkedInUrl)
  const [isEditing, setIsEditing]   = useState(!linkedInUrl)
  const [justAdded, setJustAdded]   = useState(false)

  const handleSave = () => {
    onLinkedInUrlChange(inputValue)
    setIsEditing(false)
  }

  const handleSimulateScan = () => {
    const existingNames = new Set(connections.map(c => c.name))
    const available     = simulatedAttendees.filter(n => !existingNames.has(n.name))
    if (available.length === 0) return

    const pick = available[Math.floor(Math.random() * available.length)]
    onAddConnection({
      id:          `c-${Date.now()}`,
      name:        pick.name,
      role:        pick.role,
      company:     pick.company,
      linkedInUrl: `https://linkedin.com/in/${pick.name.toLowerCase().replace(' ', '')}`,
      scannedAt:   scrubberTime,
    })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  return (
    <div style={styles.container}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <p style={styles.headerLabel}>My Card</p>
        <p style={styles.headerSubtitle}>
          Share your LinkedIn with anyone at the conference
        </p>
      </div>

      {/* ── QR Code ── */}
      <div style={styles.qrSection}>
        {linkedInUrl ? (
          <>
            <div style={styles.qrWrapper}>
              <QRCodeSVG
                value={linkedInUrl}
                size={160}
                fgColor="#1F1F1F"
                bgColor="#ffffff"
                level="M"
              />
            </div>
            <p style={styles.qrUrlLabel}>
              {linkedInUrl.replace('https://', '')}
            </p>
            <button onClick={() => setIsEditing(true)} style={styles.editButton}>
              Edit URL
            </button>
          </>
        ) : (
          <div style={styles.qrPlaceholder}>
            <p style={styles.qrPlaceholderText}>
              Enter your LinkedIn URL to generate a QR code
            </p>
          </div>
        )}

        {(isEditing || !linkedInUrl) && (
          <div style={styles.inputWrapper}>
            <input
              type="text"
              placeholder="https://linkedin.com/in/yourname"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              style={styles.input}
            />
            <button
              onClick={handleSave}
              disabled={!inputValue}
              style={getSaveButtonStyle(!!inputValue)}
            >
              Save & Generate QR
            </button>
          </div>
        )}
      </div>

      {/* ── Connection log ── */}
      <div style={styles.connectionLog}>
        <div style={styles.connectionLogHeader}>
          <p style={styles.connectionLogLabel}>Connections Today</p>
          <div style={styles.connectionCount}>{connections.length}</div>
        </div>

        <button
          onClick={handleSimulateScan}
          style={getSimulateButtonStyle(justAdded)}
        >
          {justAdded ? 'Connection added!' : '+ Simulate a scan'}
        </button>

        <div style={styles.connectionList}>
          {[...connections].reverse().map(c => (
            <a
              key={c.id}
              href={c.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.connectionItem}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1F1F1F' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E0D8' }}
            >
              <div style={styles.connectionAvatar}>
                {c.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div style={styles.connectionInfo}>
                <p style={styles.connectionName}>{c.name}</p>
                <p style={styles.connectionRole}>{c.role} @ {c.company}</p>
              </div>
              <p style={styles.connectionTime}>{minutesToLabel(c.scannedAt)}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}