import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Navbar.module.css'
import { useAuth } from '../context/AuthContext'

const LANDING_LINKS = [
  { label: 'Jobs',         href: '#jobs'    },
  { label: 'ATS',          href: '#ats'     },
  { label: 'How It Works', href: '#how'     },
  { label: 'Pricing',      href: '#pricing' },
]

const DASHBOARD_LINKS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Network',   to: '/network'   },
  { label: 'Messaging', to: '/messaging' },
  { label: 'Analytics', to: '/analytics' },
]

const initialsOf = (name = '') => name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(w => w[0].toUpperCase())
  .join('') || '?'

export default function Navbar({ variant = 'landing' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const isLanding = variant === 'landing'
  const close = () => setMenuOpen(false)

  const handleLogout = () => {
    close()
    logout()
    navigate('/')
  }

  return (
    <nav className={`${styles.nav} ${!isLanding ? styles.navDash : ''}`}>
      <a
        className={styles.logo}
        href={isLanding ? '#' : '/dashboard'}
        onClick={(e) => { if (!isLanding) { e.preventDefault(); navigate('/dashboard') } }}
      >
        TALENT<span>FLOW</span>
      </a>

      {isLanding && (
        <ul className={styles.links}>
          {LANDING_LINKS.map(l => (
            <li key={l.label}>
              <a className={styles.link} href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
      )}

      {!isLanding && (
        <ul className={styles.links}>
          {DASHBOARD_LINKS.map(l => (
            <li key={l.label}>
              <button
                type="button"
                className={styles.link}
                onClick={() => navigate(l.to)}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {isLanding && (
        <div className={styles.actions}>
          <a className={styles.cta} href="#cta">Post a Job</a>
          <button className={styles.loginBtn} onClick={() => navigate('/login')}>Login</button>
        </div>
      )}

      {!isLanding && (
        <div className={styles.actions}>
          <button
            className={styles.userChip}
            onClick={() => navigate('/profile')}
            aria-label="Go to profile"
          >
            <span className={styles.avatar}>{initialsOf(user?.name)}</span>
            <span className={styles.userName}>{user?.name || 'Profile'}</span>
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      )}

      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span className={`${styles.bar} ${menuOpen ? styles.barTop : ''}`} />
        <span className={`${styles.bar} ${menuOpen ? styles.barMid : ''}`} />
        <span className={`${styles.bar} ${menuOpen ? styles.barBot : ''}`} />
      </button>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        {isLanding ? (
          <>
            <ul className={styles.mobileLinks}>
              {LANDING_LINKS.map(l => (
                <li key={l.label}>
                  <a className={styles.mobileLink} href={l.href} onClick={close}>{l.label}</a>
                </li>
              ))}
            </ul>
            <a className={styles.cta} href="#cta" onClick={close}>Post a Job</a>
            <button className={styles.loginBtn} onClick={() => { close(); navigate('/login') }}>Login</button>
          </>
        ) : (
          <>
            <ul className={styles.mobileLinks}>
              {DASHBOARD_LINKS.map(l => (
                <li key={l.label}>
                  <button
                    type="button"
                    className={styles.mobileLink}
                    onClick={() => { close(); navigate(l.to) }}
                  >
                    {l.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className={styles.mobileLink}
                  onClick={() => { close(); navigate('/profile') }}
                >
                  Profile
                </button>
              </li>
            </ul>
            <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  )
}
