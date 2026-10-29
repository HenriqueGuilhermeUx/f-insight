import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'
import './finsight-pwa.css'
import App from './App.tsx'
import USPreview from './pages/USPreview.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {window.location.pathname.replace(/\/$/, '') === '/us' ? <USPreview /> : <App />}
    </ErrorBoundary>
  </StrictMode>,
)
