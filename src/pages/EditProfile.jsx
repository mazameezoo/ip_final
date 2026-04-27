import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Navbar from '../components/Navbar'
import Particles from '../components/Particles'
import { CYAN, BG } from '../utils/theme'
import { profileApi } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;600;700&family=Rajdhani:wght@700;900&display=swap'

const DEFAULT_INFO = {
  name:     'Mazen Mohamed',
  headline: 'Full-Stack Developer',
  location: 'New Cairo, Cairo, Egypt',
  school:   'The British University in Egypt',
  about:    'Passionate full-stack developer specialising in React, Node.js, and cloud-native architecture.',
}

const DEFAULT_EXP = [
  { id: 1, title: 'Full-Stack Developer', company: 'Freelance', period: '2023 – Present' },
  { id: 2, title: 'Frontend Intern',      company: 'Instabug',  period: '2022 – 2023' },
]

const DEFAULT_EDU = [
  { id: 1, degree: 'BSc Computer Science', school: 'The British University in Egypt', year: '2024' },
]

const DEFAULT_SKILLS = ['React', 'TypeScript', 'Node.js', 'Next.js', 'PostgreSQL', 'Docker', 'AWS', 'Python']

const DEFAULT_LINKS = [
  { id: 1, title: 'GitHub',    url: 'https://github.com/' },
  { id: 2, title: 'Portfolio', url: 'https://' },
]

const URL_REGEX = /^https?:\/\/.+\..+/

const infoSchema = Yup.object({
  name:     Yup.string().trim().min(2, 'Name too short').max(60, 'Name too long').required('Full name is required'),
  headline: Yup.string().trim().min(3, 'Headline too short').max(80, 'Headline too long').required('Headline is required'),
  location: Yup.string().trim().min(2, 'Location too short').required('Location is required'),
  school:   Yup.string().trim().min(2, 'School name too short').required('School is required'),
  about:    Yup.string().trim().min(20, 'Bio must be at least 20 characters').max(500, 'Bio must be under 500 characters').required('Bio is required'),
})

const expSchema = Yup.object({
  title:   Yup.string().trim().min(2, 'Role too short').required('Role is required'),
  company: Yup.string().trim().min(2, 'Company too short').required('Company is required'),
  period:  Yup.string().trim().required('Period is required'),
})

const eduSchema = Yup.object({
  degree: Yup.string().trim().min(2, 'Degree too short').required('Degree is required'),
  school: Yup.string().trim().min(2, 'School too short').required('School is required'),
  year:   Yup.string().trim().required('Year is required'),
})

const skillSchema = Yup.object({
  name: Yup.string().trim().min(1, 'Skill name required').max(30, 'Skill name too long').required('Skill is required'),
})

const linkSchema = Yup.object({
  title: Yup.string().trim().min(2, 'Title too short').required('Title is required'),
  url:   Yup.string().trim().matches(URL_REGEX, 'Must be a valid URL (https://...)').required('URL is required'),
})

const loadProfile = () => {
  try { return JSON.parse(localStorage.getItem('tf_profile') || '{}') }
  catch { return {} }
}

const errorTextStyle = {
  color: '#ff5555',
  fontSize: 11,
  marginTop: 4,
  letterSpacing: '0.5px',
}

const Section = ({ title, icon, children }) => (
  <div style={{
    background: 'rgba(5,15,26,0.9)', border: '1px solid rgba(0,210,200,0.13)',
    backdropFilter: 'blur(14px)', borderRadius: 3, marginBottom: 16, position: 'relative',
    boxShadow: '0 0 40px rgba(0,210,200,0.04)',
  }}>
    <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(0,210,200,0.4),transparent)' }} />
    <div className="ep-section-pad">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 15, color: '#fff', letterSpacing: '3px', textTransform: 'uppercase', margin: 0 }}>{title}</p>
      </div>
      {children}
    </div>
  </div>
)

