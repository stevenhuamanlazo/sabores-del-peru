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

  // useCallback: la misma función entre renders, así memo funciona
  const toggleFav = useCallback(id => dispatch({ type: 'TOGGLE', id }), [dispatch])

  if (cargando) return <p>⏳ Cargando platos...</p>
  if (error) return <p>❌ Error: {error}</p>

  return (
    <section>
      <h2>📖 Carta ({filtrados.length} platos) · ❤️ {favoritos.length}</h2>
      <input ref={inputRef} value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar plato..." />
      <button onClick={() => inputRef.current.focus()}>🔍 Enfocar</button>
      <div>
        {['Todas', 'Costa', 'Sierra', 'Selva'].map(r => (
          <button key={r} onClick={() => setRegion(r)}>{r}</button>
        ))}
      </div>
      <ul className="grid">
        {filtrados.map(p => (
          <TarjetaPlato key={p.id} plato={p} esFavorito={favoritos.includes(p.id)} onToggle={toggleFav} />
        ))}
      </ul>
    </section>
  )
}