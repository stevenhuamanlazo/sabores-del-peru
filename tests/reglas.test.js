// Pruebas de las reglas del pedido y de la validación del pago (errores humanos típicos).
// Ejecutar: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reducerPedido, contarUnidades, MAX_POR_PLATO, MAX_UNIDADES } from '../src/utils/reglasPedido.js'
import { validarPago, formatos, VUELTO_MAXIMO } from '../src/utils/validaciones.js'

const agregarVeces = (items, id, veces) => {
  for (let i = 0; i < veces; i++) items = reducerPedido(items, { type: 'AGREGAR', id })
  return items
}

test('no se puede pasar del máximo por plato', () => {
  const items = agregarVeces({}, 1, MAX_POR_PLATO + 3)
  assert.equal(items[1], MAX_POR_PLATO)
})

test('no se puede pasar del máximo de platos del pedido', () => {
  let items = {}
  for (let id = 1; id <= 12; id++) items = agregarVeces(items, id, MAX_POR_PLATO)
  assert.equal(contarUnidades(items), MAX_UNIDADES)
})

test('restar hasta cero quita el plato y no deja cantidades negativas', () => {
  let items = agregarVeces({}, 2, 2)
  items = reducerPedido(items, { type: 'RESTAR', id: 2 })
  items = reducerPedido(items, { type: 'RESTAR', id: 2 })
  items = reducerPedido(items, { type: 'RESTAR', id: 2 })
  assert.deepEqual(items, {})
})

test('una acción desconocida no cambia el estado', () => {
  const items = { 1: 2 }
  assert.equal(reducerPedido(items, { type: 'HACKEAR' }), items)
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
