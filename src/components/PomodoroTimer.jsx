import { useState, useEffect, useRef, useCallback } from 'react'

const MODES = {
  work: { label: 'Focus', duration: 25 * 60, color: 'var(--accent)' },
  short: { label: 'Short Break', duration: 5 * 60, color: 'var(--green)' },
  long: { label: 'Long Break', duration: 15 * 60, color: 'var(--blue)' },
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.5)
  } catch {}
}

export default function PomodoroTimer() {
  const [mode, setMode] = useState('work')
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef(null)

  const currentMode = MODES[mode]
  const total = currentMode.duration
  const pct = ((total - timeLeft) / total) * 100
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (pct / 100) * circumference

  const switchMode = useCallback((m) => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setMode(m)
    setTimeLeft(MODES[m].duration)
  }, [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            beep()
            if (mode === 'work') {
              setSessions((s) => {
                const next = s + 1
                switchMode(next % 4 === 0 ? 'long' : 'short')
                return next
              })
            } else {
              switchMode('work')
            }
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, mode, switchMode])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h2 className="widget-title">⏱ Pomodoro</h2>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          🔥 {sessions} session{sessions !== 1 ? 's' : ''} today
        </div>
      </div>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '3px', marginBottom: '20px' }}>
        {Object.entries(MODES).map(([key, { label }]) => (
          <button
            key={key}
            className={`tab-btn ${mode === key ? 'active' : ''}`}
            onClick={() => switchMode(key)}
            style={{ flex: 1, fontSize: '0.75rem' }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Circular timer */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative', width: '130px', height: '130px' }}>
          <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="65" cy="65" r={radius}
              fill="none"
              stroke="var(--bg-secondary)"
              strokeWidth="8"
            />
            <circle
              cx="65" cy="65" r={radius}
              fill="none"
              stroke={currentMode.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s ease' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              className="font-mono"
              style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}
            >
              {pad(minutes)}:{pad(seconds)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {currentMode.label}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-primary"
            onClick={() => setRunning((r) => !r)}
            style={{ padding: '8px 24px', minWidth: '90px' }}
          >
            {running ? '⏸ Pause' : '▶ Start'}
          </button>
          <button
            className="btn-ghost"
            onClick={() => switchMode(mode)}
            style={{ padding: '8px 14px' }}
            title="Reset"
          >
            ↺
          </button>
        </div>

        {/* Session dots */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: i < (sessions % 4) ? 'var(--accent)' : 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
