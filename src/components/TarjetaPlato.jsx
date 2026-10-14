import { memo } from 'react'
import { MAX_POR_PLATO } from '../utils/reglasPedido'

function TarjetaPlato({ plato, cantidad, bloqueado, onAgregar, onRestar }) {
  const limitePlato = cantidad >= MAX_POR_PLATO
  return (
    <li className="card">
      <img className="foto" src={`${import.meta.env.BASE_URL}img/${plato.id}.jpg`} alt={plato.nombre} loading="lazy" />
      <h3>{plato.emoji} {plato.nombre}</h3>
      <span className={`badge ${plato.region}`}>{plato.region}</span>
      <p><small>{plato.descripcion}</small></p>
      <p className="precio">S/ {plato.precio}</p>
      {cantidad === 0
        ? <button onClick={() => onAgregar(plato.id)} disabled={bloqueado}>🛒 Agregar al pedido</button>
        : (
          <div className="contador">
            <button onClick={() => onRestar(plato.id)} aria-label={`Quitar un ${plato.nombre}`}>−</button>
            <span>{cantidad}</span>
            <button onClick={() => onAgregar(plato.id)} disabled={bloqueado || limitePlato} aria-label={`Agregar un ${plato.nombre}`}>+</button>
          </div>
        )}
      {limitePlato && <small className="aviso">Máximo {MAX_POR_PLATO} por plato</small>}
    </li>
  )
}

export default memo(TarjetaPlato)
