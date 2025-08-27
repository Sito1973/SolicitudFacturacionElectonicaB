# Solicitud de Factura Electrónica - Bandidos

Landing page para recolectar datos de facturación electrónica del restaurante Bandidos.

## Características

- Formulario de solicitud de factura electrónica
- Validación de campos en tiempo real
- Integración con webhook de n8n
- Diseño responsive y moderno
- Iconos de Lucide React
- Paleta de colores personalizada

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación Local

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

4. Configurar la URL del webhook en `.env`:
```
VITE_WEBHOOK_URL=https://tu-dominio.n8n.cloud/webhook/factura-electronica
```

5. Colocar el logo `bandidos.png` en la carpeta `public/`

6. Ejecutar en modo desarrollo:
```bash
npm run dev
```

7. Para compilar para producción:
```bash
npm run build
```

## Despliegue en Easypanel

### Opción 1: Usando Docker

1. Construir la imagen:
```bash
docker build -t factura-bandidos .
```

2. Ejecutar el contenedor:
```bash
docker run -p 80:80 factura-bandidos
```

### Opción 2: Despliegue directo en Easypanel

1. Crear una nueva app en Easypanel
2. Seleccionar "Deploy from GitHub" o "Deploy from Docker"
3. Configurar las variables de entorno:
   - `VITE_WEBHOOK_URL`: URL del webhook de n8n

4. El Dockerfile ya está configurado para:
   - Construir la aplicación
   - Servir con nginx
   - Exponer puerto 80

## Estructura del Proyecto

```
├── src/
│   ├── App.jsx          # Componente principal
│   ├── App.css          # Estilos del componente
│   ├── main.jsx         # Punto de entrada
│   └── index.css        # Estilos globales
├── public/
│   └── bandidos.png     # Logo del restaurante
├── Dockerfile           # Configuración Docker
├── nginx.conf          # Configuración nginx
├── vite.config.js      # Configuración Vite
├── package.json        # Dependencias
└── .env.example        # Variables de entorno ejemplo
```

## Campos del Formulario

- **Número de Mesa**: Campo requerido
- **Razón Social**: Campo requerido
- **NIT**: Campo requerido
- **Teléfono**: Campo requerido (10 dígitos)

## Integración con n8n

El formulario envía los datos en formato JSON al webhook configurado:

```json
{
  "numeroMesa": "5",
  "razonSocial": "Empresa ABC S.A.",
  "nit": "900123456-1",
  "telefono": "3001234567",
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

## Paleta de Colores

- Seashell: #eee2df
- Champagne Pink: #eed7c5
- Rosy Brown: #c89f9c
- Burnt Sienna: #c97c5d
- Redwood: #b36a5e