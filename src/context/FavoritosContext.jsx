import { createContext, useContext, useReducer } from 'react'

const FavoritosContext = createContext(null)

function reducer(estado, accion) {
  switch (accion.type) {
    case 'TOGGLE':
      return estado.includes(accion.id)
        ? estado.filter(id => id !== accion.id)
        : [...estado, accion.id]
    case 'LIMPIAR':
      return []
    default:
      return estado
  }
}

export function FavoritosProvider({ children }) {
  const [favoritos, dispatch] = useReducer(reducer, [])
  return (
    <FavoritosContext.Provider value={{ favoritos, dispatch }}>
      {children}
    </FavoritosContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook de consumo junto a su Provider
export const useFavoritos = () => useContext(FavoritosContext)