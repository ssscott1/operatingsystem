import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  want_to_read: { label: 'To Read', icon: '🔖', color: 'var(--accent)' },
  reading: { label: 'Reading', icon: '📖', color: 'var(--blue)' },
  finished: { label: 'Finished', icon: '✅', color: 'var(--green)' },
}

export default function ReadingList({ user }) {
  const [books, setBooks] = useState([])
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchBooks()
  }, [user.id])

  async function fetchBooks() {
    const { data, error } = await supabase
      .from('reading_list')
      .select('*')
      .eq('user_id', user.id)
      .order('date_added', { ascending: false })
    if (!error) setBooks(data || [])
    setLoading(false)
  }

  async function addBook(e) {
    e.preventDefault()
    if (!title.trim()) return
    const { error } = await supabase.from('reading_list').insert({
      user_id: user.id,
      title: title.trim(),
      author: author.trim() || null,
      status: 'want_to_read',
    })
    if (error) { toast.error('Failed to add'); return }
    setTitle('')
    setAuthor('')
    fetchBooks()
  }

  async function setStatus(id, status) {
    const updates = { status }
    if (status === 'finished') updates.date_finished = new Date().toISOString()
    const { error } = await supabase.from('reading_list').update(updates).eq('id', id)
    if (error) toast.error('Failed to update')
    else fetchBooks()
  }

  async function deleteBook(id) {
    const { error } = await supabase.from('reading_list').delete().eq('id', id)
    if (error) toast.error('Failed to delete')
    else setBooks((prev) => prev.filter((b) => b.id !== id))
  }

  const counts = {
    all: books.length,
    want_to_read: books.filter((b) => b.status === 'want_to_read').length,
    reading: books.filter((b) => b.status === 'reading').length,
    finished: books.filter((b) => b.status === 'finished').length,
  }
  const displayed = filter === 'all' ? books : books.filter((b) => b.status === filter)

  return (
    <div className="card" style={{ padding: '20px' }}>
      <h2 className="widget-title" style={{ marginBottom: '14px' }}>📚 Reading List</h2>

      {/* Add form */}
      <form onSubmit={addBook} style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book title…" />
        <div style={{ display: 'flex', gap: '6px' }}>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author (optional)" style={{ flex: 1 }} />
          <button type="submit" className="btn-primary" style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>+ Add</button>
        </div>
      </form>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {[['all', 'All'], ...Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label])].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: '500',
              cursor: 'pointer',
              border: filter === key ? '1.5px solid var(--accent)' : '1.5px solid var(--border-color)',
              background: filter === key ? 'var(--accent-subtle)' : 'transparent',
              color: filter === key ? 'var(--accent)' : 'var(--text-muted)',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'all 0.15s',
            }}
          >
            {label} {counts[key] > 0 && <span style={{ opacity: 0.7 }}>({counts[key]})</span>}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>
      ) : displayed.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '16px 0' }}>
          {books.length === 0 ? 'Add your first book above 📖' : 'No books in this category'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '320px', overflowY: 'auto' }}>
          {displayed.map((book) => (
            <BookRow key={book.id} book={book} onSetStatus={setStatus} onDelete={deleteBook} />
          ))}
        </div>
      )}
    </div>
  )
}

function BookRow({ book, onSetStatus, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const cfg = STATUS_CONFIG[book.status]
  const nextStatus = book.status === 'want_to_read' ? 'reading' : book.status === 'reading' ? 'finished' : null

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: '8px',
        background: hovered ? 'var(--bg-secondary)' : 'transparent',
        transition: 'background 0.15s',
        border: '1px solid transparent',
      }}
    >
      <span style={{ fontSize: '1rem', flexShrink: 0 }}>{cfg.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.875rem',
          fontWeight: '500',
          color: book.status === 'finished' ? 'var(--text-muted)' : 'var(--text-primary)',
          textDecoration: book.status === 'finished' ? 'line-through' : 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {book.title}
        </div>
        {book.author && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{book.author}</div>
        )}
      </div>

      {hovered && (
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          {nextStatus && (
            <button
              onClick={() => onSetStatus(book.id, nextStatus)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '5px',
                padding: '3px 8px',
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              → {STATUS_CONFIG[nextStatus].label}
            </button>
          )}
          <button
            onClick={() => onDelete(book.id)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', padding: '0 2px', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
