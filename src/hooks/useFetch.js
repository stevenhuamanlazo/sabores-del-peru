import { useState, useEffect } from 'react'

export function useFetch(url) {
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const cargar = async () => {
      try {
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setData(await res.json())
        setCargando(false)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message)
          setCargando(false)
        }
      }
    }
    cargar()
    return () => controller.abort()
  }, [url])

  return { data, cargando, error }
}