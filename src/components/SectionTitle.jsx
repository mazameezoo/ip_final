const STYLE = {
  fontFamily: "'Rajdhani',sans-serif",
  fontWeight: 900,
  fontSize: 13,
  letterSpacing: '3px',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.35)',
  marginBottom: 18,
}

export default function SectionTitle({ children, style = {} }) {
  return <p style={{ ...STYLE, ...style }}>{children}</p>
}