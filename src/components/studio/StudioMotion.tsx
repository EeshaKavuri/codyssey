import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { LazyMotion, MotionConfig, domAnimation, m, useMotionValue, useSpring } from 'motion/react'
import { motionEnabledFor, type MotionPreference } from '../../data/motionPreference'

type MotionSettings = { motionEnabled: boolean; systemReduced: boolean; followsSystem: boolean; toggleMotion: () => void }
const MotionSettingsContext = createContext<MotionSettings | null>(null)

function subscribeToSystemMotion(onChange: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

export function useSystemReducedMotion() {
  return useSyncExternalStore(subscribeToSystemMotion, () => window.matchMedia('(prefers-reduced-motion: reduce)').matches, () => true)
}

export function StudioMotionProvider({ children }: { children: ReactNode }) {
  const systemReduced = useSystemReducedMotion()
  const [motionError, setMotionError] = useState('')
  const [preference, setPreference] = useState<MotionPreference>(() => {
    try {
      const saved = localStorage.getItem('codyssey-studio-motion')
      if (saved === 'on' || saved === 'off') return saved
      if (saved !== null && saved !== 'system') console.warn('Unrecognized motion preference; following the system setting.')
      return 'system'
    }
    catch (error) { console.error('Could not read motion preference.', error); return 'off' }
  })
  const motionEnabled = motionEnabledFor(preference, systemReduced)
  useEffect(() => { document.documentElement.dataset.motion = motionEnabled ? 'on' : 'off' }, [motionEnabled])
  useEffect(() => {
    const syncVisibility = () => { document.documentElement.dataset.pageVisibility = document.hidden ? 'hidden' : 'visible' }
    syncVisibility()
    document.addEventListener('visibilitychange', syncVisibility)
    return () => document.removeEventListener('visibilitychange', syncVisibility)
  }, [])
  const toggleMotion = () => {
    const next = motionEnabled ? 'off' : 'on'
    setPreference(next)
    try { localStorage.setItem('codyssey-studio-motion', next); setMotionError('') }
    catch (error) {
      console.error('Could not save motion preference.', error)
      setMotionError('Motion changed for this visit, but this browser could not save the preference.')
    }
  }
  return <MotionSettingsContext.Provider value={{ motionEnabled, systemReduced, followsSystem: preference === 'system', toggleMotion }}>
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion={motionEnabled ? 'never' : 'always'} transition={motionEnabled ? { type: 'spring', stiffness: 270, damping: 28 } : { duration: 0 }}>
        {motionError && <p className="storage-warning" role="alert">{motionError}</p>}
        {children}
      </MotionConfig>
    </LazyMotion>
  </MotionSettingsContext.Provider>
}

export function useStudioMotion() {
  const settings = useContext(MotionSettingsContext)
  if (!settings) throw new Error('StudioMotionProvider is required.')
  return settings
}

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { motionEnabled } = useStudioMotion()
  return <m.div className={className} initial={motionEnabled ? { opacity: 0, y: 24 } : false}
    whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .08 }}
    transition={{ duration: motionEnabled ? .65 : 0, delay: motionEnabled ? delay : 0, ease: [.22, 1, .36, 1] }}>
    {children}
  </m.div>
}

export function StudioAmbient({ active }: { active: boolean }) {
  const { motionEnabled } = useStudioMotion()
  const pointerX = useMotionValue(-600)
  const pointerY = useMotionValue(-600)
  const x = useSpring(pointerX, { stiffness: 55, damping: 26 })
  const y = useSpring(pointerY, { stiffness: 55, damping: 26 })
  useEffect(() => {
    if (!active || !motionEnabled || !window.matchMedia('(pointer: fine)').matches) return
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      pointerX.set(event.clientX - 260)
      pointerY.set(event.clientY - 260)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [active, motionEnabled, pointerX, pointerY])
  return <div className="studio-ambient" aria-hidden="true">
    <div className="ambient-grid" /><div className="ambient-aura" />
    {active && motionEnabled && <m.div className="cursor-halo" style={{ x, y }} />}
  </div>
}
