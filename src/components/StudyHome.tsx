import { useState } from 'react'
import { m } from 'motion/react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, AudioLines, Braces, Check, CircleDot, Fingerprint, Layers3, Network, Play, RotateCcw, Sparkles, Ticket, Waypoints } from 'lucide-react'
import { lessonStatus, useLearning, type LearningStage, type LearningTrack, type LessonId } from '../data/learningProgress'
import LearningConstellation from './studio/LearningConstellation'
import { Reveal, useStudioMotion } from './studio/StudioMotion'

type TopicWeek = { week: number; dsa: string; hld: string; lld: string }
const tracks: LearningTrack[] = ['dsa', 'hld', 'lld']
const trackNames = { dsa: 'Think in patterns.', hld: 'Design for scale.', lld: 'Build with intent.' }
const trackLabels = { dsa: 'Data structures & algorithms', hld: 'High-level system design', lld: 'Low-level object design' }
const trackIcons = { dsa: Braces, hld: Network, lld: Layers3 }
const stages: { stage: LearningStage; label: string; detail: string }[] = [
  { stage: 'understand', label: 'Understand', detail: 'See the idea' },
  { stage: 'predict', label: 'Predict', detail: 'Trust your instinct' },
  { stage: 'experiment', label: 'Experiment', detail: 'Make it happen' },
  { stage: 'explain', label: 'Explain', detail: 'Own the reasoning' },
  { stage: 'apply', label: 'Apply', detail: 'Go beyond the example' },
]

function TrackArt({ track }: { track: LearningTrack }) {
  return <div className={`track-art art-${track}`} aria-hidden="true">
    {track === 'dsa' ? <><i>04</i><span /><i>08</i><span /><i className="art-hot">16</i><b className="art-pointer">current</b></>
      : track === 'hld' ? <><div className="art-client"><CircleDot size={20} /></div><span /><div className="art-router"><Network size={26} /></div><div className="art-server-stack"><i /><i /><i /></div></>
        : <><div className="art-class"><small>interface</small><strong>Behaviour</strong><span /><small>execute()</small></div><div className="art-class-shadow" /><div className="art-class-shadow second" /></>}
  </div>
}

