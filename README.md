# Sistema de Gestión de Trabajadores - Empresa de Seguridad

Una aplicación web moderna para centralizar y gestionar toda la información de los trabajadores de una empresa de seguridad, construida con Deno, React, Supabase y Docker.

## 🚀 Características

- **Gestión completa de trabajadores**: Agregar, editar, eliminar y visualizar información de trabajadores
- **Filtros y búsqueda**: Buscar por nombre, cédula o cargo, y filtrar por estado
- **Dashboard con estadísticas**: Vista general con métricas importantes
- **Interfaz responsive**: Diseño adaptable para dispositivos móviles y desktop
- **API RESTful**: Backend robusto con endpoints para todas las operaciones CRUD
- **Base de datos real**: Integración con Supabase para persistencia de datos.

## 🛠️ Tecnologías Utilizadas

- **Backend**: Deno + Oak Framework
- **Frontend**: React (vanilla, sin bundler)
- **Base de datos**: Supabase (PostgreSQL)
- **Estilos**: Bootstrap 5 + CSS personalizado
- **Containerización**: Docker + Docker Compose

## 📋 Configuración Inicial

### 1. Configurar Supabase

1.  **Crear cuenta en Supabase**: Ve a [supabase.com](https://supabase.com) y crea una cuenta.
2.  **Crear nuevo proyecto**: Crea un nuevo proyecto en Supabase.
3.  **Obtener credenciales**:
    *   Ve a **Project Settings** (icono de engranaje) > **API**.
    *   Copia la **Project URL** y la **anon public key**.
4.  **Ejecutar el script SQL**:
    *   Ve al **SQL Editor** en tu proyecto Supabase.
    *   Copia y ejecuta el contenido del archivo `supabase_setup.sql` para crear la tabla y las políticas de seguridad.

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con tus credenciales de Supabase:

```env
SUPABASE_URL=https://tu-project-url.supabase.co
SUPABASE_ANON_KEY=tu-anon-public-key
```

## 🚀 Instalación y Uso

### Opción 1: Con Docker (Recomendado)

1.  **Clonar el repositorio**:
    ```bash
    git clone <repository-url>
    cd Capstone
    ```
2.  **Configurar el archivo `.env`** con tus credenciales de Supabase.

3.  **Ejecutar con Docker Compose**:
    ```bash
    docker-compose up --build
    ```

4.  **Acceder a la aplicación**:
    Abrir http://localhost:8000 en tu navegador.

### Opción 2: Desarrollo local con Deno

1.  **Instalar Deno**:
    ```bash
    curl -fsSL https://deno.land/install.sh | sh
    ```
2.  **Configurar el archivo `.env`** con tus credenciales de Supabase.

3.  **Ejecutar el servidor de desarrollo**:
    ```bash
    deno task dev
    ```

4.  **Acceder a la aplicación**:
    Abrir http://localhost:8000 en tu navegador.

## 📁 Estructura del Proyecto

```
Capstone/
├── server.ts              # Servidor principal con integración Supabase
├── deno.json             # Configuración de Deno y dependencias
├── supabase_setup.sql    # Script SQL para configurar la base de datos
├── .env                  # Variables de entorno (no incluir en git)
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

| Método | Endpoint         | Descripción                    |
|--------|------------------|--------------------------------|
| GET    | `/api/workers`     | Obtener todos los trabajadores |
| GET    | `/api/workers/:id` | Obtener un trabajador específico |
| POST   | `/api/workers`     | Crear un nuevo trabajador      |
| PUT    | `/api/workers/:id` | Actualizar un trabajador       |
| DELETE | `/api/workers/:id` | Eliminar un trabajador         |

## 📝 Formato de Datos

```json
{
  "id": 1,
  "nombre": "Juan Pérez",
  "cedula": "12345678",
  "cargo": "Supervisor",
  "turno": "Diurno",
  "estado": "Activo",
  "telefono": "555-0123"
}
```

## 🔧 Comandos Disponibles

```bash
# Desarrollo (con recarga automática)
deno task dev

# Iniciar en producción
deno task start

# Docker: construir y ejecutar
docker-compose up --build

# Docker: detener
docker-compose down
```

## 🚀 Próximas Mejoras

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