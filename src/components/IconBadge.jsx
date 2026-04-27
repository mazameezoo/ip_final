const STYLE = {
  width: 44,
  height: 44,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 20,
  background: 'rgba(0,210,200,0.08)',
  border: '1px solid rgba(0,210,200,0.15)',
  borderRadius: 3,
}

export default function IconBadge({ icon, size = 44, style = {} }) {
  const finalStyle = size !== 44
    ? { ...STYLE, width: size, height: size, fontSize: Math.round(size * 0.45), ...style }
    : { ...STYLE, ...style }
  return <div style={finalStyle}>{icon}</div>
}