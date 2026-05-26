import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function TodoList({ user }) {
  const [tab, setTab] = useState('daily')
  const [todos, setTodos] = useState([])
  const [newText, setNewText] = useState('')
  const [loading, setLoading] = useState(true)
  const inputRef = useRef(null)

  useEffect(() => {
    fetchTodos()
  }, [user.id])

  async function fetchTodos() {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('completed', { ascending: true })
      .order('created_at', { ascending: false })
    if (!error) setTodos(data || [])
    setLoading(false)
  }

  async function addTodo() {
    const text = newText.trim()
    if (!text) return
    setNewText('')

    // Optimistic add with a temp id
    const tempId = `temp-${Date.now()}`
    const tempTodo = { id: tempId, user_id: user.id, text, category: tab, completed: false, created_at: new Date().toISOString() }
    setTodos((prev) => [tempTodo, ...prev])

    const { data, error } = await supabase
      .from('todos')
      .insert({ user_id: user.id, text, category: tab, completed: false })
      .select()
      .single()

    if (error) {
      toast.error('Failed to add item')
      setTodos((prev) => prev.filter((t) => t.id !== tempId))
    } else {
      setTodos((prev) => prev.map((t) => (t.id === tempId ? data : t)))
    }
  }

  async function toggleTodo(id, completed) {
    // Optimistic update — flip immediately in UI
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t)))

    const { error } = await supabase
      .from('todos')
      .update({ completed: !completed })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update')
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)))
    }
  }

  async function deleteTodo(id) {
    // Optimistic remove
    setTodos((prev) => prev.filter((t) => t.id !== id))

    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete')
      fetchTodos()
    }
  }

  const filtered = todos.filter((t) => t.category === tab)
  const active = filtered.filter((t) => !t.completed)
  const done = filtered.filter((t) => t.completed)

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 className="widget-title">✅ To-Do List</h2>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '3px' }}>
          {['daily', 'weekly'].map((t) => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); addTodo() }}
        style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}
      >
        <input
          ref={inputRef}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder={`Add a ${tab} task…`}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '10px 18px' }}>
          Add
        </button>
      </form>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '8px 0' }}>Loading…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {active.length === 0 && done.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '20px 0', textAlign: 'center' }}>
              No {tab} tasks yet — add one above ✨
            </p>
          )}

          {active.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
          ))}

          {done.length > 0 && (
            <>
              {active.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {done.length} completed
                  </span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                </div>
              )}
              {done.map((todo) => (
                <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
              ))}
            </>
          )}
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{ marginTop: '14px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {done.length} of {filtered.length} complete
        </div>
      )}
    </div>
  )
}

function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div
      className="fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: '8px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        opacity: todo.completed ? 0.6 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id, todo.completed)}
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '6px',
          border: `2px solid ${todo.completed ? 'var(--green)' : 'var(--border-color)'}`,
          background: todo.completed ? 'var(--green)' : 'transparent',
          cursor: 'pointer',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
        }}
        aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {todo.completed && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4.5L4 7.5L10 1" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Text */}
      <span
        style={{
          flex: 1,
          fontSize: '0.9rem',
          color: 'var(--text-primary)',
          textDecoration: todo.completed ? 'line-through' : 'none',
          transition: 'text-decoration 0.15s ease',
          wordBreak: 'break-word',
        }}
      >
        {todo.text}
      </span>

      {/* Delete — always visible */}
      <button
        onClick={() => onDelete(todo.id)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          padding: '4px 6px',
          borderRadius: '5px',
          fontSize: '0.85rem',
          lineHeight: 1,
          flexShrink: 0,
          transition: 'color 0.15s, background 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
        title="Delete"
        aria-label="Delete task"
      >
        ✕
      </button>
    </div>
  )
}