const FieldInput = ({ label, name, value, onChange, onBlur, placeholder, type = 'text', multiline, error }) => {
  const baseStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${error ? '#ff5555' : 'rgba(0,210,200,0.18)'}`,
    padding: '10px 14px',
    fontSize: 13,
    color: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    borderRadius: 2,
  }
  return (
    <div style={{ marginBottom: 0 }}>
      {label && <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 7 }}>{label}</p>}
      {multiline
        ? <textarea name={name} value={value} onChange={onChange} onBlur={onBlur} rows={3} placeholder={placeholder}
            style={{ ...baseStyle, resize: 'none' }} />
        : <input name={name} type={type} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder}
            style={baseStyle}
            onFocus={e => { if (!error) e.target.style.borderColor = CYAN }}
            onBlurCapture={e => { if (!error) e.target.style.borderColor = 'rgba(0,210,200,0.18)' }} />
      }
      {error && <p style={errorTextStyle}>{error}</p>}
    </div>
  )
}

const Tag = ({ label, onRemove }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid rgba(0,210,200,0.3)`, color: CYAN, padding: '4px 10px', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
    {label}
    <button onClick={onRemove} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
  </span>
)

const AddRow = ({ children, onAdd, disabled }) => (
  <div className="ep-add-row" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
    <div className="ep-add-row-fields" style={{ flex: 1, display: 'flex', gap: 10, flexWrap: 'wrap' }}>{children}</div>
    <button type="button" onClick={onAdd} disabled={disabled}
      className="ep-add-btn"
      style={{ background: CYAN, color: '#000', border: 'none', padding: '10px 20px', fontSize: 11, fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, flexShrink: 0, fontFamily: "'Rajdhani',sans-serif", marginTop: 18 }}>
      + Add
    </button>
  </div>
)

const Item = ({ children, onDelete }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(0,210,200,0.04)', border: '1px solid rgba(0,210,200,0.1)', marginTop: 10 }}>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    <button onClick={onDelete} style={{ background: 'none', border: 'none', color: 'rgba(255,100,100,0.6)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0, flexShrink: 0 }}
      onMouseEnter={e => e.currentTarget.style.color = '#ff5555'}
      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,100,100,0.6)'}>
      ✕
    </button>
  </div>
)

