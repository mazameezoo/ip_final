import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const CYAN = '#00d2c8'
const BG   = '#030b12'

const HERO_STATS = [
  ['12,400+', 'Active Listings'],
  ['98K',     'Hired'],
  ['4.9★',   'Rating'],
]

function Particles() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    let id
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight }
    resize()
    window.addEventListener('resize', resize)
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.5,
    }))
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > c.width)  p.vx *= -1
        if (p.y < 0 || p.y > c.height) p.vy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,210,200,0.65)'; ctx.fill()
      })
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < 120) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(0,210,200,${0.1 * (1 - d / 120)})`
          ctx.lineWidth = 0.6; ctx.stroke()
        }
      }))
      id = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
}

function Inp({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 7 }}>{label}</p>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,210,200,0.18)', padding: '11px 14px', fontSize: 13, color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', borderRadius: 2, transition: 'border-color 0.2s' }}
        onFocus={e => e.target.style.borderColor = CYAN}
        onBlur={e => e.target.style.borderColor = 'rgba(0,210,200,0.18)'} />
    </div>
  )
}

export default function EmployerLogin() {
  const navigate = useNavigate()
  const [mode,    setMode]    = useState('login')
  const [form,    setForm]    = useState({ name: '', company: '', email: '', phone: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = () => {
    if (!form.email || !form.password) { setError('Please fill all required fields.'); return }
    if (mode === 'register' && (!form.name || !form.company)) { setError('All fields are required.'); return }
    setError('')
    setLoading(true)
    setTimeout(() => { setLoading(false); navigate('/employer-dashboard') }, 1400)
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Barlow',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700;900&family=Barlow:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div style={{ position: 'absolute', inset: 0 }}><Particles /></div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 60, animation: 'fadeUp 0.5s ease' }}>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 26, letterSpacing: 2, marginBottom: 6 }}>
              <span style={{ color: '#fff' }}>TALENT</span><span style={{ color: CYAN }}>FLOW</span>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '3px', color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: 3 }}>EMPLOYER PORTAL</span>
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: CYAN, marginBottom: 14 }}>· HIRE SMARTER ·</p>
            <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 52, color: '#fff', margin: 0, lineHeight: 0.95, letterSpacing: -1 }}>
              FIND THE<br /><span style={{ color: 'rgba(255,255,255,0.2)' }}>RIGHT</span><br /><span style={{ color: CYAN }}>TALENT.</span>
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 16, lineHeight: 1.75, maxWidth: 360 }}>
              Post jobs, track every applicant, run AI-powered interviews, and make faster hiring decisions — all in one platform.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {HERO_STATS.map(([v, l]) => (
              <div key={l}>
                <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 26, color: CYAN, margin: 0, lineHeight: 1 }}>{v}</p>
                <p style={{ fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: '4px 0 0' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: 420, flexShrink: 0, background: 'rgba(5,15,26,0.92)', border: '1px solid rgba(0,210,200,0.15)', borderRadius: 3, backdropFilter: 'blur(16px)', boxShadow: '0 0 60px rgba(0,210,200,0.06), 0 20px 60px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, background: `linear-gradient(90deg,transparent,${CYAN},transparent)` }} />

          <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,210,200,0.1)' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                style={{ flex: 1, padding: '16px', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', color: mode === m ? CYAN : 'rgba(255,255,255,0.3)', borderBottom: mode === m ? `2px solid ${CYAN}` : '2px solid transparent', marginBottom: -1, transition: 'color 0.2s' }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <div style={{ padding: 28 }}>
            <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 20, color: '#fff', letterSpacing: 2, marginBottom: 4 }}>
              {mode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>
              {mode === 'login' ? 'Sign in to your employer account' : 'Start hiring with TalentFlow today'}
            </p>

            {mode === 'register' && (
              <>
                <Inp label="HR Name"      value={form.name}    onChange={set('name')}    placeholder="Sara Ahmed" />
                <Inp label="Company Name" value={form.company} onChange={set('company')} placeholder="TechCorp Inc." />
                <Inp label="Phone Number" value={form.phone}   onChange={set('phone')}   placeholder="+20 123 456 7890" type="tel" />
              </>
            )}
            <Inp label="Email Address" value={form.email}    onChange={set('email')}    placeholder="sara@techcorp.com" type="email" />
            <Inp label="Password"      value={form.password} onChange={set('password')} placeholder={mode === 'register' ? 'Min. 6 chars, 1 uppercase, 1 number' : 'Your password'} type="password" />

            {error && <p style={{ fontSize: 12, color: '#ff5555', marginBottom: 14, padding: '8px 12px', background: 'rgba(255,85,85,0.08)', border: '1px solid rgba(255,85,85,0.2)' }}>{error}</p>}

            <button onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', background: loading ? 'rgba(0,210,200,0.5)' : CYAN, color: '#000', border: 'none', padding: '14px', fontSize: 12, fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Rajdhani',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'background 0.2s' }}>
              {loading
                ? <><span style={{ width: 14, height: 14, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Authenticating…</>
                : mode === 'login' ? 'SIGN IN →' : 'CREATE ACCOUNT →'
              }
            </button>

            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 18 }}>
              {mode === 'login'
                ? <span>Don't have an account? <button onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: CYAN, cursor: 'pointer', fontWeight: 700, fontSize: 11 }}>Register free</button></span>
                : <span>Already registered? <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: CYAN, cursor: 'pointer', fontWeight: 700, fontSize: 11 }}>Sign in</button></span>
              }
            </p>
            <p style={{ fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)', textAlign: 'center', marginTop: 14 }}>TALENTFLOW · EMPLOYER PORTAL</p>
          </div>
        </div>
      </div>
    </div>
  )
}
