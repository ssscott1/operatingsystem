import { useState, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

export default function HabitTracker({ user }) {
  const [habits, setHabits] = useState({ trained_gym: null, drank_alcohol: null })
  const [stats, setStats] = useState({ gym_yes: 0, gym_total: 0, alcohol_avoided: 0, alcohol_total: 0 })
  const [gymStreak, setGymStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [user.id])

  async function fetchAll() {
    const [todayRes, allRes] = await Promise.all([
      supabase.from('habit_log').select('*').eq('user_id', user.id).eq('date', yesterday).single(),
      supabase.from('habit_log').select('date, trained_gym, drank_alcohol').eq('user_id', user.id).order('date', { ascending: false }),
    ])

    if (todayRes.data) {
      setHabits({ trained_gym: todayRes.data.trained_gym, drank_alcohol: todayRes.data.drank_alcohol })
    }

    if (allRes.data && allRes.data.length > 0) {
      const all = allRes.data
      const gymYes = all.filter((r) => r.trained_gym === true).length
      const alcoholAvoided = all.filter((r) => r.drank_alcohol === false).length
      setStats({ gym_yes: gymYes, gym_total: all.length, alcohol_avoided: alcoholAvoided, alcohol_total: all.length })

      let streak = 0
      let cursor = subDays(new Date(), 1)
      for (const row of all) {
        if (format(cursor, 'yyyy-MM-dd') === row.date && row.trained_gym) {
          streak++
          cursor = subDays(cursor, 1)
        } else if (format(cursor, 'yyyy-MM-dd') === row.date) {
          break
        }
      }
      setGymStreak(streak)
    }

    setLoading(false)
  }

  async function recordHabit(field, value) {
    const current = { ...habits, [field]: value }
    setHabits(current)

    const { error } = await supabase.from('habit_log').upsert(
      {
        user_id: user.id,
        date: yesterday,
        trained_gym: current.trained_gym ?? false,
        drank_alcohol: current.drank_alcohol ?? false,
      },
      { onConflict: 'user_id,date' }
    )
    if (error) {
      toast.error('Failed to save')
      setHabits((prev) => ({ ...prev, [field]: null }))
    } else {
      fetchAll()
    }
  }

  const gymPct = stats.gym_total > 0 ? Math.round((stats.gym_yes / stats.gym_total) * 100) : null
  const avoidPct = stats.alcohol_total > 0 ? Math.round((stats.alcohol_avoided / stats.alcohol_total) * 100) : null

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 className="widget-title">📊 Habit Tracker</h2>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '3px 8px', borderRadius: '20px' }}>
          Yesterday
        </span>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <HabitRow
            label="🏋️ Trained at the gym"
            value={habits.trained_gym}
            onChange={(v) => recordHabit('trained_gym', v)}
            pct={gymPct}
            total={stats.gym_total}
            streak={gymStreak}
            positiveColor="var(--green)"
          />
          <HabitRow
            label="🚫 Avoided alcohol"
            value={habits.drank_alcohol === null ? null : !habits.drank_alcohol}
            onChange={(v) => recordHabit('drank_alcohol', !v)}
            pct={avoidPct}
            total={stats.alcohol_total}
            positiveColor="var(--green)"
          />
        </div>
      )}
    </div>
  )
}

function HabitRow({ label, value, onChange, pct, total, streak, positiveColor }) {
  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>{label}</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <YesNoButton
            label="Yes"
            active={value === true}
            activeColor={positiveColor}
            onClick={() => onChange(true)}
          />
          <YesNoButton
            label="No"
            active={value === false}
            activeColor="var(--red)"
            onClick={() => onChange(false)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ flex: 1, height: '5px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: pct != null ? `${pct}%` : '0%',
              background: positiveColor,
              borderRadius: '3px',
              transition: 'width 0.6s ease',
            }}
          />
        </div>
        <span className="font-mono" style={{ fontSize: '0.8rem', fontWeight: '700', color: pct != null ? positiveColor : 'var(--text-muted)', minWidth: '36px', textAlign: 'right' }}>
          {pct != null ? `${pct}%` : '—'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
        {total > 0 && (
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {total} check-in{total !== 1 ? 's' : ''}
          </span>
        )}
        {streak > 0 && (
          <span style={{ fontSize: '0.7rem', color: 'var(--green)' }}>🔥 {streak}-day streak</span>
        )}
      </div>
    </div>
  )
}

function YesNoButton({ label, active, activeColor, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 14px',
        borderRadius: '6px',
        fontSize: '0.8rem',
        fontWeight: '600',
        cursor: 'pointer',
        border: active ? `1.5px solid ${activeColor}` : '1.5px solid var(--border-color)',
        background: active ? `${activeColor}18` : 'transparent',
        color: active ? activeColor : 'var(--text-muted)',
        transition: 'all 0.15s ease',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      {label}
    </button>
  )
}
