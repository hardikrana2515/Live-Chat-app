import { useEffect } from 'react'

/**
 * useScrollSynchronizedPanels
 *
 * Centralized scroll controller for Talkyy landing page.
 * Synchronizes physical sticky stacking and subtle outgoing depth scaling
 * directly to the user's scroll position.
 *
 * Key guarantees:
 * 1. 100% Solid Opacity: Sections are always fully opaque (opacity: 1).
 *    No ghosting, no translucent layer blending, no faint text bleed-through.
 * 2. Deterministic Stacking: Physical CSS sticky positioning with strictly ascending
 *    z-indices ensures the incoming panel solidly covers the outgoing panel.
 * 3. Exact Reversibility: Scaling and sticky stacking reverse frame-by-frame on scroll-up.
 * 4. Adaptive Sticky Top: idealTop = Math.min(64, winHeight - secHeight).
 *    Standard sections pin cleanly under the 64px navbar; tall sections scroll completely
 *    through before pinning, ensuring zero clipped content.
 * 5. Batch Reads and Writes: Separated measurement and style application phases prevent
 *    layout thrashing inside requestAnimationFrame.
 * 6. Responsive & Accessibility: Automatically disabled on mobile (<1024px) and for
 *    users with prefers-reduced-motion: reduce.
 */
export function useScrollSynchronizedPanels() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(
      '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'
    )

    let ticking = false
    let rafId = null

    const getSections = () => {
      const container = document.getElementById('main-content')
      if (!container) return []
      return Array.from(container.querySelectorAll(':scope > section'))
    }

    const clearInlineStyles = (sections) => {
      sections.forEach((sec) => {
        sec.style.removeProperty('--panel-sticky-top')
        const inner = sec.querySelector('.landing-panel__inner')
        if (inner) {
          inner.style.removeProperty('--panel-scale')
        }
      })
    }

    const updatePanels = () => {
      const sections = getSections()
      if (!sections.length) return

      if (!mediaQuery.matches) {
        clearInlineStyles(sections)
        return
      }

      const winHeight = window.innerHeight
      const headerHeight = 64

      // -------------------------------------------------------------
      // PHASE 1: BATCH DOM READS
      // -------------------------------------------------------------
      const data = sections.map((sec) => {
        const inner = sec.querySelector('.landing-panel__inner')
        const rect = sec.getBoundingClientRect()
        const secHeight = sec.offsetHeight
        return {
          sec,
          inner,
          rectTop: rect.top,
          secHeight,
        }
      })

      // -------------------------------------------------------------
      // PHASE 2: BATCH DOM WRITES
      // -------------------------------------------------------------
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        const nextItem = data[i + 1]

        // Adaptive sticky offset:
        // If secHeight <= winHeight - 64: sticks at 64px under the header.
        // If secHeight > winHeight - 64: sticks at (winHeight - secHeight) so the user
        // scrolls through and reads all content before the bottom pins and next panel stacks.
        const idealTop = Math.min(headerHeight, winHeight - item.secHeight)
        item.sec.style.setProperty('--panel-sticky-top', `${idealTop}px`)

        // Outgoing depth scale:
        // As nextItem enters the viewport and moves toward its sticky resting position,
        // this section subtly scales from 1.0 down to 0.985.
        // Opacity remains 1 at all times; incoming panel's solid background covers this panel.
        if (item.inner) {
          if (nextItem) {
            const nextIdealTop = Math.min(headerHeight, winHeight - nextItem.secHeight)
            const overlapStart = winHeight
            const overlapEnd = nextIdealTop
            const overlapDist = overlapStart - overlapEnd

            let progress = 0
            if (nextItem.rectTop <= overlapEnd) {
              progress = 1
            } else if (nextItem.rectTop < overlapStart && overlapDist > 0) {
              progress = Math.max(0, Math.min(1, (overlapStart - nextItem.rectTop) / overlapDist))
            }

            const scale = 1 - 0.015 * progress
            item.inner.style.setProperty('--panel-scale', scale.toFixed(4))
          } else {
            // Final CTA: last section in container, never overlapped by another section
            item.inner.style.setProperty('--panel-scale', '1')
          }
        }
      }

      // Ensure footer inner always sits at rest
      const footer = document.querySelector('.landing-panel--z-footer')
      if (footer) {
        const footerInner = footer.querySelector('.landing-panel__inner')
        if (footerInner) {
          footerInner.style.setProperty('--panel-scale', '1')
        }
      }
    }

    const requestUpdate = () => {
      if (!ticking) {
        ticking = true
        rafId = window.requestAnimationFrame(() => {
          updatePanels()
          ticking = false
        })
      }
    }

    // Initial measurement
    updatePanels()

    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate, { passive: true })
    window.addEventListener('load', requestUpdate, { passive: true })

    const onMediaChange = (e) => {
      if (!e.matches) {
        clearInlineStyles(getSections())
      } else {
        requestUpdate()
      }
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onMediaChange)
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(onMediaChange)
    }

    // Observe dynamic height mutations (e.g. FAQ accordion expanding/collapsing)
    let resizeObserver
    if (typeof ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(() => {
        requestUpdate()
      })
      const main = document.getElementById('main-content')
      if (main) resizeObserver.observe(main)
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      window.removeEventListener('load', requestUpdate)

      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', onMediaChange)
      } else if (typeof mediaQuery.removeListener === 'function') {
        mediaQuery.removeListener(onMediaChange)
      }

      if (resizeObserver) resizeObserver.disconnect()
      clearInlineStyles(getSections())
    }
  }, [])
}

export default useScrollSynchronizedPanels
