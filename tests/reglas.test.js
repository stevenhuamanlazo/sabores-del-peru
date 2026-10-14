// Pruebas de las reglas del pedido y de la validación del pago (errores humanos típicos).
// Ejecutar: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reducerPedido, contarUnidades, sanearPedido, ESTADO_INICIAL, MAX_PERSONAS } from '../src/utils/reglasPedido.js'
import { validarPago, formatos, VUELTO_MAXIMO } from '../src/utils/validaciones.js'

const aplicar = (estado, ...acciones) => acciones.reduce(reducerPedido, estado)
const agregarVeces = (estado, id, veces) => aplicar(estado, ...Array(veces).fill({ type: 'AGREGAR', id }))
const conPersonas = n => aplicar(ESTADO_INICIAL, ...Array.from({ length: n - 1 }, (_, i) => ({ type: 'PERSONAS', personas: i + 2 })))

test('1 persona no puede pedir 11 platos: máximo 2', () => {
  let estado = ESTADO_INICIAL
  for (let id = 1; id <= 11; id++) estado = agregarVeces(estado, id, 1)
  assert.equal(contarUnidades(estado.items), 2)
})

test('1 persona no puede pedir el mismo plato dos veces', () => {
  const estado = agregarVeces(ESTADO_INICIAL, 1, 3)
  assert.equal(estado.items[1], 1)
})

test('4 personas: hasta 8 platos y hasta 4 del mismo', () => {
  let estado = agregarVeces(conPersonas(4), 1, 6)
  assert.equal(estado.items[1], 4)
  for (let id = 2; id <= 12; id++) estado = agregarVeces(estado, id, 4)
  assert.equal(contarUnidades(estado.items), 8)
})

test('no se puede bajar personas si el pedido ya no entra', () => {
  const estado = agregarVeces(conPersonas(3), 1, 3)
  assert.equal(reducerPedido(estado, { type: 'PERSONAS', personas: 2 }).personas, 3)
  const ajustado = aplicar(estado, { type: 'RESTAR', id: 1 }, { type: 'PERSONAS', personas: 2 })
  assert.equal(ajustado.personas, 2)
})

test('personas fuera de rango o no enteras se ignoran', () => {
  assert.equal(reducerPedido(ESTADO_INICIAL, { type: 'PERSONAS', personas: 0 }).personas, 1)
  assert.equal(reducerPedido(ESTADO_INICIAL, { type: 'PERSONAS', personas: MAX_PERSONAS + 1 }).personas, 1)
  assert.equal(reducerPedido(ESTADO_INICIAL, { type: 'PERSONAS', personas: 2.5 }).personas, 1)
})

test('restar hasta cero quita el plato y no deja cantidades negativas', () => {
  const estado = aplicar(agregarVeces(ESTADO_INICIAL, 2, 1), { type: 'RESTAR', id: 2 }, { type: 'RESTAR', id: 2 })
  assert.deepEqual(estado.items, {})
})

test('una acción desconocida no cambia el estado', () => {
  assert.equal(reducerPedido(ESTADO_INICIAL, { type: 'HACKEAR' }), ESTADO_INICIAL)
})

test('un pedido guardado manipulado se recorta a los límites', () => {
  const saneado = sanearPedido({ personas: 1, items: { 1: 50, 2: -3, 3: 'x', 4: 1, 5: 1 } })
  assert.deepEqual(saneado, { personas: 1, items: { 1: 1, 4: 1 } })
  assert.deepEqual(sanearPedido(null), ESTADO_INICIAL)
  assert.deepEqual(sanearPedido([1, 2]), ESTADO_INICIAL)
})

const base = { nombre: 'Rosa Quispe', telefono: '987 654 321', direccion: 'Jr. Puno 123, Huancayo', referencia: '', metodo: 'Yape', pagaCon: '', tarjeta: '', vencimiento: '', cvv: '' }
const errores = (cambios, total = 50) => validarPago({ ...base, ...cambios }, total)

test('datos correctos no tienen errores', () => {
  assert.deepEqual(errores({}), {})
})

test('nombre: vacío, solo espacios, números o una sola palabra', () => {
  assert.ok(errores({ nombre: '' }).nombre)
  assert.ok(errores({ nombre: '     ' }).nombre)
  assert.ok(errores({ nombre: 'Rosa123' }).nombre)
  assert.ok(errores({ nombre: 'Rosa' }).nombre)
  assert.ok(errores({ nombre: 'R Q' }).nombre)
  assert.equal(errores({ nombre: '  María   Ñahui  ' }).nombre, undefined)
})

test('celular: longitud incorrecta o que no empieza en 9', () => {
  assert.ok(errores({ telefono: '98765432' }).telefono)
  assert.ok(errores({ telefono: '887654321' }).telefono)
  assert.ok(errores({ telefono: 'abc' }).telefono)
  assert.equal(errores({ telefono: '987654321' }).telefono, undefined)
})

test('dirección: muy corta o sin número', () => {
  assert.ok(errores({ direccion: 'Jr 1' }).direccion)
  assert.ok(errores({ direccion: 'Avenida Huancavelica' }).direccion)
  assert.ok(errores({ direccion: '12345678901' }).direccion)
})

test('método de pago manipulado', () => {
  assert.ok(errores({ metodo: 'Bitcoin' }).metodo)
})

test('efectivo: no cubre el total o pide demasiado vuelto', () => {
  assert.ok(errores({ metodo: 'Efectivo', pagaCon: '' }).pagaCon)
  assert.ok(errores({ metodo: 'Efectivo', pagaCon: '40' }, 50).pagaCon)
  assert.ok(errores({ metodo: 'Efectivo', pagaCon: String(50 + VUELTO_MAXIMO + 1) }, 50).pagaCon)
  assert.equal(errores({ metodo: 'Efectivo', pagaCon: '100' }, 50).pagaCon, undefined)
})

test('tarjeta: dígitos, Luhn, vencimiento y CVV', () => {
  const anioFuturo = String((new Date().getFullYear() + 2) % 100).padStart(2, '0')
  const ok = { metodo: 'Tarjeta', tarjeta: '4111 1111 1111 1111', vencimiento: `12/${anioFuturo}`, cvv: '123' }
  assert.deepEqual(errores(ok), {})
  assert.ok(errores({ ...ok, tarjeta: '4111 1111 1111 1112' }).tarjeta)
  assert.ok(errores({ ...ok, tarjeta: '4111 1111' }).tarjeta)
  assert.ok(errores({ ...ok, vencimiento: '01/20' }).vencimiento)
  assert.ok(errores({ ...ok, vencimiento: '13/30' }).vencimiento)
  assert.ok(errores({ ...ok, vencimiento: '1230' }).vencimiento)
  assert.ok(errores({ ...ok, cvv: '12' }).cvv)
})

test('los formatos limpian lo que escribe el usuario', () => {
  assert.equal(formatos.telefono('987-654-321 ext'), '987 654 321')
  assert.equal(formatos.tarjeta('4111a1111b1111c11112222'), '4111 1111 1111 1111')
  assert.equal(formatos.vencimiento('1230'), '12/30')
  assert.equal(formatos.cvv('12a34'), '123')
  assert.equal(formatos.pagaCon('1o0.5.55'), '10.55')
})
