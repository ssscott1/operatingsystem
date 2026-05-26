import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import Login from './components/Login'
import Header from './components/Header'
import TodoList from './components/TodoList'
import Goals from './components/Goals'
import HabitTracker from './components/HabitTracker'
import Calendar from './components/Calendar'
import Journal from './components/Journal'
import Markets from './components/Markets'
import StudyProgress from './components/StudyProgress'
import ReadingList from './components/ReadingList'
import TelegramNotes from './components/TelegramNotes'

export default function App() {
  const { user, loading, signIn, signOut } = useAuth()
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading…</div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <Login signIn={signIn} />
        <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' } }} />
      </>
    )
  }

  return (
    <>
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <Header signOut={signOut} theme={theme} toggleTheme={toggleTheme} />

        <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Row 1: Todo + Habit/Calendar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            <TodoList user={user} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <HabitTracker user={user} />
              <Calendar />
            </div>
          </div>

          {/* Row 2: Journal full width */}
          <div style={{ marginBottom: '20px' }}>
            <Journal user={user} />
          </div>

          {/* Row 3: Goals + Study + Markets */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            <Goals user={user} />
            <StudyProgress />
            <Markets />
          </div>

          {/* Row 4: Reading + Telegram */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            <ReadingList user={user} />
            <TelegramNotes user={user} />
          </div>
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            fontFamily: 'DM Sans, sans-serif',
          },
        }}
      />
    </>
  )
}
