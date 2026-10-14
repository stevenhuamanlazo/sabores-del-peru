import { useMemo } from 'react'
import { usePedido } from '../context/PedidoContext'
import { MAX_POR_PLATO, MAX_UNIDADES, PEDIDO_MINIMO } from '../utils/reglasPedido'

export default function Pedido({ platos, onPagar, onVolver }) {
  const { items, unidades, dispatch } = usePedido()

  // useMemo: líneas del pedido (solo platos que existen en la carta) y su total
  const lineas = useMemo(
    () => platos.filter(p => items[p.id]).map(p => ({ ...p, cantidad: items[p.id] })),
    [platos, items]
  )
  const total = useMemo(
    () => lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0),
    [lineas]
  )
  const falta = PEDIDO_MINIMO - total

  if (lineas.length === 0) {
    return (
      <section className="panel vacio">
        <h2>🛒 Tu pedido está vacío</h2>
        <p>Aún no agregas platos. ¡Elige tus favoritos de la carta!</p>
        <button onClick={onVolver}>📖 Ver la carta</button>
      </section>
    )
  }

  const vaciar = () => {
    if (window.confirm('¿Seguro que quieres vaciar todo el pedido?')) dispatch({ type: 'LIMPIAR' })
  }

  return (
    <section className="panel">
      <h2>🛒 Mi pedido ({unidades} de {MAX_UNIDADES} platos)</h2>
      <ul className="lista-pedido">
        {lineas.map(l => (
          <li key={l.id}>
            <img src={`${import.meta.env.BASE_URL}img/${l.id}.jpg`} alt={l.nombre} />
            <span className="nombre">{l.emoji} {l.nombre}<small>S/ {l.precio} c/u</small></span>
            <div className="contador">
              <button onClick={() => dispatch({ type: 'RESTAR', id: l.id })} aria-label={`Quitar un ${l.nombre}`}>−</button>
              <span>{l.cantidad}</span>
              <button
                onClick={() => dispatch({ type: 'AGREGAR', id: l.id })}
                disabled={l.cantidad >= MAX_POR_PLATO || unidades >= MAX_UNIDADES}
                aria-label={`Agregar un ${l.nombre}`}
              >+</button>
            </div>
            <span className="precio">S/ {l.precio * l.cantidad}</span>
            <button className="quitar" onClick={() => dispatch({ type: 'ELIMINAR', id: l.id })} aria-label={`Eliminar ${l.nombre}`}>✕</button>
          </li>
        ))}
      </ul>
      {falta > 0 && <p className="alerta">⚠️ El pedido mínimo es S/ {PEDIDO_MINIMO}. Te faltan S/ {falta}.</p>}
      <div className="menu">
        <div className="total">Total: S/ {total}</div>
        <div>
          <button className="chip" onClick={vaciar}>🗑️ Vaciar</button>
          <button onClick={onPagar} disabled={falta > 0}>💳 Ir a pagar</button>
        </div>
      </div>
    </section>
  )
}
