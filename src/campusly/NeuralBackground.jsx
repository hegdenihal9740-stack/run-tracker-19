import { useEffect, useRef } from 'react'

const COLORS = ['255,61,129', '45,226,230', '255,180,67']

export default function NeuralBackground() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, raf = 0, nodes = [], waves = []
    const mouse = { x: -9999, y: -9999 }
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(110, Math.floor((w * h) / 11000))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: 1.5 + Math.random() * 2.2, c: COLORS[Math.floor(Math.random() * 3)],
      }))
    }

    const frame = () => {
      ctx.clearRect(0, 0, w, h)
      for (const wv of waves) wv.r += 6
      waves = waves.filter(wv => wv.r < 420)
      for (const n of nodes) {
        const dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy)
        if (d < 140 && d > 0) { const f = (140 - d) / 140 * 0.6; n.vx += dx / d * f; n.vy += dy / d * f }
        for (const wv of waves) {
          const wx = n.x - wv.x, wy = n.y - wv.y, wd = Math.hypot(wx, wy)
          if (Math.abs(wd - wv.r) < 30 && wd > 0) { n.vx += wx / wd * 1.2; n.vy += wy / wd * 1.2 }
        }
        n.vx *= 0.96; n.vy *= 0.96
        n.vx += (Math.random() - 0.5) * 0.03; n.vy += (Math.random() - 0.5) * 0.03
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > w) n.vx *= -1
        if (n.y < 0 || n.y > h) n.vy *= -1
        n.x = Math.max(0, Math.min(w, n.x)); n.y = Math.max(0, Math.min(h, n.y))
      }
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < 130) {
          ctx.strokeStyle = `rgba(${a.c},${(1 - d / 130) * 0.35})`
          ctx.lineWidth = 1
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
        }
      }
      for (const n of nodes) {
        const near = Math.hypot(n.x - mouse.x, n.y - mouse.y) < 180
        ctx.fillStyle = `rgba(${n.c},${near ? 1 : 0.75})`
        ctx.shadowColor = `rgba(${n.c},0.9)`; ctx.shadowBlur = near ? 14 : 6
        ctx.beginPath(); ctx.arc(n.x, n.y, near ? n.r * 1.5 : n.r, 0, Math.PI * 2); ctx.fill()
      }
      ctx.shadowBlur = 0
      for (const wv of waves) {
        ctx.strokeStyle = `rgba(45,226,230,${(1 - wv.r / 420) * 0.5})`
        ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(wv.x, wv.y, wv.r, 0, Math.PI * 2); ctx.stroke()
      }
      if (!reduce) raf = requestAnimationFrame(frame)
    }

    const move = e => { const p = e.touches ? e.touches[0] : e; mouse.x = p.clientX; mouse.y = p.clientY }
    const leave = () => { mouse.x = mouse.y = -9999 }
    const click = e => { const p = e.touches ? e.touches[0] : e; waves.push({ x: p.clientX, y: p.clientY, r: 0 }); if (reduce) frame() }

    resize(); frame()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', click)
    window.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', click)
      window.removeEventListener('pointerleave', leave)
    }
  }, [])
  return <canvas ref={ref} className="neural-canvas" aria-hidden="true"/>
}
