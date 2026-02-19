# Glow Theme - Glassmorphism Dark UI Guide

Guía de implementación del tema "Glow" (glassmorfismo oscuro) extraído del sistema de asistencia. Aplicable a cualquier proyecto con **React + Tailwind CSS + Framer Motion**.

---

## 1. Requisitos Previos

### Dependencias
```bash
npm install tailwindcss framer-motion @heroicons/react
```

### Tailwind Config - Paleta de Colores
Definir colores custom en `tailwind.config.js` con escalas completas (50-900):

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          400: '#f87171',
          500: '#f54703',  // Color principal (Crimson Carrot)
          // ... escalas 50-900
        },
        accent: {
          400: '#fb923c',
          500: '#ff7518',  // Color de acento (Pumpkin Spice)
          // ... escalas 50-900
        },
        neutral: {
          500: '#464545',
          600: '#2f2f2f',
          700: '#1b1b1b',
          800: '#141414',
          900: '#0a0a0a',
        },
      },
    },
  },
}
```

### CSS Base - Clases Utilitarias
Agregar en tu CSS global (ej: `index.css`) dentro de `@layer components`:

```css
@layer components {
  /* Efecto de vidrio principal */
  .glass-effect {
    @apply backdrop-blur-lg bg-neutral-700/80 border border-white/10;
  }

  /* Efecto de vidrio más oscuro */
  .glass-dark {
    @apply backdrop-blur-lg bg-neutral-900/90 border border-white/5;
  }
}
```

---

## 2. Ambient Background Glows

Círculos difuminados fijos que crean un brillo ambiental sutil en el fondo de la página.

```tsx
{/* Colocar al inicio del componente principal */}
<div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
  <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary-500/[0.06] rounded-full blur-[120px]" />
  <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-accent-500/[0.04] rounded-full blur-[100px]" />
</div>
```

**Claves:**
- `fixed inset-0` + `pointer-events-none` + `-z-10`: No interfiere con el contenido
- `overflow-hidden`: Evita scroll horizontal por los glows
- Opacidad muy baja: `[0.04]` a `[0.06]` para efecto sutil
- `blur-[100px]` a `blur-[120px]`: Radio de difuminado grande
- Posiciones negativas (`-top-40 -right-40`): El glow se extiende parcialmente fuera del viewport

---

## 3. Header con Ícono

```tsx
<div>
  <h1 className="text-2xl font-bold text-white flex items-center gap-3">
    <div className="p-2 rounded-xl bg-primary-500/15 border border-primary-500/20">
      <MiIcono className="w-6 h-6 text-primary-400" />
    </div>
    Título de la Página
  </h1>
  <p className="text-neutral-500 text-sm mt-1 ml-14">
    Descripción de la página
  </p>
</div>
```

---

## 4. Contenedores Glass

### Panel / Card Básico
```tsx
<div className="glass-effect rounded-2xl">
  <div className="p-6">
    {/* Contenido */}
  </div>
</div>
```

### Panel con Header Separado
```tsx
<div className="glass-effect rounded-2xl overflow-hidden">
  <div className="px-6 py-4 border-b border-neutral-700/50 bg-neutral-800/40">
    <h2 className="text-lg font-semibold text-white">Título</h2>
  </div>
  <div className="p-6">
    {/* Contenido */}
  </div>
</div>
```

---

## 5. Stat Cards (Tarjetas de Estadísticas)

Tarjetas con fondo y borde coloreado semi-transparente:

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  {[
    { label: 'Empleados', value: 42,  icon: UserGroupIcon,   color: 'text-blue-400',   bgColor: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Presentes', value: 38,  icon: CheckCircleIcon, color: 'text-green-400',  bgColor: 'bg-green-500/10 border-green-500/20' },
    { label: 'Ausentes',  value: 4,   icon: XCircleIcon,     color: 'text-red-400',    bgColor: 'bg-red-500/10 border-red-500/20' },
    { label: 'Puntualidad', value: '90%', icon: ClockIcon,   color: 'text-accent-400', bgColor: 'bg-accent-500/10 border-accent-500/20' },
  ].map((stat, i) => (
    <motion.div
      key={stat.label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1, duration: 0.4 }}
      className={`glass-effect rounded-2xl p-4 border ${stat.bgColor}`}
    >
      <div className="flex items-center gap-3">
        <stat.icon className={`w-7 h-7 ${stat.color}`} />
        <div>
          <div className={`text-2xl font-bold tabular-nums ${stat.color}`}>
            {stat.value}
          </div>
          <div className="text-[11px] text-neutral-500 uppercase tracking-wider">
            {stat.label}
          </div>
        </div>
      </div>
    </motion.div>
  ))}
</div>
```

