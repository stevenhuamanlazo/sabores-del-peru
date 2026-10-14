import { useTema } from '../context/ThemeContext'

export default function Cabecera() {
  const { tema, alternar } = useTema()
  return (
    <header className="hero">
      <div>
        <h1>🇵🇪 Sabores del Perú</h1>
        <p>Descubre, filtra y guarda los platos más ricos de Costa, Sierra y Selva</p>
      </div>
      <button onClick={alternar}>{tema === 'claro' ? '🌙 Modo oscuro' : '☀️ Modo claro'}</button>
    </header>
  )
}