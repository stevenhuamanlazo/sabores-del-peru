import { useTema } from '../context/ThemeContext'

const OPCIONES = [
  { id: 'claro', etiqueta: '☀️ Claro', descripcion: 'Fondo crema y acentos naranja' },
  { id: 'oscuro', etiqueta: '🌙 Oscuro', descripcion: 'Ideal para la noche' },
]

export default function Tema() {
  const { tema, setTema } = useTema()
  return (
    <section className="panel">
      <h2>🎨 Tema de la aplicación</h2>
      <p>Tema actual: <b>{tema}</b> (compartido con useContext en toda la app)</p>
      <div className="temas">
        {OPCIONES.map(o => (
          <button key={o.id} className={`tema-opcion ${o.id}${o.id === tema ? ' activo' : ''}`} onClick={() => setTema(o.id)}>
            <span className="etiqueta">{o.etiqueta}</span>
            <small>{o.descripcion}</small>
          </button>
        ))}
      </div>
    </section>
  )
}
