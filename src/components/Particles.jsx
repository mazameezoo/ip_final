import { useRef, useEffect } from 'react'

const DEFAULT_COUNT = 50
const DEFAULT_LINK_DIST = 110

export default function Particles({
  count = DEFAULT_COUNT,
  linkDistance = DEFAULT_LINK_DIST,
  color = 'rgba(0,210,200,0.55)',
  linkColor = '0,210,200',
  fixed = false,
  style = {},
}) {
  const ref = useRef(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    let id

    const resize = () => {
      c.width = c.offsetWidth
      c.height = c.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      pts.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > c.width)  p.vx *= -1
        if (p.y < 0 || p.y > c.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      })
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < linkDistance) {
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(${linkColor},${0.08 * (1 - d / linkDistance)})`
          ctx.lineWidth = 0.6
          ctx.stroke()
        }
      }))
      id = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize', resize)
    }
  }, [count, linkDistance, color, linkColor])

  const baseStyle = fixed
    ? { position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }
    : { position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }

  return <canvas ref={ref} style={{ ...baseStyle, ...style }} />
}