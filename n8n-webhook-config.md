# Configuración del Webhook en n8n

## Pasos para configurar el webhook en n8n:

### 1. Crear un nuevo workflow en n8n
- Accede a tu instancia de n8n
- Crea un nuevo workflow llamado "Factura Electrónica"

### 2. Agregar nodo Webhook
- Añade un nodo "Webhook" como trigger
- Configuración del webhook:
  - **HTTP Method**: POST
  - **Path**: factura-electronica
  - **Response Mode**: Immediately
  - **Response Code**: 200
  - **Response Data**: {"status": "success", "message": "Datos recibidos"}

### 3. Copiar la URL del webhook
- Una vez configurado, copia la URL del webhook
- Formato típico: `https://tu-dominio.n8n.cloud/webhook/factura-electronica`
- **IMPORTANTE**: Reemplaza la variable `WEBHOOK_URL` en el archivo HTML con tu URL real

### 4. Estructura de datos que recibirás

```json
{
  "numeroMesa": "5",
  "razonSocial": "Empresa ABC S.A.",
  "nit": "900123456-1",
  "telefono": "3001234567",
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

### 5. Procesamiento posterior (opcional)

Puedes agregar más nodos después del webhook para:

- **Email**: Enviar notificación por correo
- **Google Sheets**: Guardar en una hoja de cálculo
- **Database**: Almacenar en base de datos
- **API**: Enviar a sistema de facturación
- **Slack/Discord**: Notificar al equipo

### 6. Activar el workflow
- No olvides activar el workflow con el botón "Active"
- Prueba enviando datos desde el formulario HTML

## Ejemplo de workflow completo:

1. **Webhook** (recibe datos)
2. **Set** (formatear datos si es necesario)
3. **Google Sheets** (guardar registro)
4. **Email** (enviar confirmación)
5. **HTTP Request** (enviar a API de facturación)

## Notas de seguridad:
- Considera agregar autenticación básica al webhook si es necesario
- Valida los datos en n8n antes de procesarlos
- Implementa manejo de errores en el workflow