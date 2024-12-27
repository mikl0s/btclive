import './styles/global.css'

import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.tsx'
import { btcLiveAPI } from './lib/api'

// Expose API globally for demo script
declare global {
  interface Window {
    btcLiveAPI: typeof btcLiveAPI
  }
}
window.btcLiveAPI = btcLiveAPI

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
