import { useEffect, useState } from 'react'
import { getDesignExploration } from '../data/designExploration'
import type { DesignTrack } from '../data/designCurriculum'

function ExternalLinkIcon() {
  return (
    <svg className="external-link-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 5h5v5M19 5l-8 8M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  )
}

export default function DesignExploreMore({ track, week, initialTab = 'examples' }: { track: DesignTrack; week: number; initialTab?: 'examples' | 'resources' | 'challenge' }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const exploration = getDesignExploration(track, week)

  useEffect(() => setActiveTab(initialTab), [track, week, initialTab])

  return (
    <section className={`explore-more ${track}`}>
      <div className="explore-more-heading">
        <div><span className="section-kicker">EXPLORE MORE</span><h2>Understand it, then stretch it</h2><p>See where this idea appears, study a focused reference, and test your model against a changed requirement.</p></div>
        <div className="explore-tabs">
          <button aria-pressed={activeTab === 'examples'} className={activeTab === 'examples' ? 'active' : ''} onClick={() => setActiveTab('examples')}>Use cases</button>
          <button aria-pressed={activeTab === 'resources'} className={activeTab === 'resources' ? 'active' : ''} onClick={() => setActiveTab('resources')}>Read deeper</button>
          <button aria-pressed={activeTab === 'challenge'} className={activeTab === 'challenge' ? 'active' : ''} onClick={() => setActiveTab('challenge')}>Stretch challenge</button>
        </div>
      </div>
      {activeTab === 'examples' && <div className="explore-example-grid">
        {exploration.examples.map((example, index) => <article key={example.title}><span>0{index + 1} · REAL USE CASE</span><h3>{example.title}</h3><p>{example.detail}</p></article>)}
      </div>}
      {activeTab === 'resources' && <div className="explore-resource-grid">
        {exploration.resources.map((resource) => <a href={resource.url} target="_blank" rel="noreferrer" key={resource.url}><ExternalLinkIcon /><span>{resource.level}</span><h3>{resource.label}</h3><p>{resource.note}</p><b>Open resource</b></a>)}
      </div>}
      {activeTab === 'challenge' && <div className="explore-challenge">
        <div><span>CHANGED REQUIREMENT</span><h3>{exploration.challenge.scenario}</h3></div>
        <ol>{exploration.challenge.prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ol>
      </div>}
    </section>
  )
}
