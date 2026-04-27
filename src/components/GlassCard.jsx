const BASE_STYLE = {
  background: 'rgba(5,15,26,0.9)',
  border: '1px solid rgba(0,210,200,0.13)',
  backdropFilter: 'blur(16px)',
  borderRadius: 3,
  boxShadow: '0 0 40px rgba(0,210,200,0.04), 0 8px 32px rgba(0,0,0,0.35)',
  position: 'relative',
}

const ACCENT_LINE_STYLE = {
  position: 'absolute',
  top: 0,
  left: '20%',
  right: '20%',
  height: 1,
  background: 'linear-gradient(90deg,transparent,rgba(0,210,200,0.4),transparent)',
}

export default function GlassCard({ children, className = '', style = {}, padding }) {
  const merged = { ...BASE_STYLE, ...style }
  if (padding !== undefined) merged.padding = padding

  return (
    <div className={className} style={merged}>
      <div style={ACCENT_LINE_STYLE} />
      {children}
    </div>
  )
}