export function StudyHome({ topics, selectedWeek, name, onOpen, onBooking, onMap, onProfile }: {
  topics: TopicWeek[]
  selectedWeek: number
  name: string
  onOpen: (track: LearningTrack, week: number, stage?: LearningStage) => void
  onBooking: () => void
  onMap: () => void
  onProfile: () => void
}) {
  const { state } = useLearning()
  const { motionEnabled } = useStudioMotion()
  const last = state.lastLesson
  const [lastWeek, lastTrack] = last?.split(':') ?? [String(selectedWeek), 'dsa']
  const week = Number(lastWeek)
  const track = lastTrack as LearningTrack
  const [previewTrack, setPreviewTrack] = useState<LearningTrack>(track)
  const current = topics[week - 1]
  const progress = last ? state.lessons[last] : undefined
  const selected = topics[selectedWeek - 1]
  const review = Object.entries(state.lessons).filter(([, item]) => item?.nextReviewAt != null && item.nextReviewAt <= Date.now()).sort((a, b) => (a[1]?.nextReviewAt ?? 0) - (b[1]?.nextReviewAt ?? 0))
  const startedCount = Object.keys(state.lessons).length
  const clearedCount = Object.values(state.lessons).filter(p => p?.demonstratedAt).length

  return <div className="page study-home">
    <section className="session-launch" aria-label="Recommended learning session">
      <div className="session-copy">
        <m.div className="studio-availability" initial={motionEnabled ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }}>
          <span className="signal-dot" />{name ? `YOUR SPACE, ${name.toUpperCase()}` : 'A DIFFERENT WAY TO GET THERE'}<span className="availability-rule" />
        </m.div>
        <h1 className="studio-headline">
          <span className="headline-line"><m.span initial={motionEnabled ? { y: '110%' } : false} animate={{ y: 0 }} transition={{ duration: motionEnabled ? .85 : 0, ease: [.16, 1, .3, 1] }}>{startedCount ? 'Keep your' : 'Think beyond'}</m.span></span>
          <span className="headline-line accent"><m.span initial={motionEnabled ? { y: '110%' } : false} animate={{ y: 0 }} transition={{ duration: motionEnabled ? .85 : 0, delay: motionEnabled ? .12 : 0, ease: [.16, 1, .3, 1] }}>{startedCount ? 'momentum.' : 'the code.'}<span className="headline-star" aria-hidden="true">✳</span></m.span></span>
        </h1>
        <p className="hero-manifesto">Less memorising. More <strong>“oh, I get it.”</strong><br />A hands-on playground for your next engineering breakthrough.</p>
        <div className="session-recommendation">
          <div className="recommendation-icon"><Play size={18} fill="currentColor" aria-hidden="true" /></div>
          <div><span className="section-kicker">{progress ? 'PICK UP WHERE YOU LEFT OFF' : 'YOUR FIRST SMALL BREAKTHROUGH'} · {track.toUpperCase()} / {String(week).padStart(2, '0')}</span><h2>{current[track]}</h2></div>
        </div>
        <div className="hero-actions">
          <m.button className="primary-button" whileTap={motionEnabled ? { scale: .97 } : undefined} onClick={() => onOpen(track, week)}>
            {progress ? `Continue ${progress.stage}` : 'Start your journey'}<span className="button-arrow"><ArrowUpRight size={20} aria-hidden="true" /></span>
          </m.button>
          <button className="hero-map-link" onClick={onMap}>Explore the path <ArrowRight size={17} aria-hidden="true" /></button>
        </div>
        <div className="hero-footnote"><Fingerprint size={15} aria-hidden="true" /><span>{progress ? `${lessonStatus(progress)}. Your place is saved.` : 'No account. No countdown. Just your curiosity.'}</span></div>
      </div>
      <Reveal className="hero-visual" delay={.15}>
        <LearningConstellation activeTrack={previewTrack} onTrackChange={setPreviewTrack} onOpen={item => onOpen(item, selectedWeek, 'experiment')} motionEnabled={motionEnabled} />
      </Reveal>
    </section>

    <Reveal>
      <div className="session-path" aria-label="Five stages of a learning session">
        <div className="path-intro"><span>THE LEARNING LOOP</span><AudioLines size={23} aria-hidden="true" /></div>
        {stages.map((item, i) => <button key={item.stage} className={progress?.stage === item.stage || !progress && i === 0 ? 'active' : ''} onClick={() => onOpen(track, week, item.stage)}><span className="path-index">0{i + 1}</span><div><strong>{item.label}</strong><small>{item.detail}</small></div><ArrowRight size={15} aria-hidden="true" /></button>)}
      </div>
    </Reveal>

    <Reveal className="study-index" delay={.05}>
      <header className="studio-section-heading"><div><span className="section-kicker">THREE LENSES. ONE ENGINEERING MIND.</span><h2>Choose your rabbit hole<span>.</span></h2></div><button onClick={onMap}>Week {String(selectedWeek).padStart(2, '0')} <ArrowUpRight size={18} aria-hidden="true" /></button></header>
      <div className="studio-tracks">
        {tracks.map((item, index) => {
          const id: LessonId = `${selectedWeek}:${item}`
          const Glyph = trackIcons[item]
          return <m.button className={`study-index-row track-${item}`} key={item} onClick={() => onOpen(item, selectedWeek)} whileHover={motionEnabled ? { y: -7 } : undefined} whileTap={motionEnabled ? { scale: .985 } : undefined}>
            <div className="track-card-top"><span><Glyph size={17} />{item.toUpperCase()}</span><span className="track-number">0{index + 1}</span></div>
            <TrackArt track={item} />
            <small className="track-eyebrow">{trackLabels[item]}</small><h3>{trackNames[item]}</h3><p>{selected[item]}</p>
            <div className="track-card-bottom"><span>{lessonStatus(state.lessons[id])}</span><span className="track-enter"><ArrowUpRight size={19} aria-hidden="true" /></span></div>
          </m.button>
        })}
      </div>
    </Reveal>

    <Reveal className="home-lower">
      <section className="living-case-teaser">
        <div className="case-topline"><span className="case-edition">THE LIVING SYSTEM <span>/ 001</span></span><span className="case-pill"><span />PLAYABLE CASE STUDY</span></div>
        <div className="case-composition">
          <div><span className="case-pretitle">ONE SEAT. TWO REQUESTS.</span><h2>Someone’s about<br />to lose their seat.</h2><p>A race condition. An ownership rule. An expiration heap. One story, three ways to see it.</p><button onClick={onBooking}>Enter the booking workbench <ArrowUpRight size={19} aria-hidden="true" /></button></div>
          <div className="case-ticket-scene" aria-hidden="true">
            <div className="case-connection line-a" /><div className="case-connection line-b" />
            <div className="request-badge request-a"><span>M</span><small>REQUEST 01</small></div><div className="request-badge request-b"><span>L</span><small>REQUEST 02</small></div>
            <div className="seat-ticket"><div><Ticket size={22} /><span>CODYSSEY LIVE</span></div><strong>A7</strong><small>ONE SEAT. ONE OWNER.</small><div className="ticket-barcode" /><span className="ticket-status">RESERVATION PENDING</span></div>
            <span className="case-collision"><Waypoints size={17} />Race detected</span>
          </div>
        </div>
        <footer><span>HLD</span><ArrowRight size={13} /><span>LLD</span><ArrowRight size={13} /><span>DSA</span><small>Change the lens. Not the system.</small></footer>
      </section>
      <section className="review-queue">
        <div className="review-heading"><span className="section-kicker">MAKE IT STICK</span><RotateCcw size={19} aria-hidden="true" /></div>
        <h2>{review.length ? 'Your next “aha”\nis waiting.' : 'Room for your\nnext “aha”.'}</h2>
        {review.length ? <div className="review-items">{review.slice(0, 3).map(([id, item]) => {
          const [w, t] = id.split(':')
          const reviewTrack = t as LearningTrack
          return <button key={id} onClick={() => onOpen(reviewTrack, Number(w), item?.reviewChecks?.[0] ?? 'predict')}><span>{reviewTrack.toUpperCase()} / {w.padStart(2, '0')}</span><strong>{topics[Number(w) - 1][reviewTrack]}</strong><ArrowUpRight size={17} aria-hidden="true" /></button>
        })}</div> : <><div className="review-orbit" aria-hidden="true"><span /><span /><div><Sparkles size={25} /></div></div><p>No revision waiting. Explore something new; useful mistakes will find their way back here.</p></>}
        <small>{clearedCount} checkpoints cleared · {startedCount} lessons explored</small>
        {!name && startedCount > 0 && <button className="optional-profile" onClick={onProfile}>Make this space yours <ArrowUpRight size={15} /></button>}
      </section>
    </Reveal>
    <Reveal className="studio-bottom-note"><div><Check size={15} /><span>Private progress</span><span className="bottom-dot" /><span>Real understanding</span><span className="bottom-dot" /><span>Your pace</span></div><span>BUILT FOR THE MOMENT IT CLICKS <ArrowDownRight size={18} /></span></Reveal>
  </div>
}
