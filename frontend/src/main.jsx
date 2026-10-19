import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

// Theme bootstrap: "dark" = Aurora Night (default), "light" = Sky (true light mode)
let savedTheme = localStorage.getItem('talkyy-theme') || 'dark'
if (savedTheme === 'mint') { savedTheme = 'light'; localStorage.setItem('talkyy-theme', 'light') }
document.documentElement.setAttribute('data-theme', savedTheme)

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <StrictMode>
    <App />
  </StrictMode>
  </BrowserRouter>,
)
