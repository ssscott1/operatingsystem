import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import ThemeToggle from './ThemeToggle'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning ☀️'
  if (h < 17) return 'Good afternoon 🌤️'
  return 'Good evening 🌙'
}

export default function Header({ signOut, theme, toggleTheme }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px' }}>
        <div
          className="font-mono"
          style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: 'var(--accent)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          {format(now, 'HH:mm')}
        </div>
        <div>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              fontWeight: '500',
            }}
          >
            {format(now, 'EEEE, d MMMM yyyy')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {getGreeting()}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ThemeToggle theme={theme} toggle={toggleTheme} />
        <button
          onClick={signOut}
          className="btn-ghost"
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
