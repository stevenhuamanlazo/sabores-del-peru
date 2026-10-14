import { createContext, useContext, useReducer, useEffect, useMemo } from 'react'

const FavoritosContext = createContext(null)
const CLAVE = 'pedido'

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

// Inicializador perezoso de useReducer: recupera el pedido guardado
function cargarPedido() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) ?? []
  } catch {
    return []
  }
}

export function FavoritosProvider({ children }) {
  const [favoritos, dispatch] = useReducer(reducer, [], cargarPedido)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(favoritos))
    } catch {
      // Sin almacenamiento disponible: el pedido vive solo en memoria
    }
  }, [favoritos])

  // dispatch es estable; value solo cambia cuando cambia la lista
  const value = useMemo(() => ({ favoritos, dispatch }), [favoritos])

  return <FavoritosContext.Provider value={value}>{children}</FavoritosContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook de consumo junto a su Provider
export const useFavoritos = () => useContext(FavoritosContext)
