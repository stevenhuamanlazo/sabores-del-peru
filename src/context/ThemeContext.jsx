import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState('claro')
  useEffect(() => {
    document.documentElement.dataset.theme = tema
  }, [tema])
  const alternar = () => setTema(t => (t === 'claro' ? 'oscuro' : 'claro'))
  return (
    <ThemeContext.Provider value={{ tema, alternar }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook de consumo junto a su Provider
export const useTema = () => useContext(ThemeContext)