import { useState, useEffect } from 'react'

export default function NavHint() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading]   = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2500)
    const hideTimer = setTimeout(() => setVisible(false), 3200)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position:        'absolute',
      bottom:          110,
      left:            '50%',
      transform:       'translateX(-50%)',
      backgroundColor: 'rgba(31,31,31,0.85)',
      color:           '#fff',
      borderRadius:    8,
      padding:         '10px 16px',
      display:         'flex',
      alignItems:      'center',
      gap:             16,
      zIndex:          50,
      pointerEvents:   'none',
      opacity:         fading ? 0 : 1,
      transition:      'opacity 0.7s ease',
      whiteSpace:      'nowrap',
    }}>
      {[
        ['Drag', 'to pan'],
        ['Scroll', 'to zoom'],
        ['Double-click', 'to focus'],
      ].map(([key, label]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize:        11,
            fontWeight:      700,
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding:         '2px 7px',
            borderRadius:    4,
          }}>
            {key}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}