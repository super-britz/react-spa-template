import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import '../styles/global.css'

async function enableMocking() {
  if (!import.meta.env.DEV || import.meta.env.VITE_DISABLE_MOCK) {
    return
  }
  const { worker } = await import('@/mocks/browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('未找到 #root 挂载点')
}

enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
