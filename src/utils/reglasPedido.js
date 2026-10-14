// Reglas del negocio del pedido (compartidas por el reducer y las vistas)
export const MAX_POR_PLATO = 5
export const MAX_UNIDADES = 15
export const PEDIDO_MINIMO = 20

export const contarUnidades = items => Object.values(items).reduce((s, n) => s + n, 0)

// Copia del pedido sin un plato
function sinPlato(items, id) {
  const copia = { ...items }
  delete copia[id]
  return copia
}

// Estado: { [idPlato]: cantidad }
// Las reglas viven en el reducer para que ningún componente pueda saltárselas
export function reducerPedido(items, accion) {
  const actual = items[accion.id] ?? 0
  switch (accion.type) {
    case 'AGREGAR':
      if (actual >= MAX_POR_PLATO || contarUnidades(items) >= MAX_UNIDADES) return items
      return { ...items, [accion.id]: actual + 1 }
    case 'RESTAR':
      if (actual === 0) return items
      if (actual === 1) return sinPlato(items, accion.id)
      return { ...items, [accion.id]: actual - 1 }
    case 'ELIMINAR':
      return sinPlato(items, accion.id)
    case 'LIMPIAR':
      return {}
    default:
      return items
  }
}
