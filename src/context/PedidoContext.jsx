import { createContext, useContext, useReducer, useEffect, useMemo } from 'react'
import { ESTADO_INICIAL, contarUnidades, limitesPara, reducerPedido, sanearPedido } from '../utils/reglasPedido'

const PedidoContext = createContext(null)
const CLAVE = 'pedido-v3'

// Inicializador perezoso: recupera el pedido guardado y lo sanea
function cargarPedido() {
  try {
    return sanearPedido(JSON.parse(localStorage.getItem(CLAVE)))
  } catch {
    return ESTADO_INICIAL
  }
}

export function PedidoProvider({ children }) {
  const [estado, dispatch] = useReducer(reducerPedido, undefined, cargarPedido)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado))
    } catch {
      // Sin almacenamiento disponible: el pedido vive solo en memoria
    }
  }, [estado])

  // dispatch es estable; value solo cambia cuando cambia el pedido
  const value = useMemo(() => ({
    items: estado.items,
    personas: estado.personas,
    unidades: contarUnidades(estado.items),
    ...limitesPara(estado.personas),
    dispatch,
  }), [estado])

  return <PedidoContext.Provider value={value}>{children}</PedidoContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook de consumo junto a su Provider
export const usePedido = () => useContext(PedidoContext)
