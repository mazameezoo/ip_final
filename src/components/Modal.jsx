const OVERLAY_STYLE = {
  position: 'fixed',
  inset: 0,
  zIndex: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.75)',
  backdropFilter: 'blur(8px)',
}

const DIALOG_STYLE = {
  width: '100%',
  maxWidth: 520,
  margin: '0 16px',
  background: 'rgba(3,11,18,0.99)',
  border: '1px solid rgba(0,210,200,0.2)',
  borderRadius: 3,
  boxShadow: '0 0 60px rgba(0,210,200,0.08)',
}

const HEADER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '18px 22px',
  borderBottom: '1px solid rgba(0,210,200,0.1)',
}

const TITLE_STYLE = {
  fontFamily: "'Rajdhani',sans-serif",
  fontWeight: 900,
  fontSize: 16,
  color: '#fff',
  letterSpacing: '3px',
  textTransform: 'uppercase',
  margin: 0,
}

const CLOSE_STYLE = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.4)',
  fontSize: 22,
  cursor: 'pointer',
  lineHeight: 1,
}

const BODY_STYLE = { padding: 22 }

export default function Modal({ title, onClose, children, maxWidth }) {
  const dialogStyle = maxWidth ? { ...DIALOG_STYLE, maxWidth } : DIALOG_STYLE

  return (
    <div style={OVERLAY_STYLE} onClick={onClose}>
      <div style={dialogStyle} onClick={e => e.stopPropagation()}>
        <div style={HEADER_STYLE}>
          <p style={TITLE_STYLE}>{title}</p>
          <button onClick={onClose} style={CLOSE_STYLE} aria-label="Close">×</button>
        </div>
        <div style={BODY_STYLE}>{children}</div>
      </div>
    </div>
  )
}