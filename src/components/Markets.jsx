import { useState, useEffect, useRef } from 'react'

const CRYPTO_IDS = {
  'BTC/USD': 'bitcoin',
  'ETH/USD': 'ethereum',
}

const EQUITIES = [
  { symbol: '^AXJO', label: 'ASX 200', flag: '🇦🇺' },
  { symbol: '^N225', label: 'Nikkei 225', flag: '🇯🇵' },
  { symbol: '^GSPC', label: 'S&P 500', flag: '🇺🇸' },
  { symbol: 'GC=F', label: 'Gold', flag: '🥇' },
  { symbol: 'HG=F', label: 'Copper', flag: '🟤' },
]

function ChangeChip({ pct }) {
  if (pct == null) return <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
  const positive = pct >= 0
  return (
    <span
      style={{
        fontSize: '0.75rem',
        fontWeight: '600',
        color: positive ? 'var(--green)' : 'var(--red)',
        background: positive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
        borderRadius: '4px',
        padding: '2px 6px',
      }}
    >
      {positive ? '+' : ''}{pct.toFixed(2)}%
    </span>
  )
}

function MarketRow({ flag, label, price, change, currency }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '1rem' }}>{flag}</span>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
          {price != null ? `${currency || ''}${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—'}
        </span>
        <ChangeChip pct={change} />
      </div>
    </div>
  )
}

export default function Markets() {
  const [crypto, setCrypto] = useState({})
  const [equities, setEquities] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    fetchAll()
    intervalRef.current = setInterval(fetchAll, 10 * 60 * 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  async function fetchAll() {
    setError(null)
    await Promise.allSettled([fetchCrypto(), fetchEquities()])
    setLastUpdate(new Date())
    setLoading(false)
  }

  async function fetchCrypto() {
    try {
      const ids = Object.values(CRYPTO_IDS).join(',')
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      )
      if (!res.ok) throw new Error('CoinGecko error')
      const data = await res.json()
      const result = {}
      for (const [label, id] of Object.entries(CRYPTO_IDS)) {
        if (data[id]) {
          result[label] = {
            price: data[id].usd,
            change: data[id].usd_24h_change,
          }
        }
      }
      setCrypto(result)
    } catch {
      setError('Crypto data unavailable')
    }
  }

  async function fetchEquities() {
    // Use a CORS-friendly Yahoo Finance proxy approach
    // We'll try each symbol via the Yahoo Finance v8 endpoint
    const results = {}
    await Promise.allSettled(
      EQUITIES.map(async ({ symbol, label }) => {
        try {
          const res = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
            { headers: { 'Accept': 'application/json' } }
          )
          if (!res.ok) return
          const data = await res.json()
          const meta = data?.chart?.result?.[0]?.meta
          if (meta) {
            results[label] = {
              price: meta.regularMarketPrice,
              change: meta.regularMarketChangePercent,
            }
          }
        } catch { /* individual symbol failure is ok */ }
      })
    )
    setEquities(results)
  }

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>📈 Markets</h2>
        <button onClick={fetchAll} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '5px 10px' }}>↻</button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Fetching market data…</p>
      ) : (
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Crypto</div>
          <MarketRow flag="₿" label="BTC/USD" currency="$" price={crypto['BTC/USD']?.price} change={crypto['BTC/USD']?.change} />
          <MarketRow flag="⟠" label="ETH/USD" currency="$" price={crypto['ETH/USD']?.price} change={crypto['ETH/USD']?.change} />

          <div style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '14px', marginBottom: '6px' }}>Indices & Commodities</div>
          {EQUITIES.map(({ label, flag }) => (
            <MarketRow
              key={label}
              flag={flag}
              label={label}
              price={equities[label]?.price}
              change={equities[label]?.change}
            />
          ))}

          {(error || Object.keys(equities).length === 0) && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '8px', fontStyle: 'italic' }}>
              ⚠️ Some market data unavailable (CORS restrictions may apply in browser)
            </p>
          )}

          {lastUpdate && (
            <div style={{ marginTop: '10px', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              Updated {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
