import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function TodoList({ user }) {
  const [tab, setTab] = useState('daily')
  const [todos, setTodos] = useState([])
  const [newText, setNewText] = useState('')
  const [loading, setLoading] = useState(true)
  const inputRef = useRef(null)
  const channelRef = useRef(null)

  useEffect(() => {
    fetchTodos()
    const channel = supabase
      .channel('todos-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos', filter: `user_id=eq.${user.id}` }, () => {
        fetchTodos()
      })
      .subscribe()
    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [user.id])

  async function fetchTodos() {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('completed', { ascending: true })
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false })
    if (!error) setTodos(data || [])
    setLoading(false)
  }

  async function addTodo() {
    const text = newText.trim()
    if (!text) return
    setNewText('')
    const { error } = await supabase.from('todos').insert({
      user_id: user.id,
      text,
      category: tab,
      completed: false,
    })
    if (error) toast.error('Failed to add item')
  }

  async function toggleTodo(id, completed) {
    const { error } = await supabase
      .from('todos')
      .update({ completed: !completed })
      .eq('id', id)
    if (error) toast.error('Failed to update')
  }

  async function deleteTodo(id) {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (error) toast.error('Failed to delete')
  }

  const filtered = todos.filter((t) => t.category === tab)
  const active = filtered.filter((t) => !t.completed)
  const done = filtered.filter((t) => t.completed)

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
          ✅ To-Do List
        </h2>
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
        <button
          type="submit"
          className="btn-primary"
          style={{ whiteSpace: 'nowrap', padding: '10px 16px' }}
        >
          Add
        </button>
      </form>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '8px 0' }}>Loading…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {active.length === 0 && done.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '16px 0', textAlign: 'center' }}>
              No {tab} tasks yet — add one above ✨
            </p>
          )}
          {active.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
          ))}
          {done.length > 0 && (
            <>
              {active.length > 0 && (
                <div style={{ height: '1px', background: 'var(--border-color)', margin: '6px 0' }} />
              )}
              {done.map((todo) => (
                <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
              ))}
            </>
          )}
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {done.length} of {filtered.length} complete
        </div>
      )}
    </div>
  )
}

function TodoItem({ todo, onToggle, onDelete }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="fade-in"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: '8px',
        background: hovered ? 'var(--bg-secondary)' : 'transparent',
        transition: 'background 0.15s ease',
        opacity: todo.completed ? 0.55 : 1,
      }}
    >
      <button
        onClick={() => onToggle(todo.id, todo.completed)}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: `2px solid ${todo.completed ? 'var(--green)' : 'var(--border-color)'}`,
          background: todo.completed ? 'var(--green)' : 'transparent',
          cursor: 'pointer',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
      >
        {todo.completed && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <span
        style={{
          flex: 1,
          fontSize: '0.9rem',
          color: 'var(--text-primary)',
          textDecoration: todo.completed ? 'line-through' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        {todo.text}
      </span>

      <button
        onClick={() => onDelete(todo.id)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          padding: '2px',
          borderRadius: '4px',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s ease, color 0.15s ease',
          fontSize: '1rem',
          lineHeight: 1,
        }}
        title="Delete"
      >
        🗑
      </button>
    </div>
  )
}
