import { usePedido } from '../context/PedidoContext'
import { MIN_PERSONAS, MAX_PERSONAS, PLATOS_POR_PERSONA, cabeEnPersonas } from '../utils/reglasPedido'

export default function SelectorPersonas() {
  const { personas, items, unidades, maxUnidades, dispatch } = usePedido()
  const puedeBajar = personas > MIN_PERSONAS && cabeEnPersonas(items, personas - 1)
  const cambiar = n => dispatch({ type: 'PERSONAS', personas: n })

  return (
    <div className="personas">
      <span>👥 ¿Para cuántas personas?</span>
      <div className="contador">
        <button onClick={() => cambiar(personas - 1)} disabled={!puedeBajar} aria-label="Una persona menos">−</button>
        <span>{personas}</span>
        <button onClick={() => cambiar(personas + 1)} disabled={personas >= MAX_PERSONAS} aria-label="Una persona más">+</button>
      </div>
      <small>
        {unidades} de {maxUnidades} platos · máx. {PLATOS_POR_PERSONA} por persona y el mismo plato una vez por persona
        {personas > MIN_PERSONAS && !puedeBajar && ' · quita platos para reducir personas'}
        {personas >= MAX_PERSONAS && ` · grupos de más de ${MAX_PERSONAS}: llámanos`}
      </small>
    </div>
  )
}
