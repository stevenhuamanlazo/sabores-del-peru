import { useState, useMemo } from 'react'
import Navegacion from './components/Navegacion'
import Cabecera from './components/Cabecera'
import PlatosProbados from './components/PlatosProbados'
import ListaPlatos from './components/ListaPlatos'
import Pedido from './components/Pedido'
import Pago from './components/Pago'
import Tema from './components/Tema'
import { useFetch } from './hooks/useFetch'

export default function App() {
  const [vista, setVista] = useState('carta')
  // Se carga una sola vez aquí y se comparte con todas las vistas
  const { data, cargando, error } = useFetch(`${import.meta.env.BASE_URL}platos.json`)
  // IA: [`data ?? []` creaba un array nuevo en cada render y anulaba el useMemo de ListaPlatos]
  // → Solución manual: memorizar platos para que su referencia solo cambie cuando llega data
  const platos = useMemo(() => data ?? [], [data])

  return (
    <>
      <Navegacion vista={vista} onCambiar={setVista} />
      <main>
        <Cabecera />
        {cargando && <p>⏳ Cargando platos...</p>}
        {error && <p>❌ Error: {error}</p>}
        {data && vista === 'carta' && (
          <>
            <PlatosProbados />
            <ListaPlatos platos={platos} />
          </>
        )}
        {data && vista === 'pedido' && <Pedido platos={platos} onPagar={() => setVista('pago')} onVolver={() => setVista('carta')} />}
        {data && vista === 'pago' && <Pago platos={platos} onVolver={() => setVista('carta')} />}
        {vista === 'tema' && <Tema />}
      </main>
    </>
  )
}
