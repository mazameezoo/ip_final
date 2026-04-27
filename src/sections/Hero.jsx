import { useNavigate } from 'react-router-dom'
import styles from './Hero.module.css'

const METRICS = [
  { num: '12,400+', label: 'Active Job Listings' },
  { num: '98K',     label: 'Candidates Placed'   },
  { num: '3.2×',   label: 'Faster Time-to-Hire'  },
]

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Job Board &amp; Applicant Tracking System
        </div>
        <h1 className={styles.title}>
          Find
          <span className={styles.hollow}>The Right</span>
          <span className={styles.accentWord}>Talent.</span>
        </h1>
        <p className={styles.sub}>
          One platform to post jobs, attract top candidates, track every application,
          and make smarter hiring decisions — at the speed your team needs.
        </p>
        <div className={styles.actions}>
          <button className="cta-primary" onClick={() => navigate('/login')}>
            Start Free Trial
          </button>
          <a className="cta-secondary" href="#ats">See the ATS</a>
        </div>
      </div>

      <div className={styles.metrics}>
        {METRICS.map((m, i) => (
          <div key={m.label}>
            <div className={styles.metric}>
              <div className={styles.metricNum}>{m.num}</div>
              <div className={styles.metricLabel}>{m.label}</div>
            </div>
            {i < METRICS.length - 1 && <div className={styles.metricLine} />}
          </div>
        ))}
      </div>

      <div className={styles.scrollCue}>
        <div className={styles.scrollBar} />
        <span className={styles.scrollText}>Scroll to explore</span>
      </div>
    </section>
  )
}
