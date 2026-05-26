export default function ThemeToggle({ theme, toggle }) {
  return (
    <button
      onClick={toggle}
      style={{
        background: 'transparent',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '8px 10px',
        cursor: 'pointer',
        fontSize: '1.1rem',
        lineHeight: 1,
        transition: 'border-color 0.2s ease',
        color: 'var(--text-secondary)',
      }}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
