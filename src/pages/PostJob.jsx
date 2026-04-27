import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Navbar from '../components/Navbar'
import Particles from '../components/Particles'
import { CYAN, BG } from '../utils/theme'
import { jobsApi } from '../utils/api'

const STEP_LABELS = ['Basic Info', 'Job Details', 'Preview']
const JOB_TYPES   = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid']
const CATEGORIES  = ['Engineering', 'Design', 'Product', 'Analytics', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations']
const EXP_LEVELS  = ['0–1 years', '1–2 years', '2–3 years', '3–5 years', '5+ years', '10+ years']

const TODAY_ISO = new Date().toISOString().split('T')[0]

const STEP_FIELDS = [
  ['title', 'company', 'location', 'type', 'category', 'experience', 'salary', 'deadline'],
  ['description', 'requirements', 'skills'],
  [],
]

const INITIAL_VALUES = {
  title: '', company: '', location: '',
  type: 'Full-time', category: 'Engineering', experience: '2–3 years',
  salary: '', deadline: '',
  description: '', requirements: '', skills: '',
}

const jobSchema = Yup.object({
  title:        Yup.string().trim().min(3, 'Title must be at least 3 characters').required('Job title is required'),
  company:      Yup.string().trim().min(2, 'Company name too short').required('Company name is required'),
  location:     Yup.string().trim().min(2, 'Location too short').required('Location is required'),
  type:         Yup.string().oneOf(JOB_TYPES, 'Invalid job type').required('Job type is required'),
  category:     Yup.string().oneOf(CATEGORIES, 'Invalid category').required('Category is required'),
  experience:   Yup.string().oneOf(EXP_LEVELS, 'Invalid experience level').required('Experience level is required'),
  salary:       Yup.string().trim().required('Salary range is required'),
  deadline:     Yup.string()
                  .required('Application deadline is required')
                  .test('future-date', 'Deadline must be in the future', v => !v || v >= TODAY_ISO),
  description:  Yup.string().trim().min(50, 'Description must be at least 50 characters').required('Description is required'),
  requirements: Yup.string().trim().required('At least one requirement is needed'),
  skills:       Yup.string().trim().required('At least one skill is needed'),
})

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(0,210,200,0.18)', padding: '13px 16px',
  fontSize: 14, color: '#fff', outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
}
const focusStyle = { borderColor: CYAN, boxShadow: '0 0 0 3px rgba(0,210,200,0.08)' }
const blurStyle  = { borderColor: 'rgba(0,210,200,0.18)', boxShadow: 'none' }
const errorBorder = { borderColor: '#ff5555', boxShadow: '0 0 0 3px rgba(255,85,85,0.08)' }

const errorTextStyle = { color: '#ff5555', fontSize: 11, marginTop: 6, letterSpacing: '0.5px' }

