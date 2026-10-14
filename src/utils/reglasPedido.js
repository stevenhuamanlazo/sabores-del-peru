// Reglas del negocio del pedido (compartidas por el reducer y las vistas).
// Los límites dependen de cuántas personas van a comer: una sola persona no puede pedir 11 platos.
export const MIN_PERSONAS = 1
export const MAX_PERSONAS = 8
export const PLATOS_POR_PERSONA = 2
export const PEDIDO_MINIMO = 20

export const contarUnidades = items => Object.values(items).reduce((s, n) => s + n, 0)

// Máximo de platos en total y del mismo plato (uno por persona)
export const limitesPara = personas => ({
  maxUnidades: personas * PLATOS_POR_PERSONA,
  maxPorPlato: personas,
})

// ¿El pedido actual entra en los límites de esa cantidad de personas?
export function cabeEnPersonas(items, personas) {
  const { maxUnidades, maxPorPlato } = limitesPara(personas)
  return contarUnidades(items) <= maxUnidades && Object.values(items).every(n => n <= maxPorPlato)
}

export const ESTADO_INICIAL = { personas: MIN_PERSONAS, items: {} }

// Copia del pedido sin un plato
function sinPlato(items, id) {
  const copia = { ...items }
  delete copia[id]
  return copia
}

// Estado: { personas, items: { [idPlato]: cantidad } }
// Las reglas viven en el reducer para que ningún componente pueda saltárselas
export function reducerPedido(estado, accion) {
  const { personas, items } = estado
  const actual = items[accion.id] ?? 0
  switch (accion.type) {
    case 'AGREGAR': {
      const { maxUnidades, maxPorPlato } = limitesPara(personas)
      if (actual >= maxPorPlato || contarUnidades(items) >= maxUnidades) return estado
      return { ...estado, items: { ...items, [accion.id]: actual + 1 } }
    }
    case 'RESTAR':
      if (actual === 0) return estado
      if (actual === 1) return { ...estado, items: sinPlato(items, accion.id) }
      return { ...estado, items: { ...items, [accion.id]: actual - 1 } }
    case 'ELIMINAR':
      return { ...estado, items: sinPlato(items, accion.id) }
    case 'PERSONAS': {
      const n = accion.personas
      if (!Number.isInteger(n) || n < MIN_PERSONAS || n > MAX_PERSONAS) return estado
      // No se borran platos a escondidas: si no entran, primero hay que quitarlos
      if (!cabeEnPersonas(items, n)) return estado
      return { ...estado, personas: n }
    }
    case 'LIMPIAR':
      return { ...estado, items: {} }
    default:
      return estado
  }
}

// Revisa un pedido leído de localStorage: descarta datos corruptos o manipulados
export function sanearPedido(guardado) {
  if (!guardado || typeof guardado !== 'object' || typeof guardado.items !== 'object' || guardado.items === null) {
    return ESTADO_INICIAL
  }
  const personas = Number.isInteger(guardado.personas)
    ? Math.min(Math.max(guardado.personas, MIN_PERSONAS), MAX_PERSONAS)
    : MIN_PERSONAS
  const { maxUnidades, maxPorPlato } = limitesPara(personas)
  const items = {}
  let total = 0
  for (const [id, cantidad] of Object.entries(guardado.items)) {
    const n = Math.min(Number(cantidad), maxPorPlato, maxUnidades - total)
    if (Number.isInteger(n) && n > 0) {
      items[id] = n
      total += n
    }
  }
  return { personas, items }
}
