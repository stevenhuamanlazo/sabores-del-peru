import { useState, useMemo, useCallback, useRef } from 'react'
import { usePedido } from '../context/PedidoContext'
import TarjetaPlato from './TarjetaPlato'
import SelectorPersonas from './SelectorPersonas'

const REGIONES = ['Todas', 'Costa', 'Sierra', 'Selva']

// Ignora mayúsculas y tildes: "aji" encuentra "Ají de gallina"
const normalizar = texto => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

export default function ListaPlatos({ platos }) {
  const [busqueda, setBusqueda] = useState('')
  const [region, setRegion] = useState('Todas')
  const inputRef = useRef(null)
  const { items, unidades, personas, maxUnidades, maxPorPlato, dispatch } = usePedido()
  const lleno = unidades >= maxUnidades

  // useMemo: solo recalcula si cambian platos, búsqueda o región
  const filtrados = useMemo(() => {
    const termino = normalizar(busqueda)
    return platos.filter(p =>
      normalizar(p.nombre).includes(termino) &&
      (region === 'Todas' || p.region === region))
  }, [platos, busqueda, region])

  // useCallback: las mismas funciones entre renders, así memo funciona
  const agregar = useCallback(id => dispatch({ type: 'AGREGAR', id }), [dispatch])
  const restar = useCallback(id => dispatch({ type: 'RESTAR', id }), [dispatch])

  const limpiarFiltros = () => {
    setBusqueda('')
    setRegion('Todas')
    inputRef.current.focus()
  }

  return (
    <section className="panel">
      <h2>📖 Carta ({filtrados.length} {filtrados.length === 1 ? 'plato' : 'platos'})</h2>
      <input ref={inputRef} value={busqueda} maxLength={40} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar plato..." />
      <button onClick={() => inputRef.current.focus()}>🔍 Enfocar</button>
      <div>
        {REGIONES.map(r => (
          <button key={r} className={r === region ? 'chip activo' : 'chip'} onClick={() => setRegion(r)}>{r}</button>
        ))}
      </div>
      <SelectorPersonas />
      {lleno && <p className="alerta">⚠️ Ya tienes {maxUnidades} platos para {personas} {personas === 1 ? 'persona' : 'personas'}. Si son más, aumenta el número de personas.</p>}
      {filtrados.length === 0
        ? (
          <div className="vacio">
            <p>No encontramos platos con “{busqueda.trim()}”{region !== 'Todas' && ` en ${region}`}.</p>
            <button onClick={limpiarFiltros}>Limpiar filtros</button>
          </div>
        )
        : (
          <ul className="grid">
            {filtrados.map(p => (
              <TarjetaPlato key={p.id} plato={p} cantidad={items[p.id] ?? 0} maxPorPlato={maxPorPlato} bloqueado={lleno} onAgregar={agregar} onRestar={restar} />
            ))}
          </ul>
        )}
    </section>
  )
}
