import { useRef, useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './index.css'
import { useScrollReveal } from './hooks/useScrollReveal'
import { useWebGL } from './hooks/useWebGL'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Hero from './sections/Hero'
import Ticker from './sections/Ticker'
import Jobs from './sections/Jobs'
import ATS from './sections/ATS'
import { Stats, HowItWorks, Pricing, CTA, Footer } from './sections/Sections'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Analytics from './pages/Analytics'
import EditProfile from './pages/EditProfile'
import Apply from './pages/Apply'
import Interview from './pages/Interview'
import Network from './pages/Network'
import Messaging from './pages/Messaging'
import EmployerLogin from './pages/EmployerLogin'
import EmployerDashboard from './pages/EmployerDashboard'
import PostJob from './pages/PostJob'

function GlobalCursor() {
  const dotRef  = useRef(null)
  const ringRef = useRef(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const rx = { current: -200 }
    const ry = { current: -200 }
    const mx = { current: -200 }
    const my = { current: -200 }
    let rafId

    const onMove = e => {
      mx.current = e.clientX
      my.current = e.clientY
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px'
        dotRef.current.style.top  = e.clientY + 'px'
      }
    }

    const onOver = e => {
      const el = e.target
      if (el.closest('a, button, [role="button"], input, textarea, select, label')) {
        setHovered(true)
      }
    }

    const onOut = e => {
      const el = e.relatedTarget
      if (!el || !el.closest('a, button, [role="button"], input, textarea, select, label')) {
        setHovered(false)
      }
    }

    const animRing = () => {
      rx.current += (mx.current - rx.current) * 0.1
      ry.current += (my.current - ry.current) * 0.1
      if (ringRef.current) {
        ringRef.current.style.left = rx.current + 'px'
        ringRef.current.style.top  = ry.current + 'px'
      }
      rafId = requestAnimationFrame(animRing)
    }
    rafId = requestAnimationFrame(animRing)

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout',  onOut)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout',  onOut)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} style={{
        position: 'fixed',
        width:  hovered ? 12 : 8,
        height: hovered ? 12 : 8,
        background: hovered ? '#fff' : '#00d2c8',
        borderRadius: '50%',
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        transition: 'width 0.15s, height 0.15s, background 0.15s',
      }} />
      <div ref={ringRef} style={{
        position: 'fixed',
        width:  hovered ? 52 : 36,
        height: hovered ? 52 : 36,
        border: hovered
          ? '1.5px solid rgba(255,255,255,0.5)'
          : '1.5px solid rgba(0,210,200,0.6)',
        borderRadius: '50%',
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
        zIndex: 9998,
        transition: 'width 0.2s, height 0.2s, border-color 0.2s',
      }} />
    </>
  )
}

function LandingPage() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700;800&family=DM+Sans:wght@300;400&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  useScrollReveal()
  useWebGL(canvasRef)

  return (
    <>
      <div className="noise" />
      <canvas ref={canvasRef} className="bg-canvas" />
      <Navbar />
      <div className="ui-layer">
        <Hero />
        <Ticker />
        <Jobs />
        <ATS />
        <Stats />
        <HowItWorks />
        <Pricing />
        <CTA />
        <Footer />
      </div>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <GlobalCursor />
      <style>{`* { cursor: none !important; }`}</style>
      <Routes>
        <Route path="/"               element={<LandingPage />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/employer-login" element={<EmployerLogin />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute><Analytics /></ProtectedRoute>
        } />
        <Route path="/edit-profile" element={
          <ProtectedRoute><EditProfile /></ProtectedRoute>
        } />
        <Route path="/apply" element={
          <ProtectedRoute><Apply /></ProtectedRoute>
        } />
        <Route path="/interview" element={
          <ProtectedRoute><Interview /></ProtectedRoute>
        } />
        <Route path="/network" element={
          <ProtectedRoute><Network /></ProtectedRoute>
        } />
        <Route path="/messaging" element={
          <ProtectedRoute><Messaging /></ProtectedRoute>
        } />
        <Route path="/employer-dashboard" element={
          <ProtectedRoute requireRole="employer"><EmployerDashboard /></ProtectedRoute>
        } />
        <Route path="/post-job" element={
          <ProtectedRoute requireRole="employer"><PostJob /></ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}
