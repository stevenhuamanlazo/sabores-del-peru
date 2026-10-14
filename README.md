# 🇵🇪 Sabores del Perú

SPA en React + Vite para explorar platos peruanos, armar un pedido y pagarlo. Desarrollada para la **Guía Práctica Semana 07 – React Hooks** del curso *Desarrollo de Aplicaciones Web (IS093A)*, UNCP.

- 🌐 **Demo en vivo (GitHub Pages):** https://stevenhuamanlazo.github.io/sabores-del-peru/
- 📦 **Repositorio:** https://github.com/stevenhuamanlazo/sabores-del-peru
- 👤 **Autor:** Steven Huamanlazo Pariona

## Vistas de la SPA

| Vista | Qué hace |
|---|---|
| 📖 **Carta** | Lista de platos con búsqueda, filtro por región (Costa/Sierra/Selva) y contador de platos probados |
| 🛒 **Mi pedido** | Cantidades con + / −, subtotal por plato, total, eliminar o vaciar (con confirmación) |
| 💳 **Pago** | Formulario de entrega validado, campos según el método de pago y confirmación del pedido |
| 🎨 **Tema** | Selección de tema claro u oscuro, compartido por toda la app |

La navegación entre vistas se hace con `useState` en `App.jsx` (sin recargar la página). El pedido y el tema se guardan en `localStorage`, así que no se pierden al recargar.

## Reglas de negocio y validaciones

**Pedido** (`src/utils/reglasPedido.js`, aplicadas dentro del reducer para que ninguna vista pueda saltárselas):
- Máximo **5 unidades por plato** y **15 platos por pedido**. Los botones se desactivan y se muestra un aviso al llegar al límite.
- **Pedido mínimo de S/ 20** para poder pagar.
- Restar nunca deja cantidades negativas. Vaciar el pedido pide confirmación.
- El pedido guardado en `localStorage` se revisa al cargar: los datos corruptos o manipulados se descartan.

**Formulario de pago** (`src/utils/validaciones.js`):

| Campo | Regla | Ejemplo de error humano que detecta |
|---|---|---|
| Nombre | Solo letras, nombre **y** apellido, máx. 50 | `Rosa`, `Rosa123`, solo espacios |
| Celular | 9 dígitos y empieza en 9 (se formatea `987 654 321`) | `98765432`, `887654321` |
| Dirección | Mínimo 10 caracteres, con calle **y** número | `Jr 1`, `Avenida Huancavelica` |
| Efectivo | Debe cubrir el total y el vuelto no puede pasar de S/ 200 | pagar S/ 40 un pedido de S/ 50 |
| Tarjeta | 16 dígitos + algoritmo de **Luhn**, vencimiento MM/AA no vencido, CVV de 3 dígitos | un dígito mal escrito, tarjeta vencida, mes 13 |

Los errores aparecen al salir de cada campo o al intentar enviar. Los campos numéricos solo aceptan dígitos mientras se escribe, y un `useRef` evita que un doble clic confirme el pedido dos veces. La búsqueda ignora tildes y mayúsculas (`aji` encuentra *Ají de gallina*) y muestra un mensaje cuando no hay resultados.

## Los 5 pasos de la guía

### Paso 1 – Ciclo de render, StrictMode y Profiler
- `main.jsx` envuelve la app en `<StrictMode>`, que en desarrollo ejecuta dos veces el render y los efectos.
- `PlatosProbados.jsx` compara `useState` (cambiar el contador re-renderiza) con `useRef` (cambiar el valor **no** re-renderiza) y muestra cuántas veces se renderizó el componente.
- El rendimiento se midió con la pestaña **Profiler** de React DevTools, no con `console.log`.

### Paso 2 – `useEffect` con async/await y limpieza
- `hooks/useFetch.js`: el fetch usa `async/await` dentro de `useEffect`, tiene `[url]` como array de dependencias y un `AbortController` en la función de limpieza.
- **¿Por qué `[]` no significa "se ejecuta una vez" en StrictMode?** En desarrollo React monta, desmonta y vuelve a montar cada componente para comprobar que la limpieza es correcta. Por eso el efecto corre dos veces. El `AbortController` cancela la primera petición y evita actualizar el estado de un componente desmontado (fuga de memoria). En producción el efecto corre una sola vez.

