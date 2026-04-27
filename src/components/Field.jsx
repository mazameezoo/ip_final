import { CYAN } from '../utils/theme'

const LABEL_STYLE = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.35)',
  marginBottom: 7,
  display: 'block',
}

const INPUT_STYLE = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(0,210,200,0.18)',
  padding: '10px 14px',
  fontSize: 13,
  color: '#fff',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  borderRadius: 2,
}

const TEXTAREA_STYLE = { ...INPUT_STYLE, resize: 'none' }

const ERROR_TEXT_STYLE = {
  color: '#ff5555',
  fontSize: 11,
  marginTop: 6,
  letterSpacing: '1px',
}

export default function Field({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
  multiline = false,
  rows = 3,
  error,
  name,
  disabled = false,
}) {
  const inputStyle = multiline ? TEXTAREA_STYLE : INPUT_STYLE
  const finalStyle = error
    ? { ...inputStyle, borderColor: '#ff5555' }
    : inputStyle

  const handleFocus = e => {
    if (!error) e.target.style.borderColor = CYAN
  }
  const handleBlur = e => {
    if (!error) e.target.style.borderColor = 'rgba(0,210,200,0.18)'
    if (onBlur) onBlur(e)
  }

  const commonProps = {
    name,
    value,
    onChange,
    onBlur: handleBlur,
    onFocus: handleFocus,
    placeholder,
    disabled,
    style: finalStyle,
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={LABEL_STYLE}>{label}</label>}
      {multiline
        ? <textarea {...commonProps} rows={rows} />
        : <input {...commonProps} type={type} />
      }
      {error && <p style={ERROR_TEXT_STYLE}>{error}</p>}
    </div>
  )
}