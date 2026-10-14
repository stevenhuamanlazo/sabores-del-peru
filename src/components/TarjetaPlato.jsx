import { memo } from 'react'

function TarjetaPlato({ plato, esFavorito, onToggle }) {
  return (
    <li className="card">
      <div className="emoji">{plato.emoji}</div>
      <h3>{plato.nombre}</h3>
      <span className={`badge ${plato.region}`}>{plato.region}</span>
      <p><small>{plato.descripcion}</small></p>
      <p className="precio">S/ {plato.precio}</p>
      <button onClick={() => onToggle(plato.id)}>
        {esFavorito ? '❤️ Quitar' : '🤍 Agregar a mi menú'}
      </button>
    </li>
  )
}

export default memo(TarjetaPlato)