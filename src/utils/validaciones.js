// Reglas de validación del formulario de pago. Funciones puras: reciben valores y devuelven errores.

export const METODOS = ['Yape', 'Plin', 'Tarjeta', 'Efectivo']
export const VUELTO_MAXIMO = 200

const soloDigitos = texto => texto.replace(/\D/g, '')

// Algoritmo de Luhn: detecta números de tarjeta mal digitados
function luhnValido(numero) {
  let suma = 0
  for (let i = 0; i < numero.length; i++) {
    let d = Number(numero[numero.length - 1 - i])
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    suma += d
  }
  return suma % 10 === 0
}

function validarVencimiento(texto, hoy = new Date()) {
  const m = /^(\d{2})\/(\d{2})$/.exec(texto)
  if (!m) return 'Usa el formato MM/AA'
  const mes = Number(m[1])
  const anio = 2000 + Number(m[2])
  if (mes < 1 || mes > 12) return 'El mes debe estar entre 01 y 12'
  const actual = hoy.getFullYear() * 12 + hoy.getMonth()
  const vence = anio * 12 + (mes - 1)
  if (vence < actual) return 'La tarjeta está vencida'
  if (vence > actual + 12 * 10) return 'Fecha de vencimiento no válida'
  return null
}

export function validarPago(v, total) {
  const errores = {}

  const nombre = v.nombre.trim().replace(/\s+/g, ' ')
  if (!nombre) errores.nombre = 'Ingresa tu nombre'
  else if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/.test(nombre)) errores.nombre = 'Solo letras y espacios'
  else if (nombre.split(' ').filter(p => p.length >= 2).length < 2) errores.nombre = 'Escribe nombre y apellido'
  else if (nombre.length > 50) errores.nombre = 'Máximo 50 caracteres'

  const telefono = soloDigitos(v.telefono)
  if (!telefono) errores.telefono = 'Ingresa tu celular'
  else if (!/^9\d{8}$/.test(telefono)) errores.telefono = 'Celular peruano: 9 dígitos y empieza en 9'

  const direccion = v.direccion.trim()
  if (!direccion) errores.direccion = 'Ingresa la dirección de entrega'
  else if (direccion.length < 10) errores.direccion = 'Dirección muy corta (ej. Jr. Puno 123, Huancayo)'
  else if (!/[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(direccion) || !/\d/.test(direccion)) errores.direccion = 'Incluye calle y número'

  if (!METODOS.includes(v.metodo)) errores.metodo = 'Elige un método de pago'

  if (v.metodo === 'Efectivo') {
    const pagaCon = Number(v.pagaCon)
    if (v.pagaCon === '') errores.pagaCon = 'Indica con cuánto pagarás'
    else if (!Number.isFinite(pagaCon) || pagaCon <= 0) errores.pagaCon = 'Monto no válido'
    else if (pagaCon < total) errores.pagaCon = `Debe cubrir el total de S/ ${total}`
    else if (pagaCon - total > VUELTO_MAXIMO) errores.pagaCon = `No podemos dar más de S/ ${VUELTO_MAXIMO} de vuelto`
  }

  if (v.metodo === 'Tarjeta') {
    const numero = soloDigitos(v.tarjeta)
    if (!numero) errores.tarjeta = 'Ingresa el número de tarjeta'
    else if (numero.length !== 16) errores.tarjeta = 'Debe tener 16 dígitos'
    else if (!luhnValido(numero)) errores.tarjeta = 'Número de tarjeta no válido'

    const errVence = validarVencimiento(v.vencimiento)
    if (errVence) errores.vencimiento = errVence

    if (!/^\d{3}$/.test(v.cvv)) errores.cvv = 'El CVV tiene 3 dígitos'
  }

  return errores
}

// Formateadores: corrigen la entrada mientras el usuario escribe
export const formatos = {
  telefono: t => soloDigitos(t).slice(0, 9).replace(/(\d{3})(?=\d)/g, '$1 '),
  tarjeta: t => soloDigitos(t).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '),
  vencimiento: t => {
    const d = soloDigitos(t).slice(0, 4)
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
  },
  cvv: t => soloDigitos(t).slice(0, 3),
  pagaCon: t => t.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1').replace(/(\.\d{2})\d+/, '$1'),
}
