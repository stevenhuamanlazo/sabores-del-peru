import { useState, useCallback } from 'react'

// Hook personalizado: estado de un formulario controlado, reutilizable en cualquier formulario
export function useForm(valoresIniciales) {
  const [valores, setValores] = useState(valoresIniciales)

  const cambiar = useCallback(e => {
    const { name, value } = e.target
    setValores(v => ({ ...v, [name]: value }))
  }, [])

  const reiniciar = useCallback(() => setValores(valoresIniciales), [valoresIniciales])

  return { valores, cambiar, reiniciar }
}
