import { CYAN } from '../utils/theme'

const WRAP_BASE = {
  display: 'flex',
  marginTop: 8,
}

const SAVE_STYLE = {
  background: CYAN,
  color: '#000',
  border: 'none',
  padding: '9px 26px',
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  cursor: 'pointer',
  fontFamily: "'Rajdhani',sans-serif",
}

const DELETE_STYLE = {
  color: '#ff5555',
  background: 'none',
  border: '1px solid rgba(255,85,85,0.3)',
  padding: '7px 16px',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  cursor: 'pointer',
}

export default function SaveBtn({ onClick, onDelete, saveLabel = 'Save Changes', deleteLabel = 'Delete', disabled = false }) {
  const wrapStyle = {
    ...WRAP_BASE,
    justifyContent: onDelete ? 'space-between' : 'flex-end',
  }

  return (
    <div style={wrapStyle}>
      {onDelete && (
        <button type="button" onClick={onDelete} style={DELETE_STYLE}>{deleteLabel}</button>
      )}
      <button type="button" onClick={onClick} style={SAVE_STYLE} disabled={disabled}>
        {saveLabel}
      </button>
    </div>
  )
}