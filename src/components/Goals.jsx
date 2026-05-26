import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { key: 'health', label: '💪 Health' },
  { key: 'career', label: '💼 Career' },
  { key: 'financial', label: '💰 Financial' },
  { key: 'personal', label: '🧠 Personal' },
]

export default function Goals({ user }) {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [newGoalText, setNewGoalText] = useState({})

  useEffect(() => {
    fetchGoals()
  }, [user.id])

  async function fetchGoals() {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    if (!error) setGoals(data || [])
    setLoading(false)
  }

  async function addGoal(category) {
    const text = (newGoalText[category] || '').trim()
    if (!text) return
    setNewGoalText((prev) => ({ ...prev, [category]: '' }))
    const { error } = await supabase.from('goals').insert({
      user_id: user.id,
      text,
      category,
    })
    if (error) toast.error('Failed to add goal')
    else fetchGoals()
  }

  async function deleteGoal(id) {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (error) toast.error('Failed to delete goal')
    else setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  async function updateGoal(id, text) {
    const { error } = await supabase
      .from('goals')
      .update({ text, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) toast.error('Failed to save goal')
  }

  if (loading) return (
    <div className="card" style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: '600' }}>🎯 Goals</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '12px' }}>Loading…</p>
    </div>
  )

  return (
    <div className="card" style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>
        🎯 Goals
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {CATEGORIES.map(({ key, label }) => {
          const catGoals = goals.filter((g) => g.category === key)
          return (
            <div key={key}>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                {catGoals.map((goal) => (
                  <GoalItem key={goal.id} goal={goal} onDelete={deleteGoal} onUpdate={updateGoal} />
                ))}
                {catGoals.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                    No {key} goals yet
                  </p>
                )}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); addGoal(key) }}
                style={{ display: 'flex', gap: '6px' }}
              >
                <input
                  value={newGoalText[key] || ''}
                  onChange={(e) => setNewGoalText((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder="Add goal…"
                  style={{ flex: 1, fontSize: '0.85rem', padding: '7px 10px' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '7px 12px', fontSize: '1rem' }}>+</button>
              </form>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GoalItem({ goal, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(goal.text)
  const [hovered, setHovered] = useState(false)
  const timerRef = useRef(null)

  const save = useCallback(() => {
    const trimmed = text.trim()
    if (trimmed && trimmed !== goal.text) onUpdate(goal.id, trimmed)
    setEditing(false)
  }, [text, goal, onUpdate])

  const handleChange = (e) => {
    setText(e.target.value)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onUpdate(goal.id, e.target.value.trim()), 2000)
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '7px 10px',
        borderRadius: '6px',
        background: hovered ? 'var(--bg-secondary)' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      <span style={{ color: 'var(--accent)', fontSize: '0.7rem', flexShrink: 0 }}>▸</span>
      {editing ? (
        <input
          autoFocus
          value={text}
          onChange={handleChange}
          onBlur={save}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setText(goal.text); setEditing(false) } }}
          style={{ flex: 1, fontSize: '0.875rem', padding: '2px 6px' }}
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)', cursor: 'text' }}
        >
          {text}
        </span>
      )}
      <button
        onClick={() => onDelete(goal.id)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s',
          fontSize: '0.875rem',
          padding: '0 2px',
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  )
}
