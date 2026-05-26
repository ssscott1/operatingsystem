import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { supabase } from '../lib/supabase'
import { getDailyPrompt } from '../lib/prompts'
import toast from 'react-hot-toast'

const TODAY = format(new Date(), 'yyyy-MM-dd')
const PROMPT = getDailyPrompt()

export default function Journal({ user }) {
  const [entry, setEntry] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [past, setPast] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [loadingPast, setLoadingPast] = useState(true)
  const [initialised, setInitialised] = useState(false)

  useEffect(() => {
    loadToday()
    loadPast()
  }, [user.id])

  async function loadToday() {
    const { data } = await supabase
      .from('journal_entries')
      .select('entry, created_at')
      .eq('user_id', user.id)
      .eq('date', TODAY)
      .single()
    if (data) {
      setEntry(data.entry || '')
      setSavedAt(data.created_at)
    }
    setInitialised(true)
  }

  async function loadPast() {
    const { data } = await supabase
      .from('journal_entries')
      .select('id, date, prompt, entry, created_at')
      .eq('user_id', user.id)
      .neq('date', TODAY)
      .order('date', { ascending: false })
      .limit(20)
    setPast(data || [])
    setLoadingPast(false)
  }

  async function saveEntry() {
    if (!entry.trim()) { toast.error('Write something first'); return }
    setSaving(true)
    const { error } = await supabase.from('journal_entries').upsert(
      { user_id: user.id, date: TODAY, prompt: PROMPT, entry: entry.trim() },
      { onConflict: 'user_id,date' }
    )
    setSaving(false)
    if (error) {
      toast.error('Failed to save entry')
    } else {
      const now = new Date().toISOString()
      setSavedAt(now)
      toast.success('Journal entry saved')
      loadPast()
    }
  }

  return (
    <div className="card" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <h2 className="widget-title">📝 Daily Journal</h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {format(new Date(), 'EEEE, d MMMM yyyy')}
          </p>
        </div>
        {savedAt && (
          <span style={{ fontSize: '0.72rem', color: 'var(--green)', background: 'rgba(34,197,94,0.1)', padding: '3px 9px', borderRadius: '20px' }}>
            ✓ Saved {format(parseISO(savedAt), 'HH:mm')}
          </span>
        )}
      </div>

      {/* Daily prompt */}
      <div style={{
        background: 'var(--accent-subtle)',
        border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: '10px',
        padding: '12px 14px',
        marginBottom: '12px',
      }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--accent)', fontWeight: '500', lineHeight: '1.5' }}>
          {PROMPT}
        </p>
      </div>

      {/* Textarea */}
      <textarea
        value={entry}
        onChange={(e) => { if (initialised) setEntry(e.target.value) }}
        placeholder="Write freely — this is just for you…"
        rows={6}
        style={{ resize: 'vertical', lineHeight: '1.7', fontSize: '0.9rem', marginBottom: '10px' }}
      />

      {/* Save button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={saveEntry}
          disabled={saving}
          className="btn-primary"
          style={{ padding: '9px 22px' }}
        >
          {saving ? 'Saving…' : '💾 Save Entry'}
        </button>
      </div>

      {/* Past entries */}
      <div style={{ marginTop: '24px' }}>
        <div className="section-label" style={{ marginBottom: '10px' }}>Past Entries</div>

        {loadingPast ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading…</p>
        ) : past.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No past entries yet — save today's entry to get started.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto' }}>
            {past.map((e) => (
              <PastEntry
                key={e.id}
                entry={e}
                isExpanded={expanded === e.id}
                onToggle={() => setExpanded(expanded === e.id ? null : e.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PastEntry({ entry, isExpanded, onToggle }) {
  const preview = entry.entry?.slice(0, 100)
  const hasMore = (entry.entry?.length || 0) > 100

  return (
    <div
      onClick={onToggle}
      style={{
        padding: '12px 14px',
        borderRadius: '8px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span className="font-mono" style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--accent)' }}>
          {format(parseISO(entry.date), 'EEE d MMM yyyy')}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{isExpanded ? '▲' : '▼'}</span>
      </div>

      {entry.prompt && (
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', fontStyle: 'italic' }}>
          {entry.prompt}
        </p>
      )}

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>
        {isExpanded ? entry.entry : preview}
        {!isExpanded && hasMore && <span style={{ color: 'var(--text-muted)' }}>…</span>}
      </p>
    </div>
  )
}
