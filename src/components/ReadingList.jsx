import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const STATUSES = [
  { key: 'reading', label: '📖 Reading' },
  { key: 'want_to_read', label: '🔖 Want to Read' },
  { key: 'finished', label: '✅ Finished' },
]

export default function ReadingList({ user }) {
  const [books, setBooks] = useState([])
  const [tab, setTab] = useState('reading')
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')

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

  async function addBook() {
    if (!title.trim()) return
    const { error } = await supabase.from('reading_list').insert({
      user_id: user.id,
      title: title.trim(),
      author: author.trim() || null,
      status: tab,
    })
    if (error) { toast.error('Failed to add book'); return }
    setTitle('')
    setAuthor('')
    fetchBooks()
  }

  async function updateStatus(id, status) {
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

  const filtered = books.filter((b) => b.status === tab)

  return (
    <div className="card" style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '14px' }}>
        📚 Reading List
      </h2>

      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '3px', marginBottom: '14px' }}>
        {STATUSES.map((s) => (
          <button key={s.key} className={`tab-btn ${tab === s.key ? 'active' : ''}`} onClick={() => setTab(s.key)} style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem' }}>
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); addBook() }} style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book title…" />
        <div style={{ display: 'flex', gap: '6px' }}>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author (optional)" style={{ flex: 1 }} />
          <button type="submit" className="btn-primary" style={{ padding: '10px 14px' }}>Add</button>
        </div>
      </form>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '12px 0' }}>
          No books here yet
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filtered.map((book) => (
            <BookItem key={book.id} book={book} onUpdateStatus={updateStatus} onDelete={deleteBook} />
          ))}
        </div>
      )}
    </div>
  )
}

function BookItem({ book, onUpdateStatus, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const other = STATUSES.filter((s) => s.key !== book.status)

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
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {book.title}
        </div>
        {book.author && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>{book.author}</div>
        )}
      </div>

      {hovered && (
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          {other.map((s) => (
            <button
              key={s.key}
              onClick={() => onUpdateStatus(book.id, s.key)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '3px 7px',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
              title={`Move to ${s.label}`}
            >
              → {s.label.split(' ')[0]}
            </button>
          ))}
          <button
            onClick={() => onDelete(book.id)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '0 2px' }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
