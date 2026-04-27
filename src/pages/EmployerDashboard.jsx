import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobsApi, applicationsApi } from '../utils/api'

const CYAN = '#00d2c8'
const BG   = '#030b12'


const mapJob = (j) => ({
  id:         j._id,
  title:      j.title,
  dept:       j.category,
  location:   j.location,
  type:       j.type,
  status:     j.status === 'active' ? 'Active' : 'Inactive',
  applicants: j.applicants || 0,

  raw:        j,
})

const mapApp = (a) => {
  const created = a.createdAt ? new Date(a.createdAt) : null
  const dateStr = created ? created.toISOString().slice(0, 10) : ''
  const fullName = a.candidate
    ? `${a.candidate.firstName || ''} ${a.candidate.lastName || ''}`.trim() || a.candidate.email
    : 'Unknown'
  return {
    id:     a._id,
    name:   fullName,
    email:  a.candidate?.email || '',
    role:   a.job?.title || 'Unknown role',
    exp:    'N/A',
    date:   dateStr,
    status: a.status,
    score:  a.matchScore || 0,
    raw:    a,
  }
}

const STATUS_COLORS = {
  Active:    { bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)',   text: '#22c55e' },
  Inactive:  { bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.3)', text: '#64748b' },
  New:       { bg: 'rgba(0,210,200,0.1)',     border: 'rgba(0,210,200,0.3)',   text: CYAN      },
  Review:    { bg: 'rgba(251,191,36,0.1)',    border: 'rgba(251,191,36,0.3)',  text: '#fbbf24' },
  Interview: { bg: 'rgba(139,92,246,0.1)',    border: 'rgba(139,92,246,0.3)', text: '#8b5cf6' },
  Hired:     { bg: 'rgba(34,197,94,0.12)',    border: 'rgba(34,197,94,0.3)',   text: '#22c55e' },
  Rejected:  { bg: 'rgba(239,68,68,0.1)',     border: 'rgba(239,68,68,0.3)',   text: '#ef4444' },
}

const JOBS_DATA = []