### Paso 3 – `useContext` sin prop drilling
Los contextos están separados por dominio, como pide la guía:
- `context/ThemeContext.jsx`: tema claro/oscuro, usado en `Cabecera` y en la vista `Tema`.
- `context/PedidoContext.jsx`: el pedido, manejado con **`useReducer`** (acciones `AGREGAR`, `RESTAR`, `ELIMINAR` y `LIMPIAR`), usado en `Navegacion`, `ListaPlatos`, `Pedido` y `Pago`.
- En ambos Providers el `value` está memorizado con `useMemo`. Así un render del Provider no re-renderiza a todos los consumidores si el dato no cambió.

### Paso 4 – Optimización: `useMemo`, `useCallback`, `useRef`, `memo`
- `ListaPlatos.jsx`: el filtro por nombre y región está en `useMemo`. `agregar` y `restar` están estabilizados con `useCallback`, y `useRef` enfoca el buscador sin provocar un render.
- `TarjetaPlato.jsx` está envuelto en `React.memo`. Como recibe un callback estable, al escribir en el buscador solo se renderizan las tarjetas que cambian.
- `App.jsx`: `platos` se memoriza para que su referencia no cambie en cada render.
- **Métricas (Profiler):** ver las capturas de antes y después de aplicar `memo`/`useCallback` en la sección de evidencias.

### Paso 5 – Hooks personalizados
| Hook | Uso | Dónde se reutiliza |
|---|---|---|
| `useFetch(url)` | Petición + `cargando` + `error` + cancelación | `App.jsx` (carga de `platos.json`) |
| `useForm(iniciales, validar, formatos)` | Formulario controlado con validación, campos tocados y formato de entrada | `Pago.jsx` |
| `useLocalStorage(clave, inicial)` | `useState` que persiste en `localStorage` | `ThemeContext.jsx` |

Todos se llaman en el nivel superior del componente, nunca dentro de loops, condiciones ni funciones anidadas. Las reglas de Hooks se validan con `eslint-plugin-react-hooks` (`npm run lint`).

## Uso de IA (regla de laboratorio)
Las intervenciones de IA para resolver problemas de render o dependencias están marcadas en el código con el formato `// IA: [problema] → Solución manual: [explicación]`. Los únicos `eslint-disable` del proyecto llevan una justificación técnica en la misma línea.

## Estructura

```
src/
├── App.jsx                  # Navegación entre vistas + carga de datos
├── components/
│   ├── Navegacion.jsx       # Barra de pestañas
│   ├── Cabecera.jsx
│   ├── PlatosProbados.jsx   # Paso 1: useState vs useRef
│   ├── ListaPlatos.jsx      # Paso 4: useMemo, useCallback, useRef
│   ├── TarjetaPlato.jsx     # React.memo
│   ├── Pedido.jsx
│   ├── Pago.jsx             # usa useForm
│   └── Tema.jsx
├── context/
│   ├── ThemeContext.jsx     # Paso 3
│   └── PedidoContext.jsx    # Paso 3 + useReducer
├── hooks/
│   ├── useFetch.js          # Paso 2 y 5
│   ├── useForm.js           # Paso 5
│   └── useLocalStorage.js   # Paso 5
└── utils/
    ├── reglasPedido.js      # Límites y reducer del pedido (funciones puras)
    └── validaciones.js      # Reglas del formulario de pago
tests/
└── reglas.test.js           # 12 pruebas de límites y errores humanos
```

## Ejecutar en local

```bash
npm install
npm run dev      # http://localhost:5173
npm run lint     # reglas de Hooks
npm test         # pruebas de reglas y validaciones (node:test)
npm run build    # build de producción en dist/
```

## Despliegue
Cada `push` a `main` ejecuta `.github/workflows/static.yml`, que instala dependencias, pasa el lint y las pruebas, compila con Vite y publica `dist/` en GitHub Pages.

## Evidencias
<!-- Agrega aquí tus capturas: guárdalas en una carpeta docs/ y enlázalas así: ![Paso 1](docs/paso1.png) -->
- Capturas de VS Code de cada paso: _pendiente_
- Capturas de la SPA funcionando en local: _pendiente_
- Profiler antes/después de `memo`: _pendiente_
