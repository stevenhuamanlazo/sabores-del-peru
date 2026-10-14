import { useTema } from '../context/ThemeContext'

export default function Cabecera() {
  const { tema, alternar } = useTema()
  return (
    <header>
      <h1>🇵🇪 Sabores del Perú</h1>
      <button onClick={alternar}>🌓 Tema: {tema}</button>
    </header>
  )
}