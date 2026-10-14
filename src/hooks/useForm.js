import { useState, useCallback } from 'react'

// Hook personalizado: formulario controlado con validación y formato de entrada.
// - validar(valores) devuelve { campo: 'mensaje' } con los errores
// - formatos { campo: fn } limpia lo que escribe el usuario (ej. solo dígitos)
// Los errores solo se muestran en campos ya visitados o después de intentar enviar.
export function useForm(valoresIniciales, validar, formatos = {}) {
  const [valores, setValores] = useState(valoresIniciales)
  const [tocados, setTocados] = useState({})
  const [intentoEnvio, setIntentoEnvio] = useState(false)

  // Derivado en cada render: no necesita estado propio ni useEffect
  const errores = validar(valores)
  const esValido = Object.keys(errores).length === 0
  const errorDe = campo => (tocados[campo] || intentoEnvio ? errores[campo] : undefined)

  const cambiar = useCallback(e => {
    const { name, value } = e.target
    const formatear = formatos[name]
    setValores(v => ({ ...v, [name]: formatear ? formatear(value) : value }))
  }, [formatos])

  const tocar = useCallback(e => {
    const { name } = e.target
    setTocados(t => ({ ...t, [name]: true }))
  }, [])

  const reiniciar = useCallback(() => {
    setValores(valoresIniciales)
    setTocados({})
    setIntentoEnvio(false)
  }, [valoresIniciales])

  // Llamar al enviar: muestra todos los errores y devuelve si se puede continuar
  const validarEnvio = () => {
    setIntentoEnvio(true)
    return esValido
  }

  return { valores, errorDe, esValido, cambiar, tocar, reiniciar, validarEnvio }
}
