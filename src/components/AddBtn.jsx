import { CYAN } from '../utils/theme'

const STYLE = {
  background: 'transparent',
  border: '1px solid rgba(0,210,200,0.25)',
  color: CYAN,
  padding: '5px 14px',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  cursor: 'pointer',
}

export default function AddBtn({ onClick, label = '+ Add' }) {
  return (
    <button onClick={onClick} style={STYLE}>{label}</button>
  )
}