function FieldWrap({ label, required, children, half, error }) {
  return (
    <div style={{ gridColumn: half ? 'span 1' : 'span 2' }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
        {label}{required && <span style={{ color: CYAN, marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && <p style={errorTextStyle}>{error}</p>}
    </div>
  )
}

function Inp({ name, value, onChange, onBlur, placeholder, type = 'text', error }) {
  const baseStyle = error ? { ...inputStyle, ...errorBorder } : inputStyle
  return (
    <input
      name={name} type={type} value={value} onChange={onChange} onBlur={onBlur}
      placeholder={placeholder} style={baseStyle}
      onFocus={e => { if (!error) Object.assign(e.target.style, focusStyle) }}
    />
  )
}

function Sel({ name, value, onChange, onBlur, options, error }) {
  const baseStyle = error
    ? { ...inputStyle, ...errorBorder, appearance: 'none', cursor: 'pointer' }
    : { ...inputStyle, appearance: 'none', cursor: 'pointer' }
  return (
    <select name={name} value={value} onChange={onChange} onBlur={onBlur} style={baseStyle}>
      {options.map(o => <option key={o} value={o} style={{ background: '#0a1a22' }}>{o}</option>)}
    </select>
  )
}

function Textarea({ name, value, onChange, onBlur, placeholder, rows = 6, error }) {
  const baseStyle = error
    ? { ...inputStyle, ...errorBorder, resize: 'vertical' }
    : { ...inputStyle, resize: 'vertical' }
  return (
    <textarea
      name={name} value={value} onChange={onChange} onBlur={onBlur} rows={rows}
      placeholder={placeholder} style={baseStyle}
      onFocus={e => { if (!error) Object.assign(e.target.style, focusStyle) }}
    />
  )
}

function TagPill({ label }) {
  return (
    <span style={{ display: 'inline-block', padding: '5px 14px', border: `1px solid rgba(0,210,200,0.4)`, color: CYAN, fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginRight: 8, marginBottom: 8 }}>
      {label}
    </span>
  )
}

function StepBar({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 48, position: 'relative' }}>
      <div style={{ position: 'absolute', top: '50%', left: 'calc(16.5% + 10px)', right: 'calc(16.5% + 10px)', height: 2, background: 'rgba(0,210,200,0.12)', transform: 'translateY(-50%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '50%', left: 'calc(16.5% + 10px)', width: `${current === 0 ? 0 : current === 1 ? 50 : 100}%`, height: 2, background: `linear-gradient(90deg,${CYAN},rgba(0,210,200,0.5))`, transform: 'translateY(-50%)', zIndex: 0, transition: 'width 0.6s ease' }} />
      {STEP_LABELS.map((s, i) => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: 1, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: i <= current ? CYAN : 'rgba(0,210,200,0.08)', border: `2px solid ${i <= current ? CYAN : 'rgba(0,210,200,0.2)'}`, boxShadow: i === current ? '0 0 16px rgba(0,210,200,0.6)' : 'none', transition: 'all 0.4s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {i < current  && <span style={{ fontSize: 10, fontWeight: 900, color: '#000' }}>✓</span>}
            {i === current && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#000', display: 'block' }} />}
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: i === current ? '#fff' : i < current ? CYAN : 'rgba(255,255,255,0.3)', transition: 'color 0.3s' }}>{s}</span>
        </div>
      ))}
    </div>
  )
}

function StepHeader({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
      <div style={{ width: 32, height: 3, background: CYAN, borderRadius: 2 }} />
      <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 18, color: '#fff', letterSpacing: '3px', textTransform: 'uppercase', margin: 0 }}>{children}</h2>
    </div>
  )
}

