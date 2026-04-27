import { useState } from 'react'
import styles from './Jobs.module.css'

const ALL_JOBS = [
  { id: 1, company: 'Stripe · San Francisco, CA', title: 'Senior Frontend Engineer',       salary: '$160K – $210K', posted: '2 days ago', tags: ['Remote', 'Full-Time', 'React', 'TypeScript'], hot: true  },
  { id: 2, company: 'Linear · New York, NY',       title: 'Product Designer — Motion & 3D', salary: '$130K – $170K', posted: '4 days ago', tags: ['Remote', 'Full-Time', 'Figma', 'After Effects'], hot: false },
  { id: 3, company: 'Vercel · Remote',             title: 'Staff Machine Learning Engineer', salary: '$200K – $260K', posted: '1 day ago',  tags: ['Remote', 'Full-Time', 'Python', 'PyTorch'], hot: true  },
  { id: 4, company: 'Notion · Austin, TX',         title: 'Head of Growth Marketing',        salary: '$140K – $180K', posted: '6 days ago', tags: ['Hybrid', 'Full-Time', 'SEO', 'Paid Media'], hot: false },
  { id: 5, company: 'Figma · London, UK',          title: 'DevOps & Platform Engineer',      salary: '£110K – £145K', posted: '3 days ago', tags: ['Remote', 'Full-Time', 'Kubernetes', 'AWS'], hot: false },
]

const FILTERS = ['All Roles', 'Engineering', 'Design', 'Marketing', 'Remote', 'Full-Time']

export default function Jobs() {
  const [active, setActive] = useState('All Roles')

  const filtered = active === 'All Roles'
    ? ALL_JOBS
    : ALL_JOBS.filter(j =>
        j.tags.some(t => t.toLowerCase().includes(active.toLowerCase())) ||
        j.title.toLowerCase().includes(active.toLowerCase())
      )

  return (
    <section id="jobs" className={styles.section}>
      <div className="section-eyebrow reveal">Featured Openings</div>
      <h2 className="section-heading reveal">
        Open <span className="ghost">Positions</span>
      </h2>

      <div className={`${styles.filters} reveal`}>
        {FILTERS.map(f => (
          <button
            key={f}
            className={`${styles.filterBtn} ${active === f ? styles.active : ''}`}
            onClick={() => setActive(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.map((job, i) => (
          <div
            key={job.id}
            className={`${styles.card} reveal`}
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <div className={styles.cardMain}>
              <div className={styles.company}>{job.company}</div>
              <div className={styles.jobTitle}>{job.title}</div>
              <div className={styles.tags}>
                {job.tags.map(t => (
                  <span
                    key={t}
                    className={`${styles.tag} ${t === 'Remote' ? styles.remote : ''}`}
                  >
                    {t}
                  </span>
                ))}
                {job.hot && <span className={`${styles.tag} ${styles.hot}`}>🔥 Hot</span>}
              </div>
            </div>
            <div className={styles.cardRight}>
              <div className={styles.salary}>{job.salary}</div>
              <div className={styles.posted}>Posted {job.posted}</div>
              <button className={styles.applyBtn}>Apply Now</button>
            </div>
            <span className={styles.arrow}>↗</span>
          </div>
        ))}
      </div>

      <div className={`${styles.viewAll} reveal`}>
        <a href="#">Browse all 12,400 roles <span>→</span></a>
      </div>
    </section>
  )
}
