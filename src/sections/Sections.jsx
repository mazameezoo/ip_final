import styles from './Sections.module.css'

const STATS = [
  { num: '3.2×', label: 'Faster Hiring'        },
  { num: '68%',  label: 'Less Screening Time'   },
  { num: '12K+', label: 'Companies Hiring'      },
  { num: '98K',  label: 'Placements Made'       },
]

const STEPS = [
  { num: '01', title: 'Post Your Role',       desc: 'Create a beautifully branded job listing in minutes. Distribute to 50+ job boards with one click. Your brand, front and center.' },
  { num: '02', title: 'Applications Flow In', desc: 'Every applicant lands in your pipeline automatically. AI screening scores and ranks them instantly against your criteria.' },
  { num: '03', title: 'Collaborate & Decide', desc: 'Schedule interviews, share scorecards, collect team feedback — all inside one workspace. No context switching.' },
  { num: '04', title: 'Hire with Confidence', desc: 'Send offers, collect e-signatures, and hand off to onboarding — all from TalentFlow. The loop is closed.' },
]

const PLANS = [
  {
    name: 'Starter', price: '49', period: 'per month, billed annually',
    features: [
      { text: '3 active job listings', ok: true  },
      { text: 'Basic ATS pipeline',    ok: true  },
      { text: 'Email notifications',   ok: true  },
      { text: 'TalentFlow job board',  ok: true  },
      { text: 'AI screening',          ok: false },
      { text: 'Custom career page',    ok: false },
      { text: 'Analytics dashboard',   ok: false },
    ],
    featured: false, btnStyle: 'outline', btnText: 'Get Started',
  },
  {
    name: 'Growth', price: '149', period: 'per month, billed annually',
    features: [
      { text: 'Unlimited job listings', ok: true },
      { text: 'Full ATS with stages',   ok: true },
      { text: 'AI resume screening',    ok: true },
      { text: 'Custom career page',     ok: true },
      { text: '50+ board distribution', ok: true },
      { text: 'Team collaboration',     ok: true },
      { text: 'Analytics dashboard',    ok: true },
    ],
    featured: true, btnStyle: 'solid', btnText: 'Start Free Trial',
  },
  {
    name: 'Enterprise', price: 'Custom', period: 'tailored to your team',
    features: [
      { text: 'Everything in Growth',      ok: true },
      { text: 'Dedicated success manager', ok: true },
      { text: 'HRIS integrations',         ok: true },
      { text: 'SSO & SAML',                ok: true },
      { text: 'Advanced DEI reporting',    ok: true },
      { text: 'SLA guarantee',             ok: true },
      { text: 'Custom AI scoring rules',   ok: true },
    ],
    featured: false, btnStyle: 'outline', btnText: 'Contact Sales',
  },
]

const FOOTER_LINKS = ['For Employers', 'For Candidates', 'Pricing', 'Blog', 'Privacy']

export function Stats() {
  return (
    <div className={styles.statsBand}>
      {STATS.map((item, i) => (
        <>
          <div key={item.num} className={`${styles.statItem} reveal`}>
            <span className={styles.statNum}>{item.num}</span>
            <span className={styles.statLabel}>{item.label}</span>
          </div>
          {i < STATS.length - 1 && <div key={`div-${i}`} className={styles.statDiv} />}
        </>
      ))}
    </div>
  )
}

export function HowItWorks() {
  return (
    <section id="how" className={styles.howSection}>
      <div className={styles.howHeader}>
        <div className="section-eyebrow reveal">The Process</div>
        <h2 className="section-heading reveal">
          How It <span className="ghost">Works</span>
        </h2>
      </div>
      <div className={styles.stepsGrid}>
        {STEPS.map((s, i) => (
          <div key={s.num} className={`${styles.stepCard} reveal`}>
            <div className={styles.stepNum}>{s.num}</div>
            {i < STEPS.length - 1 && <div className={styles.stepConnector} />}
            <div className={styles.stepTitle}>{s.title}</div>
            <p className={styles.stepDesc}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Pricing() {
  return (
    <section id="pricing" className={styles.pricingSection}>
      <div className="section-eyebrow reveal">Simple Pricing</div>
      <h2 className="section-heading reveal">
        Pick Your <span className="ghost">Plan</span>
      </h2>
      <div className={styles.plansGrid}>
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className={`${styles.planCard} ${plan.featured ? styles.featured : ''} reveal`}
          >
            {plan.featured && <div className={styles.featuredBadge}>Most Popular</div>}
            <div className={styles.planName}>{plan.name}</div>
            <div className={styles.planPrice}>
              {plan.price !== 'Custom' && <sup>$</sup>}{plan.price}
            </div>
            <span className={styles.planPeriod}>{plan.period}</span>
            <ul className={styles.planFeatures}>
              {plan.features.map(f => (
                <li key={f.text} className={f.ok ? '' : styles.noFeature}>
                  {f.text}
                </li>
              ))}
            </ul>
            <button className={`${styles.planBtn} ${plan.btnStyle === 'solid' ? styles.solid : styles.outline}`}>
              {plan.btnText}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

export function CTA() {
  return (
    <section id="cta" className={styles.ctaSection}>
      <div className={`${styles.ctaEyebrow} reveal`}>Ready to Hire Better?</div>
      <h2 className={`${styles.ctaBig} reveal`}>
        Start
        <em>Hiring</em>
        Today.
      </h2>
      <p className={`${styles.ctaDesc} reveal`}>
        Join 12,000+ companies already using TalentFlow to find and track their next great hire.
        Free 14-day trial. No credit card required.
      </p>
      <div className={`${styles.ctaActions} reveal`}>
        <a className="cta-primary" href="#">Start Free Trial</a>
        <a className="cta-secondary" href="#">Request a Demo</a>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.footerLogo}>TALENT<span>FLOW</span></span>
      <ul className={styles.footerLinks}>
        {FOOTER_LINKS.map(l => (
          <li key={l}><a href="#">{l}</a></li>
        ))}
      </ul>
      <span className={styles.footerCopy}>© 2024 TalentFlow Inc.</span>
    </footer>
  )
}