### Sistema de Opacidad para Colores
| Uso              | Opacidad BG | Opacidad Border | Opacidad Text |
|------------------|-------------|-----------------|---------------|
| Fondo card       | `/10`       | `/20`           | -             |
| Badge/etiqueta   | `/20`       | -               | Color 400     |
| Celda tabla      | `/10`       | `/20`           | Color 400     |
| Hover sutil      | `/[0.02]`   | -               | -             |
| Background glow  | `/[0.04]`-`/[0.06]` | -        | -             |
| Highlight hoy    | `/[0.03]`-`/5` | -             | -             |

**Patrón:** `bg-{color}-500/10` para fondo + `border-{color}-500/20` para borde + `text-{color}-400` para texto.

---

## 6. Tablas

### Contenedor
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="glass-effect rounded-2xl overflow-hidden"
>
  <div className="overflow-x-auto">
    <table className="w-full min-w-[800px]">
      {/* ... */}
    </table>
  </div>
</motion.div>
```

### Header de Tabla
```tsx
<thead>
  <tr className="bg-neutral-800/60 backdrop-blur-sm">
    <th className="px-6 py-4 text-left text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-700/50">
      Columna
    </th>
  </tr>
</thead>
```

### Filas con Animación
```tsx
<motion.tr
  key={item.id}
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: index * 0.04, duration: 0.3 }}
  className="hover:bg-white/[0.02] transition-colors border-b border-neutral-800/30"
>
  <td className="px-6 py-3 text-sm text-white">
    {item.nombre}
  </td>
</motion.tr>
```

### Celdas con Border-Left Coloreado

> **IMPORTANTE:** Tailwind tiene un problema de cascada CSS donde `border-{color}/20` puede sobreescribir `border-l-{color}`. La solución es usar inline `style` para el color del borde izquierdo.

```tsx
// Definir estilos por estado
const ESTADO_STYLES = {
  ACTIVO: {
    cellClasses: 'bg-green-500/10 text-green-400 border-green-500/20',
    borderHex: '#22c55e',       // ← Hex para inline style
    badgeClasses: 'bg-green-500/20 text-green-400',
  },
  INACTIVO: {
    cellClasses: 'bg-red-500/10 text-red-400 border-red-500/20',
    borderHex: '#ef4444',
    badgeClasses: 'bg-red-500/20 text-red-400',
  },
}

// En el render de la celda:
<td className="px-1 py-1">
  <div
    className={`rounded-xl border-l-4 border p-2 backdrop-blur-sm ${style.cellClasses}`}
    style={{ borderLeftColor: style.borderHex }}
  >
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${style.badgeClasses}`}>
      {style.label}
    </span>
  </div>
</td>
```

---

## 7. Inputs y Selects

```tsx
{/* Select */}
<select
  className="w-full rounded-xl bg-neutral-800/60 border border-neutral-600/50 backdrop-blur-sm text-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
>
  <option className="bg-neutral-800 text-white">Opción</option>
</select>

{/* Input */}
<input
  type="text"
  className="w-full rounded-xl bg-neutral-800/60 border border-neutral-600/50 backdrop-blur-sm text-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder-neutral-500"
/>

{/* Label */}
<label className="block text-sm font-medium text-neutral-400 mb-1.5">
  Campo
</label>
```

---

## 8. Badges / Etiquetas de Estado

```tsx
{/* Badge básico */}
<span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-500/20 text-green-400">
  Activo
</span>

{/* Badge con punto indicador */}
<span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-green-500/20 text-green-400">
  <div className="w-2 h-2 rounded-full bg-green-500" />
  Presente
</span>

{/* Badge con retardo */}
<span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-1 py-0.5 rounded font-bold">
  +15min
</span>
```

---

## 9. Botones

### Botón con Ícono (Navegación)
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={handleClick}
  className="p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-600/50 text-neutral-300 hover:text-white hover:border-neutral-500 transition-all"
>
  <ChevronLeftIcon className="w-5 h-5" />
</motion.button>
```

### Display de Valor (Read-Only)
```tsx
<div className="flex-1 text-center glass-dark rounded-xl py-2.5 px-4">
  <span className="text-white font-semibold tracking-wide">
    Valor mostrado
  </span>
