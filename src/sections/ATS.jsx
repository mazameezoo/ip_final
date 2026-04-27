import { useEffect, useRef, useState } from 'react'
import styles from './ATS.module.css'

const STAGES = [
  { label: 'Applied',             color: '#00e5ff', count: 342, pct: '100%', opacity: 0.5 },
  { label: 'Screening',           color: '#4fd1ff', count: 87,  pct: '26%'  },
  { label: 'Technical Interview', color: '#00e5ff', count: 34,  pct: '10%'  },
  { label: 'Culture Fit',         color: '#ff6b35', count: 12,  pct: '3.5%' },
  { label: 'Final Round',         color: '#ff6b35', count: 5,   pct: '1.5%' },
  { label: 'Offer Sent',          color: '#a3ff6b', count: 2,   pct: '0.6%' },
]

const ACTIVITIES = [
  '→ Sarah K. moved to Technical Interview',
  '→ Marcus W. scorecard submitted',
  '→ Priya M. application received',
  '→ Jordan T. offer letter sent',
  '→ New application: Alex P.',
  '→ Interview scheduled: Wei C.',
]

const FEATURES = [
  { title: 'AI Resume Screening',      desc: 'Auto-rank and filter 1000s of applications in seconds using your custom scoring rules.' },
  { title: 'Collaborative Scorecards', desc: 'Structured interview feedback your entire team fills in together — no more email chains.' },
  { title: 'Automated Outreach',       desc: 'Trigger personalised emails at every stage — rejections, advances, scheduling — on autopilot.' },
  { title: 'Analytics & Reporting',    desc: 'Track time-to-hire, source quality, funnel conversion, and DEI metrics in real time.' },
]

export default function ATS() {
  const [barWidths, setBarWidths] = useState(STAGES.map(() => '0%'))
  const [feed, setFeed]           = useState([ACTIVITIES[0]])
  const pipelineRef = useRef(null)
  const actIdxRef   = useRef(1)

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        STAGES.forEach((s, i) => {
          setTimeout(() => {
            setBarWidths(prev => {
              const next = [...prev]
              next[i] = s.pct
              return next
            })
          }, 100 + i * 150)
        })
        obs.disconnect()
      }
    }, { threshold: 0.3 })
    if (pipelineRef.current) obs.observe(pipelineRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const msg = ACTIVITIES[actIdxRef.current % ACTIVITIES.length]
      actIdxRef.current++
      setFeed(prev => [msg, ...prev].slice(0, 3))
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="ats" className={styles.section}>
      <div className={`${styles.left} reveal`}>
        <div className={styles.pipeline} ref={pipelineRef}>
          <div className={styles.pipelineHeader}>
            <span className={styles.pipelineTitle}>Pipeline — Senior Frontend Engineer</span>
            <span className={styles.pipelineCount}>342 applicants</span>
          </div>

          {STAGES.map((s, i) => (
            <div key={s.label} className={styles.stage}>
              <div className={styles.stageDot} style={{ background: s.color }} />
              <span
                className={styles.stageName}
                style={i === 5 ? { color: s.color } : i === 0 ? { color: 'rgba(242,239,233,0.4)' } : {}}
              >
                {s.label}
              </span>
              <div className={styles.barWrap}>
                <div
                  className={styles.bar}
                  style={{ width: barWidths[i], background: s.color, opacity: s.opacity ?? 1 }}
                />
              </div>
              <span className={styles.stageNum} style={i === 5 ? { color: s.color } : {}}>
                {s.count}
              </span>
            </div>
          ))}

          <div style={{ flex: 1 }} />

          <div className={styles.activityWrap}>
            <div className={styles.activityLabel}>Recent activity</div>
            <div className={styles.activityFeed}>
              {feed.map((msg, i) => (
                <div key={i} className={styles.activityLine}>{msg}</div>
              ))}
            </div>
          </div>

          <div className={styles.candidateStrip}>
            {['Sarah K.', 'Marcus W.', 'Priya M.', 'Jordan T.'].map((name, i) => (
              <span key={name} className={styles.pill} style={{ animationDelay: `${i * 0.5}s` }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={`${styles.right} reveal`}>
        <div className="section-eyebrow">Applicant Tracking System</div>
        <h2 className={styles.heading}>
          Track Every<br />
          <span className={styles.accentHeading}>Candidate.</span><br />
          Close Faster.
        </h2>
        <p className={styles.body}>
          A pipeline built for speed. Move candidates through every stage — from application
          to offer — without losing a single thread or a single candidate.
        </p>
        <p className={styles.body}>
          Our ATS connects directly to your job board, auto-parses every résumé, scores
          candidates by your criteria, and gives your hiring team one clean workspace.
        </p>
        <ul className={styles.featureList}>
          {FEATURES.map(f => (
            <li key={f.title}>
              <div>
                <strong>{f.title}</strong>
                {f.desc}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
