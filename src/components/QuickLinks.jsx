const LINKS = [
  { label: 'realestate.com.au', url: 'https://www.realestate.com.au', icon: '🏠' },
  { label: 'realcommercial.com.au', url: 'https://www.realcommercial.com.au', icon: '🏢' },
  { label: 'afr.com', url: 'https://www.afr.com', icon: '📰' },
  { label: 'news.com.au', url: 'https://www.news.com.au', icon: '📡' },
]

export default function QuickLinks() {
  return (
    <div className="card" style={{ padding: '20px' }}>
      <h2 className="widget-title" style={{ marginBottom: '14px' }}>🔗 Quick Links</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {LINKS.map(({ label, url, icon }) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.color = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{icon}</span>
            <span style={{ flex: 1 }}>{label}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}
