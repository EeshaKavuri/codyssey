import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export type TourStep = {
  selector: string
  title: string
  detail: string
  action?: () => void
}

type Rect = { top: number; left: number; width: number; height: number }
type Placement = 'above' | 'below' | 'left' | 'right'

export function GuidedTour({ open, steps, index, setIndex, close, label, spotlight = true }: {
  open: boolean
  steps: TourStep[]
  index: number
  setIndex: (index: number) => void
  close: () => void
  label: string
  spotlight?: boolean
}) {
  const [rect, setRect] = useState<Rect | null>(null)
  const [hasPosition, setHasPosition] = useState(false)
  const [popupHeight, setPopupHeight] = useState(235)
  const popupRef = useRef<HTMLElement>(null)
  const step = steps[index]

  useEffect(() => {
    if (!open || !step) return
    step.action?.()

    let cancelled = false
    let attempts = 0
    const timers: number[] = []
    const measure = () => {
      const element = document.querySelector<HTMLElement>(step.selector)
      if (!element) {
        if (attempts++ < 20) timers.push(window.setTimeout(measure, 50))
        return
      }
      const bounds = element.getBoundingClientRect()
      if (cancelled) return
      setRect({ top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height })
      setHasPosition(true)
    }

    timers.push(window.setTimeout(measure, 40))
    timers.push(window.setTimeout(() => measure(), 220))
    timers.push(window.setTimeout(() => measure(), 450))
    const contentObserver = new MutationObserver(() => measure())
    contentObserver.observe(document.body, { childList: true, subtree: true })
    const updatePosition = () => measure()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      cancelled = true
      contentObserver.disconnect()
      timers.forEach((timer) => window.clearTimeout(timer))
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [index, open, step])

  useEffect(() => {
    if (open) return
    setRect(null)
    setHasPosition(false)
  }, [open])

  useLayoutEffect(() => {
    if (!open || !hasPosition || !popupRef.current) return
    const popup = popupRef.current
    const measure = () => setPopupHeight(popup.getBoundingClientRect().height)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(popup)
    return () => observer.disconnect()
  }, [hasPosition, index, open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowRight' && index < steps.length - 1) setIndex(index + 1)
      if (event.key === 'ArrowLeft' && index > 0) setIndex(index - 1)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [close, index, open, setIndex, steps.length])

  if (!open || !step) return null

  const padding = 7
  const targetVisible = rect && rect.top < window.innerHeight && rect.top + rect.height > 0 && rect.left < window.innerWidth && rect.left + rect.width > 0
  const focusRect = targetVisible ? {
    top: Math.max(5, rect.top - padding),
    left: Math.max(5, rect.left - padding),
    width: Math.min(window.innerWidth - 10, rect.width + padding * 2),
    height: Math.min(window.innerHeight - 10, rect.height + padding * 2),
  } : null
  const popupWidth = Math.min(330, window.innerWidth - 24)
  const gap = 18
  const viewportMargin = 12
  const right = focusRect ? focusRect.left + focusRect.width : 0
  const bottom = focusRect ? focusRect.top + focusRect.height : 0
  const centerX = focusRect ? focusRect.left + focusRect.width / 2 : window.innerWidth / 2
  const centerY = focusRect ? focusRect.top + focusRect.height / 2 : window.innerHeight / 2
  const available = focusRect ? {
    right: window.innerWidth - right - popupWidth,
    left: focusRect.left - popupWidth,
    below: window.innerHeight - bottom - popupHeight,
    above: focusRect.top - popupHeight,
  } : null
  const placement = (available
    ? (Object.entries(available).sort(([, first], [, second]) => second - first)[0][0] as Placement)
    : 'below')
  const popupTop = focusRect
    ? placement === 'below'
      ? bottom + gap
      : placement === 'above'
        ? focusRect.top - popupHeight - gap
        : centerY - popupHeight / 2
    : window.innerHeight / 2 - popupHeight / 2
  const popupLeft = focusRect
    ? placement === 'right'
      ? right + gap
      : placement === 'left'
        ? focusRect.left - popupWidth - gap
        : centerX - popupWidth / 2
    : window.innerWidth / 2 - popupWidth / 2
  const boundedTop = Math.min(window.innerHeight - popupHeight - viewportMargin, Math.max(viewportMargin, popupTop))
  const boundedLeft = Math.min(window.innerWidth - popupWidth - viewportMargin, Math.max(viewportMargin, popupLeft))
  const anchorStyle = focusRect ? {
    top: Math.min(window.innerHeight - 18, Math.max(8,
      placement === 'below' ? bottom - 5 : placement === 'above' ? focusRect.top - 5 : centerY - 7)),
    left: Math.min(window.innerWidth - 18, Math.max(8,
      placement === 'right' ? right - 5 : placement === 'left' ? focusRect.left - 5 : centerX - 7)),
  } : undefined

  return <div className={`coach-tour ${spotlight ? '' : 'pointer-only'}`} aria-live="polite">
    {spotlight && focusRect && <div className="coach-spotlight" style={focusRect} />}
    {!spotlight && hasPosition && anchorStyle && <span className="coach-anchor" style={anchorStyle} />}
    {hasPosition && <section ref={popupRef} className={`coach-popup ${placement}`} style={{ top: boundedTop, left: boundedLeft, width: popupWidth }} role="dialog" aria-label={label}>
      <div className="coach-heading"><span>{label} · {index + 1}/{steps.length}</span><button onClick={close} aria-label="Close walkthrough">×</button></div>
      <h3>{step.title}</h3>
      <p>{step.detail}</p>
      <footer>
        <button className="coach-skip" onClick={close}>Skip</button>
        <div>
          <button onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}>Back</button>
          {index < steps.length - 1
            ? <button className="coach-next" onClick={() => setIndex(index + 1)}>Next</button>
            : <button className="coach-next" onClick={close}>Done ✓</button>}
        </div>
      </footer>
    </section>}
  </div>
}