function NavButtons({ step, onBack, onNext, nextLabel, onPublish, onDraft }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, paddingTop: 28, borderTop: '1px solid rgba(0,210,200,0.1)' }}>
      <div>
        {step > 0 && (
          <button type="button" onClick={onBack} style={{ background: 'transparent', border: '1px solid rgba(0,210,200,0.2)', color: 'rgba(255,255,255,0.5)', padding: '12px 24px', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>← Back</button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {step === 2 && (
          <button type="button" onClick={onDraft} style={{ background: 'transparent', border: '1px solid rgba(0,210,200,0.25)', color: 'rgba(255,255,255,0.5)', padding: '12px 24px', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>Save as Draft</button>
        )}
        {step < 2 && (
          <button type="button" onClick={onNext} style={{ background: CYAN, color: '#000', border: 'none', padding: '13px 32px', fontSize: 12, fontWeight: 900, letterSpacing: '2.5px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Rajdhani',sans-serif" }}>{nextLabel} →</button>
        )}
        {step === 2 && (
          <button type="button" onClick={onPublish} style={{ background: CYAN, color: '#000', border: 'none', padding: '13px 36px', fontSize: 12, fontWeight: 900, letterSpacing: '2.5px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Rajdhani',sans-serif", boxShadow: '0 0 24px rgba(0,210,200,0.35)' }}>Publish Job →</button>
        )}
      </div>
    </div>
  )
}

export default function PostJob() {
  const navigate = useNavigate()
  const [step, setStep]           = useState(0)
  const [anim, setAnim]           = useState('in')
  const [published, setPublished] = useState(false)

 const formik = useFormik({
  initialValues: INITIAL_VALUES,
  validationSchema: jobSchema,
  onSubmit: async (values, { setSubmitting }) => {
    try {
      const payload = {
        ...values,
        requirements: values.requirements.split(',').map(s => s.trim()).filter(Boolean),
        skills:       values.skills.split(',').map(s => s.trim()).filter(Boolean),
      }
      await jobsApi.create(payload)
      setPublished(true)
      setTimeout(() => navigate('/employer-dashboard'), 1800)
    } catch (err) {
      alert('Failed to publish job: ' + err.message)
      setSubmitting(false)
    }
  },
})

  const goTo = n => {
    setAnim('out')
    setTimeout(() => { setStep(n); setAnim('in') }, 220)
  }

  const handleNext = async () => {
    const fieldsForStep = STEP_FIELDS[step]
    const errors = await formik.validateForm()
    fieldsForStep.forEach(f => formik.setFieldTouched(f, true, false))

    const stepHasErrors = fieldsForStep.some(f => errors[f])
    if (!stepHasErrors) goTo(step + 1)
  }

  const handleBack    = () => goTo(step - 1)
  const handlePublish = () => formik.handleSubmit()
  const handleDraft   = () => navigate('/employer-dashboard')

  const err = (field) => formik.touched[field] && formik.errors[field]

  const reqTags   = formik.values.requirements.split(',').map(s => s.trim()).filter(Boolean)
  const skillTags = formik.values.skills.split(',').map(s => s.trim()).filter(Boolean)

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Barlow',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700;900&family=Barlow:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder, select::placeholder { color: rgba(255,255,255,0.2) !important; }
        select option { background: #0a1a22; color: #fff; }
        @keyframes slideIn  { from{opacity:0;transform:translateX(30px)}  to{opacity:1;transform:none} }
        @keyframes slideOut { from{opacity:1;transform:translateX(0)}     to{opacity:0;transform:translateX(-30px)} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes popIn { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
        .step-in  { animation: slideIn  0.25s ease forwards; }
        .step-out { animation: slideOut 0.2s  ease forwards; }
      `}</style>

      <Particles fixed count={50} linkDistance={110} />

      {published && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(3,11,18,0.96)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <div style={{ fontSize: 72, animation: 'popIn 0.6s ease forwards' }}>🚀</div>
          <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 36, color: '#fff', letterSpacing: 2 }}>Job Published!</p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Redirecting to dashboard…</p>
          <div style={{ marginTop: 8, width: 48, height: 48, border: '3px solid rgba(0,210,200,0.2)', borderTopColor: CYAN, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}

      <Navbar variant="dashboard" />

      <form onSubmit={formik.handleSubmit} noValidate style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: CYAN, marginBottom: 10 }}>· EMPLOYER PORTAL ·</p>
          <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 40, color: '#fff', margin: '0 0 8px', letterSpacing: 1 }}>
            Post a <span style={{ color: CYAN }}>New Job</span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>Reach thousands of qualified candidates on TalentFlow.</p>
        </div>

        <StepBar current={step} />

        <div style={{ background: 'rgba(5,15,26,0.92)', border: '1px solid rgba(0,210,200,0.13)', borderRadius: 3, padding: '40px 44px', position: 'relative', backdropFilter: 'blur(14px)', boxShadow: '0 0 60px rgba(0,210,200,0.04), 0 20px 60px rgba(0,0,0,0.4)' }}>
          <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, background: `linear-gradient(90deg,transparent,${CYAN},transparent)` }} />

          <div className={anim === 'in' ? 'step-in' : 'step-out'}>
            {step === 0 && (
              <>
                <StepHeader>Basic Information</StepHeader>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <FieldWrap label="Job Title" required half error={err('title')}>
                    <Inp name="title" value={formik.values.title} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="e.g. Senior React Developer" error={err('title')} />
                  </FieldWrap>
                  <FieldWrap label="Company Name" required half error={err('company')}>
                    <Inp name="company" value={formik.values.company} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="e.g. Instabug" error={err('company')} />
                  </FieldWrap>
                  <FieldWrap label="Location" required half error={err('location')}>
                    <Inp name="location" value={formik.values.location} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="e.g. Cairo / Remote" error={err('location')} />
                  </FieldWrap>
                  <FieldWrap label="Job Type" required half error={err('type')}>
                    <Sel name="type" value={formik.values.type} onChange={formik.handleChange} onBlur={formik.handleBlur} options={JOB_TYPES} error={err('type')} />
                  </FieldWrap>
                  <FieldWrap label="Category" required half error={err('category')}>
                    <Sel name="category" value={formik.values.category} onChange={formik.handleChange} onBlur={formik.handleBlur} options={CATEGORIES} error={err('category')} />
                  </FieldWrap>
                  <FieldWrap label="Experience Level" required half error={err('experience')}>
                    <Sel name="experience" value={formik.values.experience} onChange={formik.handleChange} onBlur={formik.handleBlur} options={EXP_LEVELS} error={err('experience')} />
                  </FieldWrap>
                  <FieldWrap label="Salary Range (EGP / month)" required half error={err('salary')}>
                    <Inp name="salary" value={formik.values.salary} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="e.g. 15,000 – 25,000" error={err('salary')} />
                  </FieldWrap>
                  <FieldWrap label="Application Deadline" required half error={err('deadline')}>
                    <Inp name="deadline" type="date" value={formik.values.deadline} onChange={formik.handleChange} onBlur={formik.handleBlur} error={err('deadline')} />
                  </FieldWrap>
                </div>
                <NavButtons step={step} onNext={handleNext} nextLabel="Next: Job Details" />
              </>
            )}

            {step === 1 && (
              <>
                <StepHeader>Job Details</StepHeader>
                <div style={{ marginBottom: 20 }}>
                  <FieldWrap label={`Job Description (min. 50 characters — ${formik.values.description.length} typed)`} required error={err('description')}>
                    <Textarea name="description" value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Describe the role, responsibilities, company culture…" rows={7} error={err('description')} />
                  </FieldWrap>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(0,210,200,0.06)', border: '1px solid rgba(0,210,200,0.2)', marginBottom: 24 }}>
                  <span style={{ fontSize: 16 }}>💡</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                    <strong style={{ color: CYAN }}>TIP</strong> — enter comma-separated values below
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                  <FieldWrap label="Requirements" required error={err('requirements')}>
                    <Inp name="requirements" value={formik.values.requirements} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="React, TypeScript, 3+ years experience, Team player" error={err('requirements')} />
                    {reqTags.length > 0 && <div style={{ marginTop: 10 }}>{reqTags.map(t => <TagPill key={t} label={t} />)}</div>}
                  </FieldWrap>
                  <FieldWrap label="Skills" required error={err('skills')}>
                    <Inp name="skills" value={formik.values.skills} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="JavaScript, React, Node.js, Git" error={err('skills')} />
                    {skillTags.length > 0 && <div style={{ marginTop: 10 }}>{skillTags.map(t => <TagPill key={t} label={t} />)}</div>}
                  </FieldWrap>
                </div>
                <NavButtons step={step} onBack={handleBack} onNext={handleNext} nextLabel="Preview" />
              </>
            )}

            {step === 2 && (
              <>
                <StepHeader>Preview Your Listing</StepHeader>
                <div style={{ background: 'rgba(0,210,200,0.03)', border: '1px solid rgba(0,210,200,0.15)', padding: 28, marginBottom: 12, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${CYAN},transparent)` }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: CYAN, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 4 }}>{formik.values.company || 'Company Name'}</p>
                      <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 30, color: '#fff', margin: 0, letterSpacing: 1 }}>{formik.values.title || 'Job Title'}</h2>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 28, color: CYAN, margin: 0 }}>{formik.values.salary || '—'}</p>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, marginTop: 2 }}>EGP / MONTH</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 16 }}>📍 {formik.values.location || 'Location'}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                    {[formik.values.type, formik.values.category, formik.values.experience].filter(Boolean).map(t => (
                      <span key={t} style={{ padding: '5px 14px', border: `1px solid rgba(0,210,200,0.35)`, color: CYAN, fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{t}</span>
                    ))}
                  </div>
                  {formik.values.description && (
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: 18 }}>
                      {formik.values.description.slice(0, 200)}{formik.values.description.length > 200 ? '…' : ''}
                    </p>
                  )}
                  {skillTags.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                      {skillTags.map(s => (
                        <span key={s} style={{ padding: '4px 12px', background: 'rgba(0,210,200,0.08)', border: '1px solid rgba(0,210,200,0.2)', color: CYAN, fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>{s}</span>
                      ))}
                    </div>
                  )}
                  {formik.values.deadline && (
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>DEADLINE: {formik.values.deadline}</p>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 8 }}>
                  {[
                    { label: 'Basic Info',  done: !!(formik.values.title && formik.values.company && formik.values.location) },
                    { label: 'Job Details', done: formik.values.description.length >= 50 },
                    { label: 'Skills',      done: skillTags.length > 0 },
                  ].map(c => (
                    <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: c.done ? 'rgba(34,197,94,0.06)' : 'rgba(255,85,85,0.06)', border: `1px solid ${c.done ? 'rgba(34,197,94,0.2)' : 'rgba(255,85,85,0.2)'}` }}>
                      <span style={{ fontSize: 14 }}>{c.done ? '✅' : '⚠️'}</span>
                      <span style={{ fontSize: 12, color: c.done ? '#22c55e' : '#ff5555', fontWeight: 600 }}>{c.label}</span>
                    </div>
                  ))}
                </div>

                <NavButtons step={step} onBack={handleBack} onPublish={handlePublish} onDraft={handleDraft} />
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
