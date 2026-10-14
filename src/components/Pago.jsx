import { useState, useMemo } from 'react'
import { useFavoritos } from '../context/FavoritosContext'
import { useForm } from '../hooks/useForm'

// Fuera del componente: misma referencia en cada render (no rompe el useCallback de useForm)
const INICIAL = { nombre: '', telefono: '', direccion: '', metodo: 'Yape' }

export default function Pago({ platos, onVolver }) {
  const { favoritos, dispatch } = useFavoritos()
  const { valores, cambiar, reiniciar } = useForm(INICIAL)
  const [confirmado, setConfirmado] = useState(null)

  const seleccionados = useMemo(
    () => platos.filter(p => favoritos.includes(p.id)),
    [platos, favoritos]
  )
  const total = useMemo(
    () => seleccionados.reduce((suma, p) => suma + p.precio, 0),
    [seleccionados]
  )

  const enviar = e => {
    e.preventDefault()
    setConfirmado({ ...valores, total, codigo: Date.now().toString().slice(-6) })
    dispatch({ type: 'LIMPIAR' })
    reiniciar()
  }

  if (confirmado) {
    return (
      <section className="panel vacio">
        <h2>✅ ¡Pedido confirmado!</h2>
        <p>Gracias, <b>{confirmado.nombre}</b>. Tu pedido <b>#{confirmado.codigo}</b> por <b>S/ {confirmado.total}</b> ({confirmado.metodo}) llegará a {confirmado.direccion}.</p>
        <button onClick={() => { setConfirmado(null); onVolver() }}>📖 Volver a la carta</button>
      </section>
    )
  }

  if (seleccionados.length === 0) {
    return (
      <section className="panel vacio">
        <h2>💳 No hay nada que pagar</h2>
        <p>Agrega platos a tu pedido primero.</p>
        <button onClick={onVolver}>📖 Ver la carta</button>
      </section>
    )
  }

  return (
    <section className="panel pago">
      <form onSubmit={enviar}>
        <h2>💳 Datos de entrega</h2>
        <label>Nombre<input name="nombre" value={valores.nombre} onChange={cambiar} required /></label>
        <label>Teléfono<input name="telefono" type="tel" pattern="9[0-9]{8}" title="Celular de 9 dígitos que empieza en 9" value={valores.telefono} onChange={cambiar} required /></label>
        <label>Dirección<input name="direccion" value={valores.direccion} onChange={cambiar} required /></label>
        <label>Método de pago
          <select name="metodo" value={valores.metodo} onChange={cambiar}>
            <option>Yape</option>
            <option>Plin</option>
            <option>Tarjeta</option>
            <option>Efectivo</option>
          </select>
        </label>
        <button type="submit">✅ Confirmar pedido (S/ {total})</button>
      </form>
      <aside>
        <h3>🧾 Resumen</h3>
        <ul>{seleccionados.map(p => <li key={p.id}>{p.emoji} {p.nombre} <b>S/ {p.precio}</b></li>)}</ul>
        <div className="total">Total: S/ {total}</div>
      </aside>
    </section>
  )
}
