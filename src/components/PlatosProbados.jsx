import { useState, useRef } from 'react'

export default function PlatosProbados() {
  // useState: al cambiar, dispara un re-render
  const [probados, setProbados] = useState(0)

  // useRef: guarda un valor entre renders sin provocar uno.
  // Se modifica solo dentro de eventos (permitido por ESLint).
  const clicksSinRender = useRef(0)

  // Contador de renders (solo para la demo didáctica)
  const renders = useRef(0)
  // eslint-disable-next-line react-hooks/refs -- Demo didáctica: contar renders con useRef a propósito para mostrar el doble render de StrictMode. La medición real se hace con el Profiler.
  renders.current += 1

  const sumarSinRender = () => {
    clicksSinRender.current += 1
    console.log('Clicks sin re-render:', clicksSinRender.current)
  }

  // eslint-disable-next-line react-hooks/refs -- Demo didáctica: mostrar el número de renders en pantalla
  const totalRenders = renders.current

  return (
    <section className="panel">
      <h2>🍽️ Platos probados: {probados}</h2>
      <button onClick={() => setProbados(p => p + 1)}>Probar un plato</button>
      <button onClick={sumarSinRender}>Sumar a useRef (no re-renderiza)</button>
      <button onClick={() => setProbados(0)}>Reset</button>
      <p>Renders de este componente: {totalRenders}</p>
    </section>
  )
}