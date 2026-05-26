import { useState, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function HabitTracker({ user }) {
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
  const [habits, setHabits] = useState({ trained_gym: false, drank_alcohol: false })
  const [gymStreak, setGymStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHabits()
  }, [user.id])

  async function fetchHabits() {
    const { data } = await supabase
      .from('habit_log')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', yesterday)
      .single()
    if (data) setHabits({ trained_gym: data.trained_gym, drank_alcohol: data.drank_alcohol })

    const { data: streakData } = await supabase
      .from('habit_log')
      .select('date, trained_gym')
      .eq('user_id', user.id)
      .eq('trained_gym', true)
      .order('date', { ascending: false })
      .limit(60)

    if (streakData) {
      let streak = 0
      let cursor = subDays(new Date(), 1)
      for (const row of streakData) {
        if (format(cursor, 'yyyy-MM-dd') === row.date) {
          streak++
          cursor = subDays(cursor, 1)
        } else break
      }
      setGymStreak(streak)
    }
    setLoading(false)
  }

  async function toggleHabit(field, value) {
    setHabits((prev) => ({ ...prev, [field]: value }))
    const { error } = await supabase.from('habit_log').upsert(
      { user_id: user.id, date: yesterday, ...habits, [field]: value },
      { onConflict: 'user_id,date' }
    )
    if (error) {
      toast.error('Failed to save')
      setHabits((prev) => ({ ...prev, [field]: !value }))
    }
  }

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
          📊 Habit Tracker
        </h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Yesterday's check-in</span>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <HabitToggle
            label="🏋️ Trained at the gym"
            checked={habits.trained_gym}
            onChange={(v) => toggleHabit('trained_gym', v)}
            colorClass="green"
            streak={gymStreak}
          />
          <HabitToggle
            label="🍷 Drank alcohol"
            checked={habits.drank_alcohol}
            onChange={(v) => toggleHabit('drank_alcohol', v)}
            colorClass="amber"
          />
        </div>
      )}
    </div>
  )
}

function HabitToggle({ label, checked, onChange, colorClass, streak }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
      <div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500' }}>{label}</div>
        {streak > 0 && (
          <div style={{ fontSize: '0.75rem', color: 'var(--green)', marginTop: '2px' }}>
            🔥 {streak}-day streak
          </div>
        )}
      </div>
      <label className={`toggle-switch ${colorClass}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-slider" />
      </label>
    </div>
  )
}
