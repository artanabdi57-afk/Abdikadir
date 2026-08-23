import React from 'react'
import ReactDOM from 'react-dom/client'
import SahanExperience from './sahan/SahanExperience.jsx'
import LegacyApp from './App.jsx'
import './styles/index.css'

const Root = () => window.location.pathname.startsWith('/app') ? <LegacyApp /> : <SahanExperience />

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
