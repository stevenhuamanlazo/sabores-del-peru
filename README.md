# 🇵🇪 Sabores del Perú

SPA en React + Vite para explorar platos peruanos, armar un pedido y pagarlo. Desarrollada para la **Guía Práctica Semana 07 – React Hooks** del curso *Desarrollo de Aplicaciones Web (IS093A)*, UNCP.

- 🌐 **Demo en vivo (GitHub Pages):** https://stevenhuamanlazo.github.io/sabores-del-peru/
- 📦 **Repositorio:** https://github.com/stevenhuamanlazo/sabores-del-peru
- 👤 **Autor:** Steven Huamanlazo Pariona

## Vistas de la SPA

| Vista | Qué hace |
|---|---|
| 📖 **Carta** | Lista de platos con búsqueda, filtro por región (Costa/Sierra/Selva) y contador de platos probados |
| 🛒 **Mi pedido** | Platos agregados, total, quitar platos o vaciar el pedido |
| 💳 **Pago** | Formulario de entrega (nombre, celular, dirección, método de pago) y confirmación del pedido |
| 🎨 **Tema** | Selección de tema claro u oscuro, compartido por toda la app |

La navegación entre vistas se hace con `useState` en `App.jsx` (sin recargar la página). El pedido y el tema se guardan en `localStorage`, así que no se pierden al recargar.

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
- `context/FavoritosContext.jsx`: el pedido, manejado con **`useReducer`** (acciones `TOGGLE` y `LIMPIAR`), usado en `Navegacion`, `ListaPlatos`, `Pedido` y `Pago`.
- En ambos Providers el `value` está memorizado con `useMemo`. Así un render del Provider no re-renderiza a todos los consumidores si el dato no cambió.

### Paso 4 – Optimización: `useMemo`, `useCallback`, `useRef`, `memo`
- `ListaPlatos.jsx`: el filtro por nombre y región está en `useMemo`. `toggleFav` está estabilizado con `useCallback`, y `useRef` enfoca el buscador sin provocar un render.
- `TarjetaPlato.jsx` está envuelto en `React.memo`. Como recibe un callback estable, al escribir en el buscador solo se renderizan las tarjetas que cambian.
- `App.jsx`: `platos` se memoriza para que su referencia no cambie en cada render.
- **Métricas (Profiler):** ver las capturas de antes y después de aplicar `memo`/`useCallback` en la sección de evidencias.

### Paso 5 – Hooks personalizados
| Hook | Uso | Dónde se reutiliza |
|---|---|---|
| `useFetch(url)` | Petición + `cargando` + `error` + cancelación | `App.jsx` (carga de `platos.json`) |
| `useForm(iniciales)` | Estado de un formulario controlado | `Pago.jsx` |
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
│   └── FavoritosContext.jsx # Paso 3 + useReducer
└── hooks/
    ├── useFetch.js          # Paso 2 y 5
    ├── useForm.js           # Paso 5
    └── useLocalStorage.js   # Paso 5
```

## Ejecutar en local

```bash
npm install
npm run dev      # http://localhost:5173
npm run lint     # reglas de Hooks
npm run build    # build de producción en dist/
```

## Despliegue
Cada `push` a `main` ejecuta `.github/workflows/static.yml`, que instala dependencias, pasa el lint, compila con Vite y publica `dist/` en GitHub Pages.

## Evidencias
<!-- Agrega aquí tus capturas: guárdalas en una carpeta docs/ y enlázalas así: ![Paso 1](docs/paso1.png) -->
- Capturas de VS Code de cada paso: _pendiente_
- Capturas de la SPA funcionando en local: _pendiente_
- Profiler antes/después de `memo`: _pendiente_
