import { CYAN } from '../utils/theme'

const BASE_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  border: '1px solid rgba(0,210,200,0.22)',
  color: CYAN,
  padding: '5px 12px',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '1px',
}

const REMOVE_BTN_STYLE = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.4)',
  cursor: 'pointer',
  fontSize: 14,
  lineHeight: 1,
  padding: 0,
}

export default function Tag({ children, onRemove, style = {} }) {
  return (
    <span style={{ ...BASE_STYLE, ...style }}>
      {children}
      {onRemove && (
        <button onClick={onRemove} style={REMOVE_BTN_STYLE} aria-label="Remove">×</button>
      )}
    </span>
  )
}