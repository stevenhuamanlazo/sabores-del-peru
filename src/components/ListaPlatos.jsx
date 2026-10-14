import { useState, useMemo, useCallback, useRef } from 'react'
import { useFavoritos } from '../context/FavoritosContext'
import { useFetch } from '../hooks/useFetch'
import TarjetaPlato from './TarjetaPlato'

export default function ListaPlatos() {
  // Hook personalizado: encapsula fetch + loading + error + AbortController
  const { data, cargando, error } = useFetch('/platos.json')
  const platos = useMemo(() => data ?? [], [data])

  const [busqueda, setBusqueda] = useState('')
  const [region, setRegion] = useState('Todas')
  const inputRef = useRef(null)
  const { favoritos, dispatch } = useFavoritos()

  // useMemo: solo recalcula si cambian platos, búsqueda o región
  const filtrados = useMemo(
    () => platos.filter(p =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      (region === 'Todas' || p.region === region)),
    [platos, busqueda, region]
  )

  // useMemo: platos del menú y su total
  const seleccionados = useMemo(
    () => platos.filter(p => favoritos.includes(p.id)),
    [platos, favoritos]
  )
  const total = useMemo(
    () => seleccionados.reduce((suma, p) => suma + p.precio, 0),
    [seleccionados]
  )

  // useCallback: la misma función entre renders, así memo funciona
  const toggleFav = useCallback(id => dispatch({ type: 'TOGGLE', id }), [dispatch])

  if (cargando) return <p>⏳ Cargando platos...</p>
  if (error) return <p>❌ Error: {error}</p>

  return (
    <>
      <section className="panel menu">
        <div>
          <h2>🧾 Mi menú ({seleccionados.length} platos)</h2>
          {seleccionados.length === 0
            ? <p>Aún no agregas platos. ¡Elige tus favoritos!</p>
            : <ul>{seleccionados.map(p => <li key={p.id}>{p.emoji} {p.nombre} - S/ {p.precio}</li>)}</ul>}
        </div>
        <div>
          <div className="total">Total: S/ {total}</div>
          <button onClick={() => dispatch({ type: 'LIMPIAR' })}>🗑️ Vaciar menú</button>
        </div>
      </section>

      <section className="panel">
        <h2>📖 Carta ({filtrados.length} {filtrados.length === 1 ? 'plato' : 'platos'})</h2>
        <input ref={inputRef} value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar plato..." />
        <button onClick={() => inputRef.current.focus()}>🔍 Enfocar</button>
        <div>
          {['Todas', 'Costa', 'Sierra', 'Selva'].map(r => (
            <button key={r} className={r === region ? 'chip activo' : 'chip'} onClick={() => setRegion(r)}>{r}</button>
          ))}
        </div>
        <ul className="grid">
          {filtrados.map(p => (
            <TarjetaPlato key={p.id} plato={p} esFavorito={favoritos.includes(p.id)} onToggle={toggleFav} />
          ))}
        </ul>
      </section>
    </>
  )
}