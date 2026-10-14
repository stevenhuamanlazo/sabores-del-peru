import { useMemo } from 'react'
import { useFavoritos } from '../context/FavoritosContext'

export default function Pedido({ platos, onPagar, onVolver }) {
  const { favoritos, dispatch } = useFavoritos()

  // useMemo: platos del pedido y su total
  const seleccionados = useMemo(
    () => platos.filter(p => favoritos.includes(p.id)),
    [platos, favoritos]
  )
  const total = useMemo(
    () => seleccionados.reduce((suma, p) => suma + p.precio, 0),
    [seleccionados]
  )

  if (seleccionados.length === 0) {
    return (
      <section className="panel vacio">
        <h2>🛒 Tu pedido está vacío</h2>
        <p>Aún no agregas platos. ¡Elige tus favoritos de la carta!</p>
        <button onClick={onVolver}>📖 Ver la carta</button>
      </section>
    )
  }

  return (
    <section className="panel">
      <h2>🛒 Mi pedido ({seleccionados.length} {seleccionados.length === 1 ? 'plato' : 'platos'})</h2>
      <ul className="lista-pedido">
        {seleccionados.map(p => (
          <li key={p.id}>
            <img src={`${import.meta.env.BASE_URL}img/${p.id}.jpg`} alt={p.nombre} />
            <span className="nombre">{p.emoji} {p.nombre}</span>
            <span className="precio">S/ {p.precio}</span>
            <button className="quitar" onClick={() => dispatch({ type: 'TOGGLE', id: p.id })}>✕</button>
          </li>
        ))}
      </ul>
      <div className="menu">
        <div className="total">Total: S/ {total}</div>
        <div>
          <button className="chip" onClick={() => dispatch({ type: 'LIMPIAR' })}>🗑️ Vaciar</button>
          <button onClick={onPagar}>💳 Ir a pagar</button>
        </div>
      </div>
    </section>
  )
}
