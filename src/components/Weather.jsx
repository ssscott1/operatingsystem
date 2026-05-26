import { useState, useEffect } from 'react'

const WEATHER_CODES = {
  0: { icon: '☀️', desc: 'Clear sky' },
  1: { icon: '🌤️', desc: 'Mainly clear' },
  2: { icon: '⛅', desc: 'Partly cloudy' },
  3: { icon: '☁️', desc: 'Overcast' },
  45: { icon: '🌫️', desc: 'Foggy' },
  48: { icon: '🌫️', desc: 'Icy fog' },
  51: { icon: '🌦️', desc: 'Light drizzle' },
  53: { icon: '🌦️', desc: 'Drizzle' },
  55: { icon: '🌧️', desc: 'Heavy drizzle' },
  61: { icon: '🌧️', desc: 'Light rain' },
  63: { icon: '🌧️', desc: 'Rain' },
  65: { icon: '🌧️', desc: 'Heavy rain' },
  71: { icon: '🌨️', desc: 'Light snow' },
  73: { icon: '🌨️', desc: 'Snow' },
  75: { icon: '❄️', desc: 'Heavy snow' },
  80: { icon: '🌦️', desc: 'Light showers' },
  81: { icon: '🌧️', desc: 'Showers' },
  82: { icon: '⛈️', desc: 'Heavy showers' },
  95: { icon: '⛈️', desc: 'Thunderstorm' },
}

function getWeather(code) {
  return WEATHER_CODES[code] || { icon: '🌡️', desc: 'Unknown' }
}

export default function Weather() {
  const [data, setData] = useState(null)
  const [city, setCity] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeather()
  }, [])

  async function getLocation() {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          () => resolve(null),
          { timeout: 5000 }
        )
      } else {
        resolve(null)
      }
    })
  }

  async function fetchWeather() {
    setLoading(true)
    setError(null)
    try {
      let lat, lon

      const geo = await getLocation()
      if (geo) {
        lat = geo.lat
        lon = geo.lon
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
        const geoData = await geoRes.json()
        setCity(geoData.address?.city || geoData.address?.town || geoData.address?.suburb || '')
      } else {
        const ipRes = await fetch('https://ipapi.co/json/')
        const ipData = await ipRes.json()
        lat = ipData.latitude
        lon = ipData.longitude
        setCity(ipData.city || '')
      }

      const wRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto&forecast_days=1`
      )
      const wData = await wRes.json()
      setData(wData)
    } catch {
      setError('Weather unavailable')
    }
    setLoading(false)
  }

  const current = data?.current
  const daily = data?.daily
  const weather = current ? getWeather(current.weather_code) : null

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h2 className="widget-title">🌤️ Weather</h2>
        <button onClick={fetchWeather} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>↻</button>
      </div>

      {loading && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Detecting location…</p>}

      {error && !loading && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{error}</p>
      )}

      {!loading && !error && current && (
        <div>
          {city && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>📍 {city}</div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <div style={{ fontSize: '3rem', lineHeight: 1 }}>{weather.icon}</div>
            <div>
              <div className="font-mono" style={{ fontSize: '2.2rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
                {Math.round(current.temperature_2m)}°
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{weather.desc}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Feels like', value: `${Math.round(current.apparent_temperature)}°C` },
              { label: 'Humidity', value: `${current.relative_humidity_2m}%` },
              { label: 'Wind', value: `${Math.round(current.wind_speed_10m)} km/h` },
              { label: 'Range', value: daily ? `${Math.round(daily.temperature_2m_min[0])}° – ${Math.round(daily.temperature_2m_max[0])}°` : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '8px 10px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
