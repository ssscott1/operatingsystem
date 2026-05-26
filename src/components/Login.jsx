import { useState } from 'react'
import toast from 'react-hot-toast'
import { supabaseConfigured } from '../lib/supabase'

export default function Login({ signIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast.error(error.message || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        className="card fade-in"
        style={{ width: '100%', maxWidth: '420px', padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚡</div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            Command Centre
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Your day, your way. Let's get to work.
          </p>
        </div>

        {!supabaseConfigured ? (
          <div
            style={{
              background: 'var(--accent-subtle)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: '10px',
              padding: '20px',
            }}
          >
            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--accent)', marginBottom: '10px' }}>
              Setup required
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>
              Add your Supabase credentials to connect this dashboard:
            </p>
            <ol style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '2', paddingLeft: '18px' }}>
              <li>Create a project at <strong style={{ color: 'var(--text-primary)' }}>supabase.com</strong></li>
              <li>Copy your Project URL and anon key</li>
              <li>
                Add a <code style={{ background: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: '3px', fontSize: '0.75rem' }}>.env</code> file with:
              </li>
            </ol>
            <pre
              style={{
                marginTop: '10px',
                background: 'var(--bg-secondary)',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                overflowX: 'auto',
                lineHeight: '1.8',
              }}
            >
{`VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
            </pre>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
              Then run <code style={{ background: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: '3px' }}>npm run dev</code> again. See <strong>SETUP.md</strong> for full instructions.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: '8px', padding: '12px', fontSize: '1rem', width: '100%' }}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>

            <p
              style={{
                textAlign: 'center',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              Manage your account in Supabase dashboard
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
