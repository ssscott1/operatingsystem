import { useState, useEffect, useRef } from 'react'

const CRYPTO = [
  { id: 'bitcoin', label: 'Bitcoin', symbol: 'BTC', icon: '₿', currency: '$' },
  { id: 'ethereum', label: 'Ethereum', symbol: 'ETH', icon: '⟠', currency: '$' },
]

const EQUITIES = [
  { symbol: 'GC=F', label: 'Gold', icon: '🥇', currency: '$' },
  { symbol: 'HG=F', label: 'Copper', icon: '🟤', currency: '$' },
  { symbol: '^AXJO', label: 'ASX 200', icon: '🇦🇺', currency: '' },
  { symbol: '^N225', label: 'Nikkei 225', icon: '🇯🇵', currency: '¥' },
  { symbol: '^GSPC', label: 'S&P 500', icon: '🇺🇸', currency: '' },
]

function formatPrice(price, currency) {
  if (price == null) return '—'
  const formatted = price >= 1000
    ? price.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${currency}${formatted}`
}

function ChangeTag({ pct }) {
  if (pct == null) return <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
  const up = pct >= 0
  return (
    <span style={{
      fontSize: '0.78rem',
      fontWeight: '700',
      color: up ? 'var(--green)' : 'var(--red)',
      background: up ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
      padding: '2px 8px',
      borderRadius: '20px',
    }}>
      {up ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
    </span>
  )
}

function MarketCard({ icon, label, symbol, price, change, currency }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: '10px',
      padding: '14px',
      border: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
          {label}
        </span>
      </div>
      <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
        {price != null ? formatPrice(price, currency) : <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Unavailable</span>}
      </div>
      <ChangeTag pct={change} />
    </div>
  )
}

export default function Markets() {
  const [crypto, setCrypto] = useState({})
  const [equities, setEquities] = useState({})
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    fetchAll()
    intervalRef.current = setInterval(fetchAll, 10 * 60 * 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  async function fetchAll() {
    await Promise.allSettled([fetchCrypto(), fetchEquities()])
    setLastUpdate(new Date())
    setLoading(false)
  }

  async function fetchCrypto() {
    try {
      const ids = CRYPTO.map((c) => c.id).join(',')
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      const result = {}
      CRYPTO.forEach(({ id, label }) => {
        if (data[id]) result[label] = { price: data[id].usd, change: data[id].usd_24h_change }
      })
      setCrypto(result)
    } catch {}
  }

  async function fetchEquities() {
    const results = {}
    await Promise.allSettled(EQUITIES.map(async ({ symbol, label }) => {
      try {
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`)
        if (!res.ok) return
        const data = await res.json()
        const meta = data?.chart?.result?.[0]?.meta
        if (meta) results[label] = { price: meta.regularMarketPrice, change: meta.regularMarketChangePercent }
      } catch {}
    }))
    setEquities(results)
  }

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <h2 className="widget-title">📈 Financial Markets</h2>
          {lastUpdate && (
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Updated {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · refreshes every 10 min
            </p>
          )}
        </div>
        <button onClick={fetchAll} className="btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Fetching market data…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <div className="section-label" style={{ marginBottom: '10px' }}>Cryptocurrency</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
              {CRYPTO.map(({ label, icon, currency }) => (
                <MarketCard key={label} icon={icon} label={label} currency={currency} price={crypto[label]?.price} change={crypto[label]?.change} />
              ))}
            </div>
          </div>

          <div>
            <div className="section-label" style={{ marginBottom: '10px' }}>Indices & Commodities</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
              {EQUITIES.map(({ label, icon, currency }) => (
                <MarketCard key={label} icon={icon} label={label} currency={currency} price={equities[label]?.price} change={equities[label]?.change} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
