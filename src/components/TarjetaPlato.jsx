import { memo } from 'react'

function TarjetaPlato({ plato, esFavorito, onToggle }) {
  return (
    <li className="card">
      <h3>{plato.emoji} {plato.nombre}</h3>
      <p>{plato.region} · S/ {plato.precio}</p>
      <p><small>{plato.descripcion}</small></p>
      <button onClick={() => onToggle(plato.id)}>{esFavorito ? '❤️ Quitar' : '🤍 Favorito'}</button>
    </li>
  )
}

export default memo(TarjetaPlato)