export default function EditProfile() {
  const navigate = useNavigate()
  const cvRef = useRef(null)
  const { user } = useAuth()

  const [loading,   setLoading]   = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [savedFlag, setSavedFlag] = useState(false)

  const [cv,     setCv]     = useState(null)
  const [cvName, setCvName] = useState(null)
  const [exp,    setExp]    = useState([])
  const [edu,    setEdu]    = useState([])
  const [skills, setSkills] = useState([])
  const [links,  setLinks]  = useState([])
  const [initialInfo, setInitialInfo] = useState({
    name:     '',
    headline: '',
    location: '',
    school:   '',
    about:    '',
  })

  useEffect(() => {
    let cancelled = false
    const fetchProfile = async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const data = await profileApi.getMe()
        if (cancelled) return
        const fullName = data.user
          ? `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim()
          : ''
        setInitialInfo({
          name:     fullName || DEFAULT_INFO.name,
          headline: data.headline || '',
          location: data.location || '',
          school:   data.school   || '',
          about:    data.about    || '',
        })
        setExp((data.experience || []).map(e => ({ id: e._id, title: e.title, company: e.company, period: e.period })))
        setEdu((data.education  || []).map(e => ({ id: e._id, degree: e.degree, school: e.school, year: e.year })))
        setSkills(data.skills || [])
        setLinks((data.links || []).map(l => ({ id: l._id, title: l.title, url: l.url })))
        setCv(data.cvUrl || null)
        setCvName(data.cvName || null)
      } catch (err) {
        if (!cancelled) setLoadError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchProfile()
    return () => { cancelled = true }
  }, [])

  const infoFormik = useFormik({
    enableReinitialize: true,
    initialValues: initialInfo,
    validationSchema: infoSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await profileApi.updateMe({
          headline: values.headline,
          location: values.location,
          school:   values.school,
          about:    values.about,
        })
        setSavedFlag(true)
        setTimeout(() => { setSavedFlag(false); navigate('/profile') }, 1200)
      } catch (err) {
        alert('Failed to save: ' + err.message)
        setSubmitting(false)
      }
    },
  })

  const expFormik = useFormik({
    initialValues: { title: '', company: '', period: '' },
    validationSchema: expSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const created = await profileApi.addExperience(values)
        setExp(ex => [...ex, { id: created._id, ...values }])
        resetForm()
      } catch (err) {
        alert('Failed to add experience: ' + err.message)
      } finally {
        setSubmitting(false)
      }
    },
  })

  const eduFormik = useFormik({
    initialValues: { degree: '', school: '', year: '' },
    validationSchema: eduSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const created = await profileApi.addEducation(values)
        setEdu(ed => [...ed, { id: created._id, ...values }])
        resetForm()
      } catch (err) {
        alert('Failed to add education: ' + err.message)
      } finally {
        setSubmitting(false)
      }
    },
  })

  const skillFormik = useFormik({
    initialValues: { name: '' },
    validationSchema: skillSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      const trimmed = values.name.trim()
      if (!trimmed || skills.includes(trimmed)) {
        resetForm()
        setSubmitting(false)
        return
      }
      try {
        const res = await profileApi.addSkill(trimmed)
        setSkills(res.skills || [...skills, trimmed])
        resetForm()
      } catch (err) {
        alert('Failed to add skill: ' + err.message)
      } finally {
        setSubmitting(false)
      }
    },
  })

  const linkFormik = useFormik({
    initialValues: { title: '', url: '' },
    validationSchema: linkSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const created = await profileApi.addLink(values)
        setLinks(l => [...l, { id: created._id, ...values }])
        resetForm()
      } catch (err) {
        alert('Failed to add link: ' + err.message)
      } finally {
        setSubmitting(false)
      }
    },
  })

  const removeEducation = async (id) => {
    const previous = edu
    setEdu(ed => ed.filter(x => x.id !== id))
    try {
      await profileApi.deleteEducation(id)
    } catch (err) {
      setEdu(previous)
      alert('Failed to remove: ' + err.message)
    }
  }

  const removeExperience = async (id) => {
    const previous = exp
    setExp(ex => ex.filter(x => x.id !== id))
    try {
      await profileApi.deleteExperience(id)
    } catch (err) {
      setExp(previous)
      alert('Failed to remove: ' + err.message)
    }
  }

  const removeSkill = async (skill) => {
    const previous = skills
    setSkills(sk => sk.filter(x => x !== skill))
    try {
      const res = await profileApi.deleteSkill(skill)
      setSkills(res.skills || skills.filter(x => x !== skill))
    } catch (err) {
      setSkills(previous)
      alert('Failed to remove: ' + err.message)
    }
  }

  const removeLink = async (id) => {
    const previous = links
    setLinks(lk => lk.filter(x => x.id !== id))
    try {
      await profileApi.deleteLink(id)
    } catch (err) {
      setLinks(previous)
      alert('Failed to remove: ' + err.message)
    }
  }

  const handleCvUpload = (e) => {
    const file = e.target.files[0]
    if (file) { setCv(file.name); setCvName(file.name) }
  }

  const infoErr = (f)  => infoFormik.touched[f]  && infoFormik.errors[f]
  const expErr = (f)   => expFormik.touched[f]   && expFormik.errors[f]
  const eduErr = (f)   => eduFormik.touched[f]   && eduFormik.errors[f]
  const skillErr = (f) => skillFormik.touched[f] && skillFormik.errors[f]
  const linkErr = (f)  => linkFormik.touched[f]  && linkFormik.errors[f]

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Barlow',sans-serif" }}>
      <style>{`
        @import url('${FONTS_URL}');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,210,200,0.3); }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2) !important; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        .fu { animation: fadeUp 0.4s ease forwards; }

        .ep-page         { padding: 32px 20px 60px; }
        .ep-section-pad  { padding: 20px 24px 24px; }
        .ep-title        { font-size: 36px; }
        .ep-info-grid    { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .ep-actions      { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }

        @media (max-width: 768px) {
          .ep-page         { padding: 18px 12px 40px; }
          .ep-section-pad  { padding: 16px 16px 18px; }
          .ep-title        { font-size: 26px; }
          .ep-info-grid    { grid-template-columns: 1fr; gap: 12px; }
          .ep-add-row      { flex-direction: column; align-items: stretch; }
          .ep-add-row-fields > div { flex: 1 1 100% !important; min-width: 100% !important; width: 100% !important; }
          .ep-add-btn      { margin-top: 4px !important; width: 100%; }
          .ep-actions      { flex-direction: column-reverse; }
          .ep-actions button { width: 100% !important; }
        }

        @media (max-width: 480px) {
          .ep-title        { font-size: 22px; }
        }
      `}</style>

      <Particles fixed count={50} linkDistance={110} />

      <Navbar variant="dashboard" />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }} className="fu ep-page">

        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: CYAN, marginBottom: 6 }}>· PROFILE MANAGEMENT ·</p>
        <h1 className="ep-title" style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, color: '#fff', margin: '0 0 28px', letterSpacing: 1 }}>
          Edit Your <span style={{ color: CYAN }}>Profile</span>
        </h1>

        {loading && (
          <div style={{ background: 'rgba(5,15,26,0.9)', border: '1px solid rgba(0,210,200,0.13)', padding: 30, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13, letterSpacing: 1, marginBottom: 16 }}>
            Loading your profile…
          </div>
        )}

        {!loading && loadError && (
          <div style={{ background: 'rgba(255,85,85,0.08)', border: '1px solid rgba(255,85,85,0.3)', padding: 16, marginBottom: 16, color: '#ff5555', fontSize: 13 }}>
            ⚠️ Could not load profile: {loadError}
          </div>
        )}

        <form onSubmit={infoFormik.handleSubmit} noValidate>

          <Section title="Basic Info" icon="👤">
            <div className="ep-info-grid">
              <FieldInput label="Full Name"    name="name"     value={infoFormik.values.name}     onChange={infoFormik.handleChange} onBlur={infoFormik.handleBlur} placeholder="Your full name"            error={infoErr('name')} />
              <FieldInput label="Headline"     name="headline" value={infoFormik.values.headline} onChange={infoFormik.handleChange} onBlur={infoFormik.handleBlur} placeholder="e.g. Full-Stack Developer" error={infoErr('headline')} />
              <FieldInput label="Location"     name="location" value={infoFormik.values.location} onChange={infoFormik.handleChange} onBlur={infoFormik.handleBlur} placeholder="e.g. Cairo, Egypt"          error={infoErr('location')} />
              <FieldInput label="School / University" name="school"   value={infoFormik.values.school}   onChange={infoFormik.handleChange} onBlur={infoFormik.handleBlur} placeholder="e.g. Cairo University" error={infoErr('school')} />
            </div>
            <div>
              <FieldInput label="About / Bio" name="about" value={infoFormik.values.about} onChange={infoFormik.handleChange} onBlur={infoFormik.handleBlur} placeholder="Tell recruiters about yourself…" multiline error={infoErr('about')} />
            </div>
          </Section>

          <Section title="CV / Resume" icon="📄">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <button type="button" onClick={() => cvRef.current?.click()}
                style={{ background: CYAN, color: '#000', border: 'none', padding: '10px 24px', fontSize: 11, fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Rajdhani',sans-serif" }}>
                📤 Upload CV
              </button>
              <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleCvUpload} />
              {cvName
                ? <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: 'rgba(0,210,200,0.08)', border: '1px solid rgba(0,210,200,0.2)' }}>
                    <span style={{ fontSize: 16 }}>📎</span>
                    <span style={{ fontSize: 13, color: CYAN, fontWeight: 600 }}>{cvName}</span>
                    <button type="button" onClick={() => { setCv(null); setCvName(null) }} style={{ background: 'none', border: 'none', color: 'rgba(255,100,100,0.6)', cursor: 'pointer', fontSize: 16 }}>×</button>
                  </div>
                : <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>PDF, DOC, DOCX — Max 5MB</p>
              }
            </div>
          </Section>

          <Section title="Education" icon="🎓">
            <AddRow onAdd={eduFormik.handleSubmit} disabled={!eduFormik.isValid || !eduFormik.dirty}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <FieldInput name="degree" value={eduFormik.values.degree} onChange={eduFormik.handleChange} onBlur={eduFormik.handleBlur} placeholder="Degree" error={eduErr('degree')} />
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <FieldInput name="school" value={eduFormik.values.school} onChange={eduFormik.handleChange} onBlur={eduFormik.handleBlur} placeholder="School" error={eduErr('school')} />
              </div>
              <div style={{ width: 100 }}>
                <FieldInput name="year" value={eduFormik.values.year} onChange={eduFormik.handleChange} onBlur={eduFormik.handleBlur} placeholder="Year" error={eduErr('year')} />
              </div>
            </AddRow>
            {edu.map(e => (
              <Item key={e.id} onDelete={() => removeEducation(e.id)}>
                <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 14, color: '#fff', margin: 0 }}>{e.degree}</p>
                <p style={{ fontSize: 12, color: CYAN, margin: '2px 0 0' }}>{e.school} {e.year && `· ${e.year}`}</p>
              </Item>
            ))}
          </Section>

          <Section title="Experience" icon="💼">
            <AddRow onAdd={expFormik.handleSubmit} disabled={!expFormik.isValid || !expFormik.dirty}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <FieldInput name="title" value={expFormik.values.title} onChange={expFormik.handleChange} onBlur={expFormik.handleBlur} placeholder="Role" error={expErr('title')} />
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <FieldInput name="company" value={expFormik.values.company} onChange={expFormik.handleChange} onBlur={expFormik.handleBlur} placeholder="Company" error={expErr('company')} />
              </div>
              <div style={{ width: 130 }}>
                <FieldInput name="period" value={expFormik.values.period} onChange={expFormik.handleChange} onBlur={expFormik.handleBlur} placeholder="Period" error={expErr('period')} />
              </div>
            </AddRow>
            {exp.map(e => (
              <Item key={e.id} onDelete={() => removeExperience(e.id)}>
                <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 14, color: '#fff', margin: 0 }}>{e.title}</p>
                <p style={{ fontSize: 12, color: CYAN, margin: '2px 0 0' }}>{e.company} {e.period && `· ${e.period}`}</p>
              </Item>
            ))}
          </Section>

          <Section title="Skills" icon="⚡">
            <AddRow onAdd={skillFormik.handleSubmit} disabled={!skillFormik.isValid || !skillFormik.dirty}>
              <div style={{ flex: 1 }}>
                <FieldInput name="name" value={skillFormik.values.name} onChange={skillFormik.handleChange} onBlur={skillFormik.handleBlur} placeholder="e.g. React, Docker, Python…" error={skillErr('name')} />
              </div>
            </AddRow>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
              {skills.map(s => <Tag key={s} label={s} onRemove={() => removeSkill(s)} />)}
            </div>
          </Section>

          <Section title="Portfolio Links" icon="🔗">
            <AddRow onAdd={linkFormik.handleSubmit} disabled={!linkFormik.isValid || !linkFormik.dirty}>
              <div style={{ width: 160 }}>
                <FieldInput name="title" value={linkFormik.values.title} onChange={linkFormik.handleChange} onBlur={linkFormik.handleBlur} placeholder="Title" error={linkErr('title')} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <FieldInput name="url" value={linkFormik.values.url} onChange={linkFormik.handleChange} onBlur={linkFormik.handleBlur} placeholder="https://..." error={linkErr('url')} />
              </div>
            </AddRow>
            {links.map(l => (
              <Item key={l.id} onDelete={() => removeLink(l.id)}>
                <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', margin: 0 }}>{l.title}</p>
                <a href={l.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: CYAN, margin: '2px 0 0', display: 'block', wordBreak: 'break-all' }}>{l.url}</a>
              </Item>
            ))}
          </Section>

          <div className="ep-actions">
            <button type="button" onClick={() => navigate('/profile')} style={{ border: '1px solid rgba(0,210,200,0.2)', color: 'rgba(255,255,255,0.45)', background: 'transparent', padding: '12px 28px', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit"
              disabled={infoFormik.isSubmitting}
              style={{ background: savedFlag ? '#22c55e' : CYAN, color: '#000', border: 'none', padding: '12px 36px', fontSize: 13, fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Rajdhani',sans-serif", transition: 'background 0.3s' }}>
              {savedFlag ? '✓ Saved!' : 'Save All Changes →'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}