const APPS_DATA = []

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
    const pts = Array.from({ length: 50 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.2 + 0.4,
    }))
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > c.width) p.vx *= -1
        if (p.y < 0 || p.y > c.height) p.vy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,210,200,0.4)'; ctx.fill()
      })
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < 100) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(0,210,200,${0.07 * (1 - d / 100)})`
          ctx.lineWidth = 0.5; ctx.stroke()
        }
      }))
      id = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: 'rgba(5,15,26,0.9)', border: '1px solid rgba(0,210,200,0.13)', borderRadius: 3, backdropFilter: 'blur(14px)', position: 'relative', boxShadow: '0 0 30px rgba(0,210,200,0.04)', ...style }}>
      <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(0,210,200,0.35),transparent)' }} />
      {children}
    </div>
  )
}

function Counter({ target, color = CYAN }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let startTime = null
    const dur = 1200
    const step = ts => {
      if (!startTime) startTime = ts
      const p = Math.min((ts - startTime) / dur, 1)
      setVal(Math.round(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    const t = setTimeout(() => requestAnimationFrame(step), 300)
    return () => clearTimeout(t)
  }, [target])
  return <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 44, color, lineHeight: 1 }}>{val}</span>
}

function Badge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.New
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '4px 10px', background: c.bg, border: `1px solid ${c.border}`, color: c.text, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  )
}

function ToggleSwitch({ defaultOn }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      onClick={() => setOn(v => !v)}
      style={{ width: 44, height: 24, borderRadius: 12, background: on ? CYAN : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}
    >
      <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.25s', display: 'block' }} />
    </button>
  )
}

function PostJobModal({ onClose, onPost }) {
  const [form, setForm] = useState({ title: '', dept: '', location: '', type: 'Full-time', desc: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const inp = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,210,200,0.18)', padding: '10px 13px', fontSize: 13, color: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', borderRadius: 2 }
  const lbl = { fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 7, display: 'block' }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div style={{ width: '100%', maxWidth: 560, margin: '0 16px', background: 'rgba(3,11,18,0.99)', border: '1px solid rgba(0,210,200,0.2)', borderRadius: 3, boxShadow: '0 0 60px rgba(0,210,200,0.08)', animation: 'fadeUp 0.3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid rgba(0,210,200,0.1)' }}>
          <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: '3px', textTransform: 'uppercase', margin: 0 }}>Post a New Job</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div><label style={lbl}>Job Title</label><input value={form.title} onChange={set('title')} placeholder="e.g. Senior React Developer" style={inp} /></div>
            <div><label style={lbl}>Department</label><input value={form.dept} onChange={set('dept')} placeholder="e.g. Engineering" style={inp} /></div>
            <div><label style={lbl}>Location</label><input value={form.location} onChange={set('location')} placeholder="e.g. Cairo / Remote" style={inp} /></div>
            <div>
              <label style={lbl}>Type</label>
              <select value={form.type} onChange={set('type')} style={{ ...inp, appearance: 'none' }}>
                {['Full-time', 'Part-time', 'Contract', 'Remote'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Job Description</label>
            <textarea value={form.desc} onChange={set('desc')} rows={4} placeholder="Describe the role, requirements, and responsibilities…" style={{ ...inp, resize: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ border: '1px solid rgba(0,210,200,0.2)', color: 'rgba(255,255,255,0.4)', background: 'transparent', padding: '10px 22px', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => { if (form.title) { onPost(form); onClose() } }} style={{ background: CYAN, color: '#000', border: 'none', padding: '10px 28px', fontSize: 11, fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Rajdhani',sans-serif" }}>
              Publish Job →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppModal({ app, onClose, onStatus }) {
  const statuses = ['New', 'Review', 'Interview', 'Hired', 'Rejected']
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div style={{ width: '100%', maxWidth: 480, margin: '0 16px', background: 'rgba(3,11,18,0.99)', border: '1px solid rgba(0,210,200,0.2)', borderRadius: 3, animation: 'fadeUp 0.3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid rgba(0,210,200,0.1)' }}>
          <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: '3px', textTransform: 'uppercase', margin: 0 }}>Applicant</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg,${CYAN},#0077aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: "'Rajdhani',sans-serif" }}>
              {app.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 20, color: '#fff', margin: 0 }}>{app.name}</p>
              <p style={{ fontSize: 13, color: CYAN, margin: '3px 0 0' }}>{app.role}</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 28, color: app.score >= 85 ? '#22c55e' : app.score >= 70 ? CYAN : '#fbbf24', margin: 0 }}>{app.score}%</p>
              <p style={{ fontSize: 9, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>AI Match</p>
            </div>
          </div>

          {[['Experience', app.exp], ['Applied', app.date]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(0,210,200,0.07)' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{k}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{v}</span>
            </div>
          ))}

          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>Update Status</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {statuses.map(s => {
              const c = STATUS_COLORS[s]
              return (
                <button key={s} onClick={() => onStatus(app.id, s)}
                  style={{ padding: '7px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', background: app.status === s ? c.bg : 'transparent', border: `1px solid ${app.status === s ? c.border : 'rgba(255,255,255,0.1)'}`, color: app.status === s ? c.text : 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {s}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, background: 'rgba(0,210,200,0.08)', border: '1px solid rgba(0,210,200,0.25)', color: CYAN, padding: '10px', fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer' }}>
              🎙 Invite to Interview
            </button>
            <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', padding: '10px', fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EmployerDashboard() {
  const navigate = useNavigate()
  const [jobs,        setJobs]        = useState(JOBS_DATA)
  const [jobsLoading, setJobsLoading] = useState(true)
  const [jobsError,   setJobsError]   = useState(null)
  const [apps,        setApps]        = useState(APPS_DATA)
  const [appsLoading, setAppsLoading] = useState(true)
  const [appsError,   setAppsError]   = useState(null)
  const [jobFilter,   setJobFilter]   = useState('All')
  const [appFilter,   setAppFilter]   = useState('All')
  const [jobSearch,   setJobSearch]   = useState('')
  const [appSearch,   setAppSearch]   = useState('')
  const [showPost,    setShowPost]    = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [activeTab,   setActiveTab]   = useState('dashboard')
  const [settingsTab, setSettingsTab] = useState('company')

  useEffect(() => {
    let cancelled = false
    const fetchJobs = async () => {
      setJobsLoading(true)
      setJobsError(null)
      try {
        const data = await jobsApi.getMyListings()
        if (!cancelled) setJobs(data.map(mapJob))
      } catch (err) {
        if (!cancelled) setJobsError(err.message)
      } finally {
        if (!cancelled) setJobsLoading(false)
      }
    }
    fetchJobs()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    const fetchApps = async () => {
      setAppsLoading(true)
      setAppsError(null)
      try {
        const data = await applicationsApi.getForEmployer()
        if (!cancelled) setApps(data.map(mapApp))
      } catch (err) {
        if (!cancelled) setAppsError(err.message)
      } finally {
        if (!cancelled) setAppsLoading(false)
      }
    }
    fetchApps()
    return () => { cancelled = true }
  }, [])

  const activeJobs  = jobs.filter(j => j.status === 'Active').length
  const totalApps   = apps.length
  const newThisWeek = apps.filter(a => a.status === 'New').length
  const interviews  = apps.filter(a => a.status === 'Interview').length

  const filteredJobs = jobs
    .filter(j => jobFilter === 'All' || j.status === jobFilter)
    .filter(j => !jobSearch || j.title.toLowerCase().includes(jobSearch.toLowerCase()))

  const filteredApps = apps
    .filter(a => appFilter === 'All' || a.status === appFilter)
    .filter(a => !appSearch || a.name.toLowerCase().includes(appSearch.toLowerCase()) || a.role.toLowerCase().includes(appSearch.toLowerCase()))

  const postJob = form => setJobs(prev => [{ id: Date.now(), ...form, status: 'Active', applicants: 0 }, ...prev])

  const updateAppStatus = async (id, status) => {
    const previous = apps
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    if (selectedApp?.id === id) setSelectedApp(a => ({ ...a, status }))
    try {
      await applicationsApi.updateStatus(id, status)
    } catch (err) {
      setApps(previous)
      alert('Failed to update status: ' + err.message)
    }
  }

  const STAT_CARDS = [
    { label: 'Active Jobs',      value: activeJobs,  icon: '💼', color: CYAN,      note: 'Currently hiring'    },
    { label: 'Total Applicants', value: totalApps,   icon: '👥', color: '#00a8ff', note: 'All time'             },
    { label: 'New This Week',    value: newThisWeek, icon: '⭐', color: '#fbbf24', note: 'Awaiting review'     },
    { label: 'Interviews',       value: interviews,  icon: '🎙', color: '#8b5cf6', note: 'Scheduled this month' },
  ]

  const SETTINGS_MENU = [
    { id: 'company',  label: 'Company Profile', icon: '🏢' },
    { id: 'notif',    label: 'Notifications',   icon: '🔔' },
    { id: 'billing',  label: 'Billing & Plan',  icon: '💳' },
    { id: 'team',     label: 'Team Members',    icon: '👥' },
    { id: 'security', label: 'Security',        icon: '🔒' },
  ]

  const NOTIF_ITEMS = [
    { label: 'New application received',   desc: 'Get notified when someone applies',    on: true  },
    { label: 'Application status changed', desc: 'When an applicant moves stages',        on: true  },
    { label: 'Interview reminders',        desc: '24h before scheduled interviews',       on: true  },
    { label: 'Weekly hiring report',       desc: 'Summary every Monday morning',          on: false },
    { label: 'Job post expiring',          desc: '48h before deadline',                   on: true  },
    { label: 'New message from applicant', desc: 'When a candidate sends a message',      on: false },
  ]

  const BILLING_PLANS = [
    { name: 'Starter', price: 'Free',       features: ['3 job posts', 'Basic matching', 'Email support'] },
    { name: 'Pro',     price: 'EGP 2,500',  features: ['Unlimited posts', 'AI matching', 'Interview rooms', 'Priority support'], current: true },
    { name: 'Scale',   price: 'EGP 7,000',  features: ['Everything in Pro', 'Dedicated account manager', 'Custom branding', 'API access'] },
  ]

  const TEAM_MEMBERS = [
    { name: 'Sara Ahmed',  role: 'Admin',     email: 'sara@techcorp.com', avatar: 'SA' },
    { name: 'Omar Khaled', role: 'Recruiter', email: 'omar@techcorp.com', avatar: 'OK' },
    { name: 'Lina Samir',  role: 'Recruiter', email: 'lina@techcorp.com', avatar: 'LS' },
  ]

  const COMPANY_FIELDS = [
    ['Company Name', 'TechCorp Inc.'], ['Industry', 'Technology'],
    ['Company Size', '50–200 employees'], ['Website', 'https://techcorp.com'],
    ['HQ Location', 'Cairo, Egypt'], ['Founded', '2018'],
  ]

  const PIPELINE_STAGES = ['New', 'Review', 'Interview', 'Hired', 'Rejected']

  const ANALYTICS_SPARKLINES = [
    { label: 'Applicants / Week', data: [3,5,4,8,6,11,9,13],       color: CYAN,       peak: '13' },
    { label: 'Views / Week',      data: [20,28,24,35,30,42,38,52], color: '#00a8ff',  peak: '52' },
    { label: 'Hired / Month',     data: [0,1,1,2,1,2,2,3],         color: '#22c55e',  peak: '3'  },
  ]

  const ANALYTICS_SUMMARY = [
    { label: 'Avg Match Score',  value: apps.length ? `${Math.round(apps.reduce((a,b) => a + b.score, 0) / apps.length)}%` : '0%', color: CYAN,      note: 'AI-powered'          },
    { label: 'Offer Rate',       value: apps.length ? `${Math.round((apps.filter(a => a.status === 'Hired').length / apps.length) * 100)}%` : '0%',    color: '#22c55e', note: 'Hired / Total'       },
    { label: 'Rejection Rate',   value: apps.length ? `${Math.round((apps.filter(a => a.status === 'Rejected').length / apps.length) * 100)}%` : '0%', color: '#ef4444', note: 'Rejected / Total'    },
    { label: 'Interview Rate',   value: apps.length ? `${Math.round((apps.filter(a => a.status === 'Interview').length / apps.length) * 100)}%` : '0%',color: '#8b5cf6', note: 'Reached interview'   },
  ]

  const navStyle    = { padding: '6px 14px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s', marginLeft: 8 }
  const filterStyle = active => ({ padding: '4px 12px', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', background: active ? 'rgba(0,210,200,0.12)' : 'transparent', border: `1px solid ${active ? CYAN : 'rgba(0,210,200,0.15)'}`, color: active ? CYAN : 'rgba(255,255,255,0.3)', cursor: 'pointer' })

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Barlow',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700;900&family=Barlow:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,210,200,0.3); }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2) !important; }
        select option { background: #0a1a22; color: #fff; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }
        .fu { animation: fadeUp 0.4s ease forwards; }
        .si { animation: slideIn 0.3s ease forwards; }
      `}</style>

      <Particles />
      {showPost    && <PostJobModal onClose={() => setShowPost(false)} onPost={postJob} />}
      {selectedApp && <AppModal app={selectedApp} onClose={() => setSelectedApp(null)} onStatus={updateAppStatus} />}

      <nav style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(3,11,18,0.97)', borderBottom: '1px solid rgba(0,210,200,0.1)', backdropFilter: 'blur(16px)' }}>
        <div style={{ position: 'absolute', top: 0, left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(0,210,200,0.4),transparent)' }} />
        <div style={{ maxWidth: 1500, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 22, letterSpacing: 2 }}>
              <span style={{ color: '#fff' }}>TALENT</span><span style={{ color: CYAN }}>FLOW</span>
            </div>
            <div style={{ width: 1, height: 16, background: 'rgba(0,210,200,0.2)' }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Employer Dashboard</span>
            {['dashboard', 'analytics', 'settings'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ ...navStyle, color: activeTab === t ? CYAN : 'rgba(255,255,255,0.3)', borderBottom: activeTab === t ? `2px solid ${CYAN}` : '2px solid transparent' }}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/dashboard')} style={{ border: '1px solid rgba(0,210,200,0.2)', color: 'rgba(255,255,255,0.4)', background: 'transparent', padding: '6px 14px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>← Candidate View</button>
            <button onClick={() => navigate('/post-job')} style={{ background: CYAN, color: '#000', border: 'none', padding: '8px 20px', fontSize: 11, fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Rajdhani',sans-serif" }}>+ Post a Job</button>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${CYAN},#0077aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#fff', fontFamily: "'Rajdhani',sans-serif" }}>HR</div>
          </div>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1500, margin: '0 auto', padding: '28px 24px' }}>
        <div className="fu" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {STAT_CARDS.map((s, i) => (
            <Card key={s.label} style={{ padding: 22, animationDelay: `${i * 80}ms` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{s.label}</p>
                <span style={{ fontSize: 20, opacity: 0.7 }}>{s.icon}</span>
              </div>
              <Counter target={s.value} color={s.color} />
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>{s.note}</p>
            </Card>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Card style={{ display: 'flex', flexDirection: 'column', maxHeight: 680 }}>
                <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid rgba(0,210,200,0.08)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 15, color: '#fff', letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>Job Posts</p>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{filteredJobs.length} total</span>
                  </div>
                  <input value={jobSearch} onChange={e => setJobSearch(e.target.value)} placeholder="Search jobs…"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,210,200,0.15)', padding: '8px 12px', fontSize: 12, color: '#fff', outline: 'none', marginBottom: 10, boxSizing: 'border-box' }} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['All', 'Active', 'Inactive'].map(f => (
                      <button key={f} onClick={() => setJobFilter(f)} style={filterStyle(jobFilter === f)}>{f}</button>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {jobsLoading && (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 1 }}>
                      Loading jobs…
                    </div>
                  )}
                  {!jobsLoading && jobsError && (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#ff5555', fontSize: 12, letterSpacing: 1 }}>
                      {jobsError}
                    </div>
                  )}
                  {!jobsLoading && !jobsError && filteredJobs.length === 0 && (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: 1 }}>
                      No jobs yet. Click "+ Post a Job" to create one.
                    </div>
                  )}
                  {!jobsLoading && filteredJobs.map((j, i) => (
                    <div key={j.id} className="si"
                      style={{ padding: '14px 20px', borderBottom: '1px solid rgba(0,210,200,0.06)', display: 'flex', alignItems: 'center', gap: 14, animationDelay: `${i * 40}ms`, transition: 'background 0.2s', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,210,200,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.title}</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>{j.dept} · {j.location} · {j.type}</p>
                        <p style={{ fontSize: 11, color: CYAN, margin: '3px 0 0' }}>{j.applicants} applicants</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <Badge status={j.status} />
                        <button onClick={async () => {
                          const newStatus = j.status === 'Active' ? 'closed' : 'active'
                          // Optimistic UI update
                          setJobs(prev => prev.map(jj => jj.id === j.id ? { ...jj, status: jj.status === 'Active' ? 'Inactive' : 'Active' } : jj))
                          try {
                            await jobsApi.update(j.id, { status: newStatus })
                          } catch (err) {
                            // Revert on error
                            setJobs(prev => prev.map(jj => jj.id === j.id ? { ...jj, status: jj.status === 'Active' ? 'Inactive' : 'Active' } : jj))
                            alert('Failed to update: ' + err.message)
                          }
                        }}
                          style={{ fontSize: 10, background: 'transparent', border: '1px solid rgba(0,210,200,0.15)', color: 'rgba(255,255,255,0.3)', padding: '3px 8px', cursor: 'pointer', letterSpacing: 1 }}>
                          Toggle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card style={{ display: 'flex', flexDirection: 'column', maxHeight: 680 }}>
                <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid rgba(0,210,200,0.08)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 15, color: '#fff', letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>Applications</p>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{filteredApps.length} total</span>
                  </div>
                  <input value={appSearch} onChange={e => setAppSearch(e.target.value)} placeholder="Search applicants…"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,210,200,0.15)', padding: '8px 12px', fontSize: 12, color: '#fff', outline: 'none', marginBottom: 10, boxSizing: 'border-box' }} />
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['All', 'New', 'Review', 'Interview', 'Hired', 'Rejected'].map(f => (
                      <button key={f} onClick={() => setAppFilter(f)} style={filterStyle(appFilter === f)}>{f}</button>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {appsLoading && (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 1 }}>
                      Loading applications…
                    </div>
                  )}
                  {!appsLoading && appsError && (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#ff5555', fontSize: 12, letterSpacing: 1 }}>
                      {appsError}
                    </div>
                  )}
                  {!appsLoading && !appsError && filteredApps.length === 0 && (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: 1 }}>
                      No applications yet. Candidates will appear here when they apply.
                    </div>
                  )}
                  {!appsLoading && filteredApps.map((a, i) => (
                    <div key={a.id} className="si" onClick={() => setSelectedApp(a)}
                      style={{ padding: '13px 20px', borderBottom: '1px solid rgba(0,210,200,0.06)', display: 'flex', alignItems: 'center', gap: 12, animationDelay: `${i * 40}ms`, cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,210,200,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,${CYAN}66,#0077aa66)`, border: `1px solid ${CYAN}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: CYAN, flexShrink: 0, fontFamily: "'Rajdhani',sans-serif" }}>
                        {a.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 14, color: '#fff', margin: 0 }}>{a.name}</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{a.role}</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', margin: '1px 0 0' }}>{a.exp} · {a.date}</p>
                      </div>
                      <div style={{ textAlign: 'center', marginRight: 8 }}>
                        <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 18, color: a.score >= 85 ? '#22c55e' : a.score >= 70 ? CYAN : '#fbbf24', margin: 0 }}>{a.score}%</p>
                        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 1 }}>match</p>
                      </div>
                      <Badge status={a.status} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card style={{ marginTop: 20, padding: '20px 24px' }} className="fu">
              <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 13, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>Hiring Pipeline Overview</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
                {PIPELINE_STAGES.map(stage => {
                  const count    = apps.filter(a => a.status === stage).length
                  const maxCount = Math.max(...PIPELINE_STAGES.map(s => apps.filter(a => a.status === s).length), 1)
                  const c        = STATUS_COLORS[stage]
                  return (
                    <div key={stage} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 20, color: c.text }}>{count}</span>
                      <div style={{ width: '100%', background: 'rgba(0,210,200,0.06)', borderRadius: '2px 2px 0 0', overflow: 'hidden' }}>
                        <div style={{ height: `${Math.max(4, (count / maxCount) * 80)}px`, background: c.bg, borderTop: `2px solid ${c.border}`, transition: 'height 1s ease' }} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: c.text }}>{stage}</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="fu" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {ANALYTICS_SPARKLINES.map(s => (
                <Card key={s.label} style={{ padding: 22 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>{s.label}</p>
                  <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 38, color: s.color, margin: '0 0 12px', lineHeight: 1 }}>{s.peak}</p>
                  <svg width="100%" height="50" viewBox="0 0 200 50" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`g${s.peak}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {(() => {
                      const max = Math.max(...s.data), min = Math.min(...s.data)
                      const pts = s.data.map((v, i) => `${(i / (s.data.length - 1)) * 200},${50 - ((v - min) / (max - min || 1)) * 42 - 4}`).join(' ')
                      return <>
                        <polygon points={`0,50 ${pts} 200,50`} fill={`url(#g${s.peak})`} />
                        <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </>
                    })()}
                  </svg>
                </Card>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Card style={{ padding: 22 }}>
                <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 13, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 18 }}>Top Performing Jobs</p>
                {jobs.length === 0 && (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '20px 0' }}>No jobs yet</p>
                )}
                {jobs.slice(0, 5).map(j => (
                  <div key={j.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{j.title}</span>
                      <span style={{ fontSize: 12, color: CYAN, fontWeight: 700 }}>{j.applicants} apps</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(0,210,200,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (j.applicants / 45) * 100)}%`, background: `linear-gradient(90deg,${CYAN},#0077aa)`, borderRadius: 2, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}
              </Card>

              <Card style={{ padding: 22 }}>
                <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 13, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 18 }}>Application Status Breakdown</p>
                {PIPELINE_STAGES.map(stage => {
                  const count = apps.filter(a => a.status === stage).length
                  const pct   = apps.length ? Math.round((count / apps.length) * 100) : 0
                  const c     = STATUS_COLORS[stage]
                  return (
                    <div key={stage} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: c.text, fontWeight: 700, letterSpacing: 1 }}>{stage}</span>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: c.bg, borderTop: `2px solid ${c.border}`, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
              {ANALYTICS_SUMMARY.map(s => (
                <Card key={s.label} style={{ padding: 20 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>{s.label}</p>
                  <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 36, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>{s.note}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="fu" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'flex-start' }}>
            <Card style={{ padding: 8 }}>
              {SETTINGS_MENU.map(s => (
                <button key={s.id} onClick={() => setSettingsTab(s.id)}
                  style={{ width: '100%', textAlign: 'left', padding: '12px 14px', background: settingsTab === s.id ? 'rgba(0,210,200,0.1)' : 'transparent', border: settingsTab === s.id ? '1px solid rgba(0,210,200,0.25)' : '1px solid transparent', color: settingsTab === s.id ? '#fff' : 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: settingsTab === s.id ? 700 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2, transition: 'all 0.2s' }}>
                  <span style={{ fontSize: 16 }}>{s.icon}</span>{s.label}
                </button>
              ))}
            </Card>

            <Card style={{ padding: 28 }}>
              {settingsTab === 'company' && (
                <>
                  <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>Company Profile</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {COMPANY_FIELDS.map(([l, v]) => (
                      <div key={l}>
                        <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 7, display: 'block' }}>{l}</label>
                        <input defaultValue={v} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,210,200,0.18)', padding: '10px 13px', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                          onFocus={e => e.target.style.borderColor = CYAN}
                          onBlur={e => e.target.style.borderColor = 'rgba(0,210,200,0.18)'} />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 7, display: 'block' }}>Company Bio</label>
                    <textarea rows={4} defaultValue="We build mobile SDK tools that help developers improve their apps."
                      style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,210,200,0.18)', padding: '10px 13px', fontSize: 13, color: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = CYAN}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,210,200,0.18)'} />
                  </div>
                  <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                    <button style={{ background: CYAN, color: '#000', border: 'none', padding: '11px 28px', fontSize: 11, fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>Save Changes →</button>
                  </div>
                </>
              )}

              {settingsTab === 'notif' && (
                <>
                  <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>Notification Preferences</p>
                  {NOTIF_ITEMS.map(n => (
                    <div key={n.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(0,210,200,0.07)' }}>
                      <div>
                        <p style={{ fontSize: 14, color: '#fff', fontWeight: 600, margin: 0 }}>{n.label}</p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>{n.desc}</p>
                      </div>
                      <ToggleSwitch defaultOn={n.on} />
                    </div>
                  ))}
                </>
              )}

              {settingsTab === 'billing' && (
                <>
                  <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>Billing & Plan</p>
                  <div style={{ padding: 20, background: 'rgba(0,210,200,0.06)', border: `1px solid rgba(0,210,200,0.3)`, marginBottom: 24, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 12, right: 12, background: CYAN, color: '#000', padding: '3px 10px', fontSize: 10, fontWeight: 900, letterSpacing: '2px' }}>CURRENT</div>
                    <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 22, color: CYAN, margin: '0 0 4px' }}>Pro Plan</p>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>EGP 2,500 / month · Renews April 19, 2026</p>
                    <div style={{ display: 'flex', gap: 20, marginTop: 14, flexWrap: 'wrap' }}>
                      {['Unlimited job posts', 'AI matching', 'Interview rooms', 'Priority support'].map(f => (
                        <span key={f} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>✅ {f}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                    {BILLING_PLANS.map(p => (
                      <div key={p.name} style={{ padding: 18, background: p.current ? 'rgba(0,210,200,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${p.current ? CYAN : 'rgba(0,210,200,0.1)'}` }}>
                        <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 16, color: p.current ? CYAN : '#fff', margin: '0 0 4px' }}>{p.name}</p>
                        <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 14px' }}>{p.price}<span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>/mo</span></p>
                        {p.features.map(f => <p key={f} style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '5px 0' }}>· {f}</p>)}
                        {!p.current && <button style={{ marginTop: 14, width: '100%', background: 'transparent', border: `1px solid rgba(0,210,200,0.3)`, color: CYAN, padding: '8px', fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer' }}>Upgrade</button>}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {settingsTab === 'team' && (
                <>
                  <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>Team Members</p>
                  {TEAM_MEMBERS.map(m => (
                    <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid rgba(0,210,200,0.07)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${CYAN},#0077aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>{m.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>{m.name}</p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{m.email}</p>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: CYAN, border: `1px solid rgba(0,210,200,0.3)`, padding: '3px 10px' }}>{m.role}</span>
                      <button style={{ background: 'transparent', border: '1px solid rgba(255,85,85,0.3)', color: '#ff5555', padding: '4px 12px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Remove</button>
                    </div>
                  ))}
                  <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                    <input placeholder="colleague@company.com" style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,210,200,0.18)', padding: '10px 13px', fontSize: 13, color: '#fff', outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = CYAN}
                      onBlur={e => e.target.style.borderColor = 'rgba(0,210,200,0.18)'} />
                    <button style={{ background: CYAN, color: '#000', border: 'none', padding: '10px 22px', fontSize: 11, fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>Invite →</button>
                  </div>
                </>
              )}

              {settingsTab === 'security' && (
                <>
                  <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>Security</p>
                  <div style={{ marginBottom: 28 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>Change Password</p>
                    {['Current Password', 'New Password', 'Confirm New Password'].map(l => (
                      <div key={l} style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6, display: 'block' }}>{l}</label>
                        <input type="password" placeholder="••••••••" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,210,200,0.18)', padding: '10px 13px', fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                          onFocus={e => e.target.style.borderColor = CYAN}
                          onBlur={e => e.target.style.borderColor = 'rgba(0,210,200,0.18)'} />
                      </div>
                    ))}
                    <button style={{ marginTop: 8, background: CYAN, color: '#000', border: 'none', padding: '10px 24px', fontSize: 11, fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>Update Password</button>
                  </div>
                  <div style={{ padding: 18, background: 'rgba(0,210,200,0.04)', border: '1px solid rgba(0,210,200,0.12)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>Two-Factor Authentication</p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>Add an extra layer of security to your account</p>
                      </div>
                      <ToggleSwitch defaultOn={false} />
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
