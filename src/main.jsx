import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { FavoritosProvider } from './context/FavoritosContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <FavoritosProvider>
        <App />
      </FavoritosProvider>
    </ThemeProvider>
  </StrictMode>
)