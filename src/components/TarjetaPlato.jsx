import { memo } from 'react'

function TarjetaPlato({ plato, esFavorito, onToggle }) {
  return (
    <li className="card">
      <img className="foto" src={`/img/${plato.id}.jpg`} alt={plato.nombre} loading="lazy" />
      <h3>{plato.emoji} {plato.nombre}</h3>
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