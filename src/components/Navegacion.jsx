import { usePedido } from '../context/PedidoContext'

const VISTAS = [
  { id: 'carta', etiqueta: '📖 Carta' },
  { id: 'pedido', etiqueta: '🛒 Mi pedido' },
  { id: 'pago', etiqueta: '💳 Pago' },
  { id: 'tema', etiqueta: '🎨 Tema' },
]

export default function Navegacion({ vista, onCambiar }) {
  const { unidades } = usePedido()
  return (
    <nav className="nav">
      <span className="marca">🇵🇪 Sabores del Perú</span>
      <div className="tabs">
        {VISTAS.map(v => (
          <button key={v.id} className={v.id === vista ? 'tab activo' : 'tab'} onClick={() => onCambiar(v.id)}>
            {v.etiqueta}{v.id === 'pedido' && ` (${unidades})`}
          </button>
        ))}
      </div>
    </nav>
  )
}
