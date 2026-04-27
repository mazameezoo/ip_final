import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import styles from './Register.module.css'
import { useCursor } from '../hooks/useCursor'
import { useAuth } from '../context/AuthContext'

const PERKS = [
  { icon: '⚡', text: 'Post your first job in under 2 minutes'   },
  { icon: '🎯', text: 'AI-matched candidates sent to your inbox' },
  { icon: '📊', text: 'Full ATS pipeline — free forever'         },
]

const PARTICLE_COUNT = 60
const MAX_DIST       = 140

const registerSchema = Yup.object({
  firstName:   Yup.string().trim().min(2, 'Too short').required('First name is required'),
  lastName:    Yup.string().trim().min(2, 'Too short').required('Last name is required'),
  email:       Yup.string().email('Enter a valid email').required('Email is required'),
  accountType: Yup.string().oneOf(['employer', 'candidate']).required(),
  company:     Yup.string().when('accountType', {
                 is: 'employer',
                  then: (s) => s.trim().min(2, 'Too short').required('Company name is required'),
                 otherwise: (s) => s.notRequired(),
               }),
  password:    Yup.string().min(8, 'At least 8 characters').required('Password is required'),
  confirm:     Yup.string().oneOf([Yup.ref('password')], 'Passwords do not match').required('Please confirm your password'),
})

const INITIAL_VALUES = {
  firstName: '', lastName: '', email: '', company: '',
  password: '', confirm: '', accountType: 'employer',
}

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { cursorRef, ringRef, hovered } = useCursor()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [apiError, setApiError] = useState(null)
  const canvasRef = useRef(null)

  const formik = useFormik({
    initialValues: INITIAL_VALUES,
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setApiError(null)
      try {
        await register({
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          role: values.accountType,
          company: values.accountType === 'employer' ? values.company : undefined,
        })
        navigate(values.accountType === 'employer' ? '/employer-dashboard' : '/dashboard', { replace: true })
      } catch (err) {
        setApiError(err.message || 'Registration failed. Please try again.')
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

  const err = (field) => formik.touched[field] && formik.errors[field]
  const errStyle = { color: '#ff5555', fontSize: 11, marginTop: 6, letterSpacing: '1px' }

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
              <p className={styles.eyebrow}>— JOIN TODAY —</p>
              <h1 className={styles.heroTitle}>
                HIRE<br />
                <span className={styles.heroMuted}>SMARTER,</span><br />
                <span className={styles.heroCyan}>FASTER.</span>
              </h1>
              <p className={styles.heroDesc}>
                Create your free account and start posting jobs, sourcing candidates,
                and making data-driven hiring decisions in minutes.
              </p>
            </div>
            <div className={styles.perks}>
              {PERKS.map(p => (
                <div key={p.text} className={styles.perk}>
                  <span className={styles.perkIcon}>{p.icon}</span>
                  <span className={styles.perkText}>{p.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <form className={styles.formCard} onSubmit={formik.handleSubmit} noValidate>
            <h2 className={styles.formTitle}>CREATE ACCOUNT</h2>
            <p className={styles.formSub}>Free forever. No credit card required.</p>

            <div className={styles.toggle}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${formik.values.accountType === 'employer'  ? styles.toggleActive : ''}`}
                onClick={() => formik.setFieldValue('accountType', 'employer')}>
                🏢 Employer
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${formik.values.accountType === 'candidate' ? styles.toggleActive : ''}`}
                onClick={() => formik.setFieldValue('accountType', 'candidate')}>
                👤 Candidate
              </button>
            </div>

            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>FIRST NAME</label>
                <div className={styles.inputWrap}>
                  <input
                    name="firstName"
                    className={styles.input}
                    placeholder="Jane"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {err('firstName') && <p style={errStyle}>{formik.errors.firstName}</p>}
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>LAST NAME</label>
                <div className={styles.inputWrap}>
                  <input
                    name="lastName"
                    className={styles.input}
                    placeholder="Smith"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {err('lastName') && <p style={errStyle}>{formik.errors.lastName}</p>}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>EMAIL ADDRESS</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>
                </svg>
                <input
                  name="email"
                  type="email"
                  className={styles.input}
                  placeholder="you@company.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {err('email') && <p style={errStyle}>{formik.errors.email}</p>}
            </div>

            {formik.values.accountType === 'employer' && (
              <div className={styles.fieldGroup}>
                <label className={styles.label}>COMPANY NAME</label>
                <div className={styles.inputWrap}>
                  <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                  </svg>
                  <input
                    name="company"
                    className={styles.input}
                    placeholder="Acme Corp"
                    value={formik.values.company}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {err('company') && <p style={errStyle}>{formik.errors.company}</p>}
              </div>
            )}

            <div className={styles.fieldGroup}>
              <label className={styles.label}>PASSWORD</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Min. 8 characters"
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
              {err('password') && <p style={errStyle}>{formik.errors.password}</p>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>CONFIRM PASSWORD</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  name="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className={`${styles.input} ${err('confirm') ? styles.inputError : ''}`}
                  placeholder="Repeat password"
                  value={formik.values.confirm}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {err('confirm') && <p className={styles.errorMsg}>{formik.errors.confirm}</p>}
            </div>

            <p className={styles.terms}>
              By creating an account you agree to our{' '}
              <a href="/terms"    className={styles.termsLink}>Terms of Service</a> and{' '}
              <a href="/privacy"  className={styles.termsLink}>Privacy Policy</a>.
            </p>

            {apiError && (
              <div style={{ background: 'rgba(255,85,85,0.08)', border: '1px solid rgba(255,85,85,0.3)', padding: '10px 14px', marginBottom: 12 }}>
                <p style={{ color: '#ff5555', fontSize: 12, fontWeight: 600, letterSpacing: '0.5px' }}>{apiError}</p>
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={formik.isSubmitting}>
              {formik.isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT →'}
            </button>

            <p className={styles.signinText}>
              Already have an account?{' '}
              <a href="/login" className={styles.signinLink}>Sign in</a>
            </p>
            <p className={styles.secureNote}>TALENTFLOW · SECURE SIGNUP</p>
          </form>
        </div>
      </div>
    </>
  )
}
