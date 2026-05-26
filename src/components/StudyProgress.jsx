import { studyProgram } from '../lib/studyConfig'

const STATUS_ICONS = {
  complete: '✅',
  current: '📖',
  upcoming: '⬜',
}

export default function StudyProgress() {
  const { name, units } = studyProgram
  const completed = units.filter((u) => u.status === 'complete').length
  const total = units.length
  const pct = Math.round((completed / total) * 100)

  return (
    <div className="card" style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
        🎓 Study Progress
      </h2>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{name}</p>

      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {completed} of {total} units complete
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent)' }}>{pct}%</span>
        </div>
        <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: 'linear-gradient(90deg, var(--accent), #fbbf24)',
              borderRadius: '4px',
              transition: 'width 0.6s ease',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {units.map((unit) => (
          <div
            key={unit.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              background: unit.status === 'current' ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
              border: unit.status === 'current' ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
            }}
          >
            <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}>{STATUS_ICONS[unit.status]}</span>
            <div style={{ flex: 1 }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  color: unit.status === 'upcoming' ? 'var(--text-muted)' : 'var(--text-primary)',
                  fontWeight: unit.status === 'current' ? '600' : '400',
                }}
              >
                Unit {unit.id}: {unit.name}
              </span>
              {unit.status === 'current' && (
                <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: '2px' }}>← In progress</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
