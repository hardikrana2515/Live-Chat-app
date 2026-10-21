import { useEffect, useRef, useState } from 'react'

/**
 * Signature hero object: three interlocking rings rendered with CSS 3D.
 * Deliberately lightweight — no WebGL, no extra dependencies — so it cannot
 * block first paint, and it degrades to a still composition when the visitor
 * prefers reduced motion or when the pointer never moves.
 */
const Sculpture = () => {
  const stageRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced || window.matchMedia('(hover: none)').matches) return

    let frame = 0

    const handleMove = (event) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = stage.getBoundingClientRect()
        const px = (event.clientX - rect.left) / rect.width - 0.5
        const py = (event.clientY - rect.top) / rect.height - 0.5
        const clamp = (value) => Math.max(-1, Math.min(1, value))
        setTilt({ x: clamp(py) * -16, y: clamp(px) * 22 })
      })
    }

    const handleLeave = () => {
      cancelAnimationFrame(frame)
      setTilt({ x: 0, y: 0 })
    }

    stage.addEventListener('pointermove', handleMove)
    stage.addEventListener('pointerleave', handleLeave)

    return () => {
      cancelAnimationFrame(frame)
      stage.removeEventListener('pointermove', handleMove)
      stage.removeEventListener('pointerleave', handleLeave)
    }
  }, [])

  return (
    <div className="sculpture" aria-hidden="true">
      <div
        ref={stageRef}
        className="sculpture__stage"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <div className="sculpture__spin">
          <span className="sculpture__ring sculpture__ring--a" />
          <span className="sculpture__ring sculpture__ring--b" />
          <span className="sculpture__ring sculpture__ring--c" />
        </div>
        <span className="sculpture__ground" />
      </div>
    </div>
  )
}

export default Sculpture
