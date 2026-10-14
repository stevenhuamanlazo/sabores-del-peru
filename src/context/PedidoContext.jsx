import { createContext, useContext, useReducer, useEffect, useMemo } from 'react'
import { MAX_POR_PLATO, MAX_UNIDADES, contarUnidades, reducerPedido } from '../utils/reglasPedido'

const PedidoContext = createContext(null)
const CLAVE = 'pedido-v2'

// Inicializador perezoso: recupera el pedido guardado y descarta datos corruptos o manipulados
function cargarPedido() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE))
    if (!guardado || typeof guardado !== 'object' || Array.isArray(guardado)) return {}
    const limpio = {}
    let total = 0
    for (const [id, cantidad] of Object.entries(guardado)) {
      const n = Math.min(Number(cantidad), MAX_POR_PLATO, MAX_UNIDADES - total)
      if (Number.isInteger(n) && n > 0) {
        limpio[id] = n
        total += n
      }
    }
    return limpio
  } catch {
    return {}
  }
}

export function PedidoProvider({ children }) {
  const [items, dispatch] = useReducer(reducerPedido, undefined, cargarPedido)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(items))
    } catch {
      // Sin almacenamiento disponible: el pedido vive solo en memoria
    }
  }, [items])

  // dispatch es estable; value solo cambia cuando cambia el pedido
  const value = useMemo(() => ({ items, unidades: contarUnidades(items), dispatch }), [items])

  return <PedidoContext.Provider value={value}>{children}</PedidoContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook de consumo junto a su Provider
export const usePedido = () => useContext(PedidoContext)
