import { useState, useEffect } from 'react'

export default function ListaPlatos() {
  const [platos, setPlatos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    const cargarPlatos = async () => {
      try {
        const res = await fetch('/platos.json', { signal: controller.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setPlatos(data)
        setCargando(false)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message)
          setCargando(false)
        }
      }
    }

    cargarPlatos()

    return () => controller.abort()
  }, [])

  if (cargando) return <p>⏳ Cargando platos...</p>
  if (error) return <p>❌ Error: {error}</p>

  return (
    <section>
      <h2>📖 Carta ({platos.length} platos)</h2>
      <ul>
        {platos.map(p => (
          <li key={p.id}>
            {p.emoji} <strong>{p.nombre}</strong> ({p.region}) - S/ {p.precio}
          </li>
        ))}
      </ul>
    </section>
  )
}