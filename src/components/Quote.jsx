import { useState, useEffect } from 'react'

const FALLBACK_QUOTES = [
  { content: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { content: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { content: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { content: "The harder I work, the luckier I get.", author: "Samuel Goldwyn" },
  { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { content: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { content: "What you get by achieving your goals is not as important as what you become.", author: "Zig Ziglar" },
  { content: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { content: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { content: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { content: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { content: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { content: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { content: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { content: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
  { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { content: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { content: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
  { content: "Act as if what you do makes a difference. It does.", author: "William James" },
]

function getDailyFallback() {
  const day = Math.floor(Date.now() / 86400000)
  return FALLBACK_QUOTES[day % FALLBACK_QUOTES.length]
}

export default function Quote() {
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuote()
  }, [])

  async function fetchQuote() {
    setLoading(true)
    try {
      const res = await fetch('https://api.quotable.io/quotes/random?tags=inspirational|motivational|success&limit=1')
      if (!res.ok) throw new Error()
      const data = await res.json()
      const q = Array.isArray(data) ? data[0] : data
      if (q?.content) {
        setQuote({ content: q.content, author: q.author })
      } else {
        setQuote(getDailyFallback())
      }
    } catch {
      setQuote(getDailyFallback())
    }
    setLoading(false)
  }

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h2 className="widget-title">✨ Daily Quote</h2>
        <button onClick={fetchQuote} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>New</button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>
      ) : quote ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div
            style={{
              fontSize: '0.7rem',
              color: 'var(--accent)',
              fontWeight: '700',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            ❝
          </div>
          <p
            style={{
              fontSize: '1rem',
              fontWeight: '500',
              color: 'var(--text-primary)',
              lineHeight: '1.65',
              fontStyle: 'italic',
              marginBottom: '12px',
            }}
          >
            {quote.content}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: '600' }}>
            — {quote.author}
          </p>
        </div>
      ) : null}
    </div>
  )
}
