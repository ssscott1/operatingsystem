import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { getDailyPrompt } from '../lib/prompts'

const TODAY = format(new Date(), 'yyyy-MM-dd')
const PROMPT = getDailyPrompt()

export default function Journal({ user }) {
  const [entry, setEntry] = useState('')
  const [status, setStatus] = useState('idle') // idle | saving | saved
  const timerRef = useRef(null)
  const initialised = useRef(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('journal_entries')
        .select('entry')
        .eq('user_id', user.id)
        .eq('date', TODAY)
        .single()
      if (data) setEntry(data.entry || '')
      initialised.current = true
    }
    load()
  }, [user.id])

  function handleChange(e) {
    if (!initialised.current) return
    setEntry(e.target.value)
    setStatus('saving')
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => save(e.target.value), 2000)
  }

  async function save(text) {
    const { error } = await supabase.from('journal_entries').upsert(
      { user_id: user.id, date: TODAY, prompt: PROMPT, entry: text },
      { onConflict: 'user_id,date' }
    )
    setStatus(error ? 'idle' : 'saved')
    if (!error) setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>📝 Daily Journal</h2>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '60px', textAlign: 'right' }}>
          {status === 'saving' && <span className="saving-dot">saving…</span>}
          {status === 'saved' && <span style={{ color: 'var(--green)' }}>Saved ✓</span>}
        </div>
      </div>

      <div
        style={{
          background: 'var(--accent-subtle)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '8px',
          padding: '12px 14px',
          marginBottom: '14px',
        }}
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--accent)', fontWeight: '500', lineHeight: '1.5' }}>
          {PROMPT}
        </p>
      </div>

      <textarea
        value={entry}
        onChange={handleChange}
        placeholder="Write freely — this is just for you…"
        rows={6}
        style={{
          resize: 'vertical',
          lineHeight: '1.7',
          fontSize: '0.9rem',
        }}
      />
    </div>
  )
}
