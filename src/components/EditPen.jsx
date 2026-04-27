import { CYAN } from '../utils/theme'

const BASE_STYLE = {
  background: 'none',
  border: '1px solid rgba(0,210,200,0.2)',
  color: 'rgba(0,210,200,0.55)',
  width: 30,
  height: 30,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
  flexShrink: 0,
  transition: 'all 0.2s',
}

export default function EditPen({ onClick, icon = '✎', ariaLabel = 'Edit' }) {
  const onEnter = e => {
    e.currentTarget.style.borderColor = CYAN
    e.currentTarget.style.color = CYAN
  }
  const onLeave = e => {
    e.currentTarget.style.borderColor = 'rgba(0,210,200,0.2)'
    e.currentTarget.style.color = 'rgba(0,210,200,0.55)'
  }

  return (
    <button
      onClick={onClick}
      style={BASE_STYLE}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  )
}