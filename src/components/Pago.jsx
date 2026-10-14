import { useState, useMemo, useCallback, useRef } from 'react'
import { usePedido } from '../context/PedidoContext'
import { PEDIDO_MINIMO } from '../utils/reglasPedido'
import { useForm } from '../hooks/useForm'
import { validarPago, formatos, METODOS } from '../utils/validaciones'

// Fuera del componente: misma referencia en cada render (no rompe el useCallback de useForm)
const INICIAL = { nombre: '', telefono: '', direccion: '', referencia: '', metodo: 'Yape', pagaCon: '', tarjeta: '', vencimiento: '', cvv: '' }

function Campo({ etiqueta, error, children }) {
  return (
    <label className={error ? 'campo invalido' : 'campo'}>
      {etiqueta}
      {children}
      {error && <small className="error">{error}</small>}
    </label>
  )
}

export default function Pago({ platos, onVolver, onVerPedido }) {
  const { items, personas, dispatch } = usePedido()
  const [confirmado, setConfirmado] = useState(null)
  const enviando = useRef(false)

  const lineas = useMemo(
    () => platos.filter(p => items[p.id]).map(p => ({ ...p, cantidad: items[p.id] })),
    [platos, items]
  )
  const total = useMemo(
    () => lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0),
    [lineas]
  )

  // useCallback: la validación depende del total (el vuelto en efectivo se compara con él)
  const validar = useCallback(v => validarPago(v, total), [total])
  const { valores, errorDe, cambiar, tocar, reiniciar, validarEnvio } = useForm(INICIAL, validar, formatos)

  const confirmar = e => {
    e.preventDefault()
    // useRef evita un doble envío si el usuario hace doble clic
    if (enviando.current || !validarEnvio()) return
    enviando.current = true
    setConfirmado({
      nombre: valores.nombre.trim().replace(/\s+/g, ' '),
      direccion: valores.direccion.trim(),
      metodo: valores.metodo,
      vuelto: valores.metodo === 'Efectivo' ? Number(valores.pagaCon) - total : 0,
      total,
      personas,
      codigo: Date.now().toString().slice(-6),
    })
    dispatch({ type: 'LIMPIAR' })
    reiniciar()
  }

  if (confirmado) {
    return (
      <section className="panel vacio">
        <h2>✅ ¡Pedido confirmado!</h2>
        <p>Gracias, <b>{confirmado.nombre}</b>. Tu pedido <b>#{confirmado.codigo}</b> para {confirmado.personas} {confirmado.personas === 1 ? 'persona' : 'personas'} por <b>S/ {confirmado.total}</b> ({confirmado.metodo}) llegará a {confirmado.direccion}.</p>
        {confirmado.vuelto > 0 && <p>El repartidor llevará <b>S/ {confirmado.vuelto.toFixed(2)}</b> de vuelto.</p>}
        <button onClick={() => { enviando.current = false; setConfirmado(null); onVolver() }}>📖 Volver a la carta</button>
      </section>
    )
  }

  if (lineas.length === 0) {
    return (
      <section className="panel vacio">
        <h2>💳 No hay nada que pagar</h2>
        <p>Agrega platos a tu pedido primero.</p>
        <button onClick={onVolver}>📖 Ver la carta</button>
      </section>
    )
  }

  if (total < PEDIDO_MINIMO) {
    return (
      <section className="panel vacio">
        <h2>💳 Aún no llegas al pedido mínimo</h2>
        <p>El pedido mínimo es S/ {PEDIDO_MINIMO} y llevas S/ {total}.</p>
        <button onClick={onVerPedido}>🛒 Revisar mi pedido</button>
      </section>
    )
  }

  const props = campo => ({ name: campo, value: valores[campo], onChange: cambiar, onBlur: tocar, 'aria-invalid': !!errorDe(campo) })

  return (
    <section className="panel pago">
      <form onSubmit={confirmar} noValidate>
        <h2>💳 Datos de entrega</h2>
        <Campo etiqueta="Nombre y apellido" error={errorDe('nombre')}>
          <input {...props('nombre')} maxLength={50} autoComplete="name" placeholder="Ej. Rosa Quispe" />
        </Campo>
        <Campo etiqueta="Celular" error={errorDe('telefono')}>
          <input {...props('telefono')} inputMode="numeric" autoComplete="tel" placeholder="987 654 321" />
        </Campo>
        <Campo etiqueta="Dirección" error={errorDe('direccion')}>
          <input {...props('direccion')} maxLength={100} autoComplete="street-address" placeholder="Jr. Puno 123, Huancayo" />
        </Campo>
        <Campo etiqueta="Referencia (opcional)">
          <input {...props('referencia')} maxLength={80} placeholder="Frente al parque" />
        </Campo>
        <Campo etiqueta="Método de pago" error={errorDe('metodo')}>
          <select {...props('metodo')}>
            {METODOS.map(m => <option key={m}>{m}</option>)}
          </select>
        </Campo>

        {(valores.metodo === 'Yape' || valores.metodo === 'Plin') && (
          <p className="nota">📱 Te enviaremos la solicitud de pago por {valores.metodo} al celular que ingresaste.</p>
        )}

        {valores.metodo === 'Efectivo' && (
          <Campo etiqueta="¿Con cuánto pagarás? (S/)" error={errorDe('pagaCon')}>
            <input {...props('pagaCon')} inputMode="decimal" placeholder={`Mínimo ${total}`} />
          </Campo>
        )}

        {valores.metodo === 'Tarjeta' && (
          <>
            <Campo etiqueta="Número de tarjeta" error={errorDe('tarjeta')}>
              <input {...props('tarjeta')} inputMode="numeric" autoComplete="cc-number" placeholder="4111 1111 1111 1111" />
            </Campo>
            <div className="fila">
              <Campo etiqueta="Vence (MM/AA)" error={errorDe('vencimiento')}>
                <input {...props('vencimiento')} inputMode="numeric" autoComplete="cc-exp" placeholder="08/28" />
              </Campo>
              <Campo etiqueta="CVV" error={errorDe('cvv')}>
                <input {...props('cvv')} inputMode="numeric" autoComplete="cc-csc" placeholder="123" />
              </Campo>
            </div>
            <p className="nota">🔒 Demo académica: los datos no se envían a ningún servidor.</p>
          </>
        )}

        <button type="submit">✅ Confirmar pedido (S/ {total})</button>
      </form>
      <aside>
        <h3>🧾 Resumen · 👥 {personas}</h3>
        <ul>{lineas.map(l => <li key={l.id}><span>{l.cantidad} × {l.emoji} {l.nombre}</span> <b>S/ {l.precio * l.cantidad}</b></li>)}</ul>
        <div className="total">Total: S/ {total}</div>
        <button className="chip" onClick={onVerPedido}>✏️ Editar pedido</button>
      </aside>
    </section>
  )
}
