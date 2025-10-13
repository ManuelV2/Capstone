# Sistema de Gestión de Trabajadores - Empresa de Seguridad

Una aplicación web moderna para centralizar y gestionar toda la información de los trabajadores de una empresa de seguridad, construida con Deno, React y Docker.

## 🚀 Características

- **Gestión completa de trabajadores**: Agregar, editar, eliminar y visualizar información de trabajadores
- **Filtros y búsqueda**: Buscar por nombre, cédula o cargo, y filtrar por estado
- **Dashboard con estadísticas**: Vista general con métricas importantes
- **Interfaz responsive**: Diseño adaptable para dispositivos móviles y desktop
- **API RESTful**: Backend robusto con endpoints para todas las operaciones CRUD

## 🛠️ Tecnologías Utilizadas

- **Backend**: Deno + Oak Framework
- **Frontend**: React (vanilla, sin bundler)
- **Estilos**: Bootstrap 5 + CSS personalizado
- **Containerización**: Docker + Docker Compose
- **Base de datos**: En memoria (simulada) - lista para integrar PostgreSQL

## 📋 Funcionalidades

### Gestión de Trabajadores
- Registro de información personal (nombre, cédula, teléfono)
- Asignación de cargos (Supervisor, Guardia, Coordinador, Vigilante)
- Gestión de turnos (Diurno, Nocturno, Mixto)
- Control de estados (Activo, Inactivo, Suspendido)
- Fecha de ingreso automática

### Dashboard
- Contador total de trabajadores
- Trabajadores activos
- Trabajadores suspendidos
- Trabajadores inactivos

### Búsqueda y Filtros
- Búsqueda por nombre, cédula o cargo
- Filtrado por estado del trabajador
- Interfaz intuitiva y responsive

## 🚀 Instalación y Uso

### Opción 1: Con Docker (Recomendado)

1. **Clonar el repositorio**:
   ```bash
   git clone <repository-url>
   cd Capstone
   ```

2. **Ejecutar con Docker Compose**:
   ```bash
   docker-compose up --build
   ```

3. **Acceder a la aplicación**:
   Abrir http://localhost:8000 en tu navegador

### Opción 2: Desarrollo local con Deno

1. **Instalar Deno**:
   ```bash
   curl -fsSL https://deno.land/install.sh | sh
   ```

2. **Ejecutar el servidor de desarrollo**:
   ```bash
   deno task dev
   ```

3. **Acceder a la aplicación**:
   Abrir http://localhost:8000 en tu navegador

## 📁 Estructura del Proyecto

```
Capstone/
├── server.ts              # Servidor principal de Deno
├── deno.json             # Configuración de Deno y dependencias
├── Dockerfile            # Configuración para Docker
├── docker-compose.yml    # Orquestación de servicios
├── public/
│   ├── index.html        # Página principal HTML
│   └── static/
│       ├── app.js        # Aplicación React
│       └── styles.css    # Estilos personalizados
└── README.md             # Documentación
```

## 🔌 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/workers` | Obtener todos los trabajadores |
| GET | `/api/workers/:id` | Obtener un trabajador específico |
| POST | `/api/workers` | Crear un nuevo trabajador |
| PUT | `/api/workers/:id` | Actualizar un trabajador |
| DELETE | `/api/workers/:id` | Eliminar un trabajador |

## 📝 Formato de Datos

```json
{
  "id": 1,
  "nombre": "Juan Pérez",
  "cedula": "12345678",
  "cargo": "Supervisor",
  "turno": "Diurno",
  "estado": "Activo",
  "telefono": "555-0123",
  "fechaIngreso": "2023-01-15"
}
```

## 🔧 Comandos Disponibles

```bash
# Desarrollo
deno task dev

# Construcción
deno task build

# Producción
deno task start

# Docker
docker-compose up --build
docker-compose down
```

## 🚀 Próximas Mejoras

- [ ] Integración con base de datos PostgreSQL
- [ ] Autenticación y autorización
- [ ] Reportes en PDF
- [ ] Sistema de notificaciones
- [ ] Historial de cambios
- [ ] Backup automático de datos
- [ ] API de integración con sistemas externos

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## 👥 Autor

Desarrollado para la gestión eficiente de trabajadores en empresas de seguridad.

---

¿Necesitas ayuda? Abre un issue en el repositorio.