import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { supabase } from '../lib/supabase'

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'business_idea', label: '💡 Business Ideas' },
  { key: 'thought', label: '💭 Thoughts' },
  { key: 'idea', label: '🧠 Ideas' },
  { key: 'note', label: '📝 Notes' },
]

const CAT_COLORS = {
  business_idea: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', label: '💡 Idea' },
  thought: { bg: 'rgba(99,102,241,0.12)', text: '#818cf8', label: '💭 Thought' },
  idea: { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', label: '🧠 Idea' },
  note: { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8', label: '📝 Note' },
}

export default function TelegramNotes({ user }) {
  const [notes, setNotes] = useState([])
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotes()
  }, [user.id])

  async function fetchNotes() {
    const { data, error } = await supabase
      .from('telegram_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    if (!error) setNotes(data || [])
    setLoading(false)
  }

  const filtered = filter === 'all' ? notes : notes.filter((n) => n.category === filter)
  const displayed = filtered.slice(0, 10)

  return (
    <div className="card" style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '14px' }}>
        💬 Telegram Notes
      </h2>

      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setFilter(cat.key)}
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '500',
              cursor: 'pointer',
              border: filter === cat.key ? '1px solid var(--accent)' : '1px solid var(--border-color)',
              background: filter === cat.key ? 'var(--accent-subtle)' : 'transparent',
              color: filter === cat.key ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'all 0.15s',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading notes…</p>
      ) : displayed.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {notes.length === 0
              ? 'No Telegram notes yet. Set up your bot to start capturing ideas.'
              : 'No notes match this filter.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {displayed.map((note) => {
            const cat = CAT_COLORS[note.category] || CAT_COLORS.note
            const isExpanded = expanded === note.id
            const preview = note.content?.slice(0, 120)
            const hasMore = (note.content?.length || 0) > 120

            return (
              <div
                key={note.id}
                onClick={() => setExpanded(isExpanded ? null : note.id)}
                className="fade-in"
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  cursor: hasMore ? 'pointer' : 'default',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      padding: '2px 7px',
                      borderRadius: '20px',
                      background: cat.bg,
                      color: cat.text,
                    }}
                  >
                    {cat.label}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {format(parseISO(note.created_at), 'd MMM, HH:mm')}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {isExpanded ? note.content : preview}
                  {!isExpanded && hasMore && (
                    <span style={{ color: 'var(--text-muted)' }}>… <span style={{ color: 'var(--accent)' }}>read more</span></span>
                  )}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {notes.length === 0 && !loading && (
        <div style={{ marginTop: '14px', padding: '12px', background: 'var(--accent-subtle)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--accent)', lineHeight: '1.6' }}>
            <strong>Setup:</strong> Deploy the Telegram webhook (see <code>netlify/functions/telegram-webhook.js</code>), then send <code>/idea</code>, <code>/thought</code>, <code>/brain</code>, or <code>/note</code> to your bot.
          </p>
        </div>
      )}
    </div>
  )
}
