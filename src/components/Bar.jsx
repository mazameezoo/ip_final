import { CYAN, CYAN_DARK } from '../utils/theme'

const TRACK_STYLE = {
  height: 3,
  background: 'rgba(0,210,200,0.12)',
  borderRadius: 2,
  overflow: 'hidden',
  marginTop: 6,
}

export default function Bar({ pct, height = 3 }) {
  return (
    <div style={{ ...TRACK_STYLE, height }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: `linear-gradient(90deg,${CYAN},${CYAN_DARK})`,
        borderRadius: 2,
      }} />
    </div>
  )
}