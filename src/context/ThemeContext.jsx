import { createContext, useContext, useEffect, useMemo, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [tema, setTema] = useLocalStorage('tema', 'claro')
  useEffect(() => {
    document.documentElement.dataset.theme = tema
  }, [tema])
  const alternar = useCallback(() => setTema(t => (t === 'claro' ? 'oscuro' : 'claro')), [setTema])

  // IA: [el objeto value se creaba en cada render del Provider y re-renderizaba a todos los consumidores]
  // → Solución manual: memorizar value con useMemo para que solo cambie cuando cambia el tema
  const value = useMemo(() => ({ tema, setTema, alternar }), [tema, setTema, alternar])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook de consumo junto a su Provider
export const useTema = () => useContext(ThemeContext)
