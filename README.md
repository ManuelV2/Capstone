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

5.  **Crear el Bucket de Almacenamiento**:
    *   Ve a la sección **Storage** en el panel de Supabase.
    *   Haz clic en **Create a new bucket**.
    *   Nombra el bucket exactamente `documentos_trabajadores`.
    *   Activa la opción **Public bucket**.
    *   Guarda los cambios.

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

### Opción 3: Despliegue en Vercel (Producción en la nube) ☁️

#### Paso 1: Preparar tu repositorio

1.  **Asegúrate de que tu código esté en GitHub**:
    ```bash
    git add .
    git commit -m "Preparar para despliegue en Vercel"
    git push origin main
    ```

2.  **Verifica que `.env` esté en `.gitignore`** (no subas tus credenciales):
    ```bash
    echo ".env" >> .gitignore
    git add .gitignore
    git commit -m "Agregar .env a .gitignore"
    git push
    ```

#### Paso 2: Configurar proyecto en Vercel

1.  **Crear cuenta en Vercel**:
    *   Ve a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.

2.  **Importar proyecto**:
    *   Haz clic en **Add New...** > **Project**.
    *   Selecciona tu repositorio de GitHub `Capstone`.
    *   Haz clic en **Import**.

3.  **Configurar el proyecto**:
    *   **Framework Preset**: Selecciona **Other** (Vercel detectará Deno automáticamente).
    *   **Build Command**: Deja vacío.
    *   **Output Directory**: Deja vacío.
    *   **Install Command**: Deja vacío.
    *   **Root Directory**: `.` (raíz del proyecto).

#### Paso 3: Configurar Variables de Entorno en Vercel

1.  **Acceder a configuración de entorno**:
    *   **ANTES** de hacer el primer deploy, ve a **Settings** > **Environment Variables**.

2.  **Agregar las variables** (MUY IMPORTANTE - hazlo antes del deploy):
    *   Haz clic en **Add New**.
    *   Añade la primera variable:
        ```
        Name: SUPABASE_URL
        Value: https://zeuuzbdanuthppkyqoxq.supabase.co
        ```
        ✅ Marca los 3 checkboxes: **Production**, **Preview**, **Development**
    *   Haz clic en **Save**.
    
    *   Añade la segunda variable:
        ```
        Name: SUPABASE_ANON_KEY
        Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpldXV6YmRhbnV0aHBwa3lxb3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjMyMTksImV4cCI6MjA3NTkzOTIxOX0.7Ko4XqG6Zk0gjGdGEKyKfLY0bLFGW_7OATdhatklKGc
        ```
        ✅ Marca los 3 checkboxes: **Production**, **Preview**, **Development**
    *   Haz clic en **Save**.

#### Paso 4: Desplegar

1.  **Volver a la pestaña Deployments**:
    *   Si ya hiciste un deploy fallido, haz clic en **Redeploy**.
    *   Si es tu primer deploy, Vercel lo iniciará automáticamente.

2.  **Esperar el despliegue**:
    *   El proceso puede tomar 2-3 minutos.
    *   Verifica que no haya errores en los logs.

3.  **Acceder a tu aplicación**:
    *   Una vez finalizado, Vercel te proporcionará una URL como:
    *   `https://capstone-tu-usuario.vercel.app`

#### Verificar el despliegue

1.  **Revisar logs de build**:
    *   En Vercel, ve a **Deployments** > selecciona tu último despliegue.
    *   Haz clic en **Building** para ver los logs de construcción.
    *   Busca errores relacionados con Deno o variables de entorno.

2.  **Revisar logs de runtime**:
    *   En el mismo deployment, ve a la pestaña **Functions**.
    *   Haz clic en tu función y luego en **View Logs**.
    *   Busca el mensaje: `✅ Connected to Supabase`.

3.  **Probar la API directamente**:
    *   Abre en tu navegador: `https://tu-proyecto.vercel.app/api/workers`
    *   Deberías ver un JSON con los trabajadores de tu base de datos.

4.  **Probar la aplicación completa**:
    *   Abre: `https://tu-proyecto.vercel.app`
    *   Verifica que los trabajadores se carguen correctamente.
    *   Prueba agregar, editar y eliminar trabajadores.

#### Solución de problemas comunes

**Error: "Build failed" o "Missing @vercel/deno"**
- Solución:
  1. Asegúrate de que `vercel.json` esté en la raíz del proyecto.
  2. El contenido debe ser exactamente como se muestra arriba.
  3. Haz commit y push de los cambios:
     ```bash
     git add vercel.json
     git commit -m "Fix vercel.json configuration"
     git push
     ```

**Error: "SUPABASE_URL is not defined" o "Missing Supabase environment variables"**
- Solución:
  1. Ve a **Settings** > **Environment Variables** en Vercel.
  2. Verifica que ambas variables estén presentes y correctamente escritas (sin espacios extra).
  3. **MUY IMPORTANTE**: Asegúrate de haber marcado los 3 checkboxes (Production, Preview, Development) para cada variable.
  4. Si las variables ya existen pero el error persiste:
     - Elimina las variables existentes.
     - Vuelve a crearlas desde cero.
     - Haz **Redeploy**.

**Error: "Cannot find module" o errores de importación**
- Solución:
  1. Verifica que `deno.json` esté en la raíz del proyecto.
  2. Asegúrate de que todas las importaciones en `server.ts` usen las rutas definidas en `deno.json`.
  3. Haz Redeploy.

**Error 404 en las rutas**
- Solución:
  1. Verifica que `vercel.json` tenga las rutas configuradas correctamente.
  2. La estructura de carpetas debe ser:
     ```
     Capstone/
     ├── server.ts (en la raíz)
     ├── vercel.json (en la raíz)
     ├── public/
     │   ├── index.html
     │   └── static/
     │       ├── app.js
     │       └── styles.css
     ```

**Los trabajadores no se cargan en la aplicación**
1. Abre la consola del navegador (F12) y busca errores.
2. Verifica las políticas RLS en Supabase:
   - Ve al SQL Editor en Supabase.
   - Ejecuta: `SELECT * FROM workers;` para confirmar que hay datos.
   - Verifica que las políticas RLS permitan acceso público.
3. Prueba la API directamente: `https://tu-proyecto.vercel.app/api/workers`.

**El deploy fue exitoso pero la página muestra error**
1. Ve a **Deployments** > tu deploy > **Functions** > **View Logs**.
2. Busca errores específicos en los logs de runtime.
3. Verifica que las variables de entorno estén disponibles en runtime:
   - Los logs deberían mostrar: `✅ Connected to Supabase`.
   - Si ves: `❌ Missing Supabase environment variables`, las variables no están configuradas correctamente.

**Para forzar un nuevo despliegue con las variables actualizadas**
```bash
# Haz un cambio pequeño (por ejemplo, agrega un comentario)
# Luego:
git add .
git commit -m "Trigger redeploy"
git push
```

## 📁 Estructura del Proyecto

```
Capstone/
├── server.ts              # Servidor principal con integración Supabase
├── deno.json             # Configuración de Deno y dependencias
├── vercel.json           # Configuración de despliegue para Vercel
├── supabase_setup.sql    # Script SQL para configurar la base de datos
├── .env                  # Variables de entorno (no incluir en git)
├── .gitignore            # Archivos ignorados por git
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