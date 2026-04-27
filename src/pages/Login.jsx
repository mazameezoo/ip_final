import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import styles from './Login.module.css'
import { useCursor } from '../hooks/useCursor'
import { useAuth } from '../context/AuthContext'

const STATS = [
  { value: '12,400+', label: 'ACTIVE LISTINGS'   },
  { value: '98K',     label: 'CANDIDATES PLACED' },
  { value: '4.9★',    label: 'EMPLOYER RATING'   },
]

const PARTICLE_COUNT = 60
const MAX_DIST       = 140

const loginSchema = Yup.object({
  email:    Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().min(8, 'At least 8 characters').required('Password is required'),
})

const INITIAL_VALUES = { email: '', password: '', rememberMe: false }

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { cursorRef, ringRef, hovered } = useCursor()
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState(null)
  const canvasRef = useRef(null)

  const formik = useFormik({
    initialValues: INITIAL_VALUES,
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setApiError(null)
      try {
        const user = await login({ email: values.email, password: values.password })
        const fallback = user.role === 'employer' ? '/employer-dashboard' : '/dashboard'
        const redirectTo = location.state?.from?.pathname || fallback
        navigate(redirectTo, { replace: true })
      } catch (err) {
        setApiError(err.message || 'Login failed. Please try again.')
      } finally {
        setSubmitting(false)
      }
    },
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
    }))
    let raf
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,210,200,0.7)'; ctx.fill()
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MAX_DIST) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0,210,200,${0.15 * (1 - dist / MAX_DIST)})`
            ctx.lineWidth = 0.8; ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  const handleSocialSignIn = async () => {
    setApiError(null)
    try {
      const user = await login({ email: 'demo@talentflow.io', password: 'demo12345' })
      navigate(user.role === 'employer' ? '/employer-dashboard' : '/dashboard', { replace: true })
    } catch (err) {
      setApiError('Demo account not available. Please register a real account first.')
    }
  }

  const emailError    = formik.touched.email    && formik.errors.email
  const passwordError = formik.touched.password && formik.errors.password

  return (
    <>
      <div ref={cursorRef} className={`${styles.cursor} ${hovered ? styles.cursorHovered : ''}`} />
      <div ref={ringRef}   className={`${styles.ring}   ${hovered ? styles.ringHovered   : ''}`} />

      <div className={styles.page}>
        <div className={styles.left}>
          <canvas ref={canvasRef} className={styles.canvas} />
          <div className={styles.leftContent}>
            <div className={styles.brand}>
              <span className={styles.brandBold}>TALENT</span>
              <span className={styles.brandLight}>FLOW</span>
              <p className={styles.brandSub}>JOB BOARD &amp; ATS</p>
            </div>
            <div className={styles.headline}>
              <p className={styles.eyebrow}>— ONE PLATFORM —</p>
              <h1 className={styles.heroTitle}>
                FIND<br />
                <span className={styles.heroMuted}>THE RIGHT</span><br />
                <span className={styles.heroCyan}>TALENT.</span>
              </h1>
              <p className={styles.heroDesc}>
                Post jobs, attract top candidates, track every application,
                and make smarter hiring decisions — at the speed your team needs.
              </p>
            </div>
            <div className={styles.stats}>
              {STATS.map(s => (
                <div key={s.label} className={styles.stat}>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <form className={styles.formCard} onSubmit={formik.handleSubmit} noValidate>
            <h2 className={styles.formTitle}>WELCOME BACK</h2>
            <p className={styles.formSub}>Sign in to find the right talent.</p>

            <div className={styles.socialRow}>
              <button type="button" className={styles.socialBtn} onClick={handleSocialSignIn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button type="button" className={styles.socialBtn} onClick={handleSocialSignIn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </button>
            </div>

            <div className={styles.divider}>
              <span className={styles.dividerLine} />
              <span className={styles.dividerText}>OR</span>
              <span className={styles.dividerLine} />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="email">EMAIL ADDRESS</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={styles.input}
                  placeholder="you@company.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {emailError && <p style={{ color: '#ff5555', fontSize: 11, marginTop: 6, letterSpacing: '1px' }}>{formik.errors.email}</p>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="password">PASSWORD</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="••••••••"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(v => !v)}>
                  {showPassword
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {passwordError && <p style={{ color: '#ff5555', fontSize: 11, marginTop: 6, letterSpacing: '1px' }}>{formik.errors.password}</p>}
            </div>

            <div className={styles.optionsRow}>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  name="rememberMe"
                  className={styles.checkbox}
                  checked={formik.values.rememberMe}
                  onChange={formik.handleChange}
                />
                <span className={styles.checkmark} />
                Remember me
              </label>
              <a href="/forgot-password" className={styles.forgotLink}>FORGOT PASSWORD?</a>
            </div>

            {apiError && (
              <div style={{ background: 'rgba(255,85,85,0.08)', border: '1px solid rgba(255,85,85,0.3)', padding: '10px 14px', marginBottom: 12 }}>
                <p style={{ color: '#ff5555', fontSize: 12, fontWeight: 600, letterSpacing: '0.5px' }}>{apiError}</p>
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={formik.isSubmitting}>
              {formik.isSubmitting ? 'SIGNING IN...' : 'SIGN IN →'}
            </button>

            <p className={styles.signupText}>
              Don't have an account?{' '}
              <a href="/register" className={styles.signupLink}>Sign up free</a>
            </p>
            <p className={styles.secureNote}>TALENTFLOW · SECURE LOGIN</p>
          </form>
        </div>
      </div>
    </>
  )
}
