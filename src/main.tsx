import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { LearningProvider } from './data/learningProgress'
import { StudioMotionProvider } from './components/studio/StudioMotion'
import './styles.css'
import './workbench.css'
import './studio.css'
import './studio-labs.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StudioMotionProvider><LearningProvider><App /></LearningProvider></StudioMotionProvider>
  </StrictMode>,
)