</div>
```

---

## 10. Loading Skeletons

```tsx
{/* Skeleton de fila de tabla */}
<tr className="border-b border-neutral-800/30">
  <td className="px-3 py-3">
    <div className="space-y-2">
      <div className="h-4 w-28 bg-neutral-700/50 rounded-md animate-pulse" />
      <div className="h-3 w-16 bg-neutral-700/30 rounded-md animate-pulse" />
    </div>
  </td>
  <td className="px-1 py-1">
    <div className="h-[70px] rounded-xl bg-neutral-800/30 border border-neutral-700/20 animate-pulse" />
  </td>
</tr>
```

---

## 11. Empty State (Estado Vacío)

```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="glass-effect rounded-2xl"
>
  <div className="text-center py-16 px-8">
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <MiIcono className="w-16 h-16 text-neutral-600 mx-auto mb-6" />
    </motion.div>
    <h3 className="text-xl font-semibold text-neutral-300 mb-2">
      Sin Datos
    </h3>
    <p className="text-neutral-500 mb-4 max-w-md mx-auto">
      Mensaje explicativo de qué hacer.
    </p>
  </div>
</motion.div>
```

---

## 12. Progress Bars (Barras de Progreso)

```tsx
{/* Barra fina con color condicional */}
<div className="mt-1 h-1 rounded-full bg-neutral-800 overflow-hidden mx-1">
  <div
    className={`h-full rounded-full transition-all duration-500 ${
      porcentaje >= 80 ? 'bg-green-500/70' :
      porcentaje >= 50 ? 'bg-yellow-500/70' :
      'bg-red-500/70'
    }`}
    style={{ width: `${porcentaje}%` }}
  />
</div>
```

---

## 13. Animaciones con Framer Motion

### Aparición Escalonada (Staggered Entry)
```tsx
// Para listas de cards
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.1, duration: 0.4 }}

// Para filas de tabla
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: index * 0.04, duration: 0.3 }}
```

### Fade In Simple
```tsx
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.3, duration: 0.4 }}
```

### Floating Animation (para empty states)
```tsx
animate={{ y: [0, -8, 0] }}
transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
```

---

## 14. Resumen de Clases Clave

| Elemento              | Clases                                                             |
|-----------------------|--------------------------------------------------------------------|
| Contenedor principal  | `glass-effect rounded-2xl`                                         |
| Contenedor oscuro     | `glass-dark rounded-xl`                                           |
| Header tabla          | `bg-neutral-800/60 backdrop-blur-sm`                               |
| Celda header          | `py-4 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-700/50` |
| Fila tabla            | `hover:bg-white/[0.02] transition-colors border-b border-neutral-800/30` |
| Stat card azul        | `glass-effect rounded-2xl p-4 border bg-blue-500/10 border-blue-500/20` |
| Stat card verde       | `glass-effect rounded-2xl p-4 border bg-green-500/10 border-green-500/20` |
| Stat card rojo        | `glass-effect rounded-2xl p-4 border bg-red-500/10 border-red-500/20` |
| Stat card accent      | `glass-effect rounded-2xl p-4 border bg-accent-500/10 border-accent-500/20` |
| Input/Select          | `rounded-xl bg-neutral-800/60 border border-neutral-600/50 backdrop-blur-sm text-white` |
| Focus ring            | `focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20`  |
| Label                 | `text-sm font-medium text-neutral-400 mb-1.5`                     |
| Botón navegación      | `p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-600/50 text-neutral-300 hover:text-white hover:border-neutral-500` |

---

## 15. Checklist de Implementación

1. [ ] Configurar `tailwind.config.js` con paleta de colores (primary, accent, neutral)
2. [ ] Agregar clases `.glass-effect` y `.glass-dark` en CSS global
3. [ ] Agregar ambient glows al layout principal
4. [ ] Reemplazar `card` / `card-body` por `glass-effect rounded-2xl p-6`
5. [ ] Convertir headers de tabla a `bg-neutral-800/60 backdrop-blur-sm`
6. [ ] Convertir filas a `hover:bg-white/[0.02]` con `motion.tr` animados
7. [ ] Convertir stat cards al patrón `bg-{color}-500/10 border-{color}-500/20`
8. [ ] Convertir inputs/selects al estilo glassmorphism
9. [ ] Agregar Framer Motion para animaciones de entrada
10. [ ] Usar `style={{ borderLeftColor: hex }}` para bordes laterales coloreados
