import { useState, useEffect } from 'react'

// Hook personalizado: como useState, pero el valor sobrevive al recargar la página
export function useLocalStorage(clave, valorInicial) {
  const [valor, setValor] = useState(() => {
    try {
      const guardado = localStorage.getItem(clave)
      return guardado !== null ? JSON.parse(guardado) : valorInicial
    } catch {
      return valorInicial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(valor))
    } catch {
      // Modo privado o almacenamiento bloqueado: la app sigue funcionando sin persistir
    }
  }, [clave, valor])

  return [valor, setValor]
}
