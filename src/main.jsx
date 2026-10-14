import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { PedidoProvider } from './context/PedidoContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <PedidoProvider>
        <App />
      </PedidoProvider>
    </ThemeProvider>
  </StrictMode>
)