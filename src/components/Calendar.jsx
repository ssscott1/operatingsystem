import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'

const API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY
const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID

export default function Calendar() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastSync, setLastSync] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    setLoading(true)
    setError(null)

    if (!API_KEY || !CALENDAR_ID) {
      setError('Google Calendar not configured')
      setLoading(false)
      return
    }

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()

    try {
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${startOfDay}&timeMax=${endOfDay}&singleEvents=true&orderBy=startTime`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setEvents(data.items || [])
      setLastSync(new Date())
    } catch (e) {
      setError('Unable to load calendar events')
    }
    setLoading(false)
  }

  function formatEventTime(event) {
    if (event.start.dateTime) {
      return format(parseISO(event.start.dateTime), 'HH:mm')
    }
    return 'All day'
  }

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
          📅 Today's Calendar
        </h2>
        <button
          onClick={fetchEvents}
          className="btn-ghost"
          style={{ fontSize: '0.75rem', padding: '5px 10px' }}
        >
          ↻ Sync
        </button>
      </div>

      {loading && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading events…</p>}

      {error && !loading && (
        <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {error === 'Google Calendar not configured'
              ? '📅 Add your Google Calendar API key and Calendar ID to see events here.'
              : '⚠️ Calendar unavailable — check your API key.'}
          </p>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '12px 0', textAlign: 'center' }}>
          Nothing scheduled — a blank canvas 🎨
        </p>
      )}

      {!loading && !error && events.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {events.map((event) => (
            <div
              key={event.id}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'var(--bg-secondary)',
                alignItems: 'flex-start',
              }}
            >
              <span
                className="font-mono"
                style={{ fontSize: '0.8rem', color: 'var(--accent)', flexShrink: 0, marginTop: '2px', minWidth: '44px' }}
              >
                {formatEventTime(event)}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {event.summary || 'Untitled event'}
                </div>
                {event.location && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📍 {event.location}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {lastSync && !loading && (
        <div style={{ marginTop: '10px', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
          Last sync: {format(lastSync, 'HH:mm')}
        </div>
      )}
    </div>
  )
}
