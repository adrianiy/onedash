# OneDash - Dashboard con MongoDB y Vercel

Este proyecto es un dashboard interactivo con persistencia de datos en MongoDB y desplegado en Vercel.

## Estructura del Proyecto

El proyecto está estructurado de la siguiente manera:

- `src/` - Código fuente del frontend
  - `components/` - Componentes React
  - `hooks/` - Custom hooks
  - `styles/` - Estilos CSS
  - `types/` - Definiciones de TypeScript
  - `utils/` - Utilidades
- `lib/` - Código de utilidades para el backend
  - `auth.ts` - Utilidades de autenticación
  - `middleware.ts` - Middleware para las rutas de API
  - `mongodb.ts` - Configuración de conexión a MongoDB
  - `models/` - Modelos de datos para MongoDB
- `pages/` - Páginas de Next.js
  - `api/` - Rutas de API para el backend
- `public/` - Archivos estáticos

## Preparación para el Despliegue

### 1. Configurar MongoDB Atlas

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un nuevo cluster
3. En "Database Access", crea un nuevo usuario con permisos de lectura/escritura
4. En "Network Access", añade tu IP actual o `0.0.0.0/0` para permitir el acceso desde cualquier lugar
5. En "Clusters", haz clic en "Connect" y selecciona "Connect your application"
6. Copia la cadena de conexión que tiene el formato: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority`

### 2. Configurar Variables de Entorno en Vercel

Antes de desplegar en Vercel, necesitarás configurar las siguientes variables de entorno:

- `MONGODB_URI`: La URI de conexión a MongoDB que obtuviste de MongoDB Atlas
- `JWT_SECRET`: Una cadena secreta para firmar los tokens JWT (puede ser cualquier cadena aleatoria)
- `JWT_EXPIRES_IN`: Tiempo de expiración de los tokens JWT (por defecto: "30d")

## Despliegue en Vercel

1. Crea una cuenta en [Vercel](https://vercel.com) si no tienes una
2. Conecta tu repositorio de GitHub, GitLab o Bitbucket a Vercel
3. Importa el proyecto y configura las variables de entorno mencionadas anteriormente
4. Haz clic en "Deploy" para desplegar la aplicación

## Desarrollo Local

Para ejecutar el proyecto localmente:

1. Clona el repositorio
2. Instala las dependencias con `npm install`
3. Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:
   ```
   MONGODB_URI=tu_uri_de_mongodb
   JWT_SECRET=tu_secreto_para_jwt
   JWT_EXPIRES_IN=30d
   ```
4. Ejecuta `npm run dev` para iniciar el servidor de desarrollo

## API Endpoints

El backend proporciona los siguientes endpoints:

### Autenticación

- `POST /api/auth/register` - Registrar un nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener información del usuario actual

### Dashboards

- `GET /api/dashboards` - Obtener todos los dashboards
- `POST /api/dashboards` - Crear un nuevo dashboard
- `GET /api/dashboards/:id` - Obtener un dashboard específico
- `PUT /api/dashboards/:id` - Actualizar un dashboard
- `DELETE /api/dashboards/:id` - Eliminar un dashboard

### Widgets

- `GET /api/widgets` - Obtener todos los widgets
- `POST /api/widgets` - Crear un nuevo widget
- `GET /api/widgets/:id` - Obtener un widget específico
- `PUT /api/widgets/:id` - Actualizar un widget
- `DELETE /api/widgets/:id` - Eliminar un widget

### Variables

- `GET /api/variables` - Obtener todas las variables
- `POST /api/variables` - Crear una nueva variable
- `GET /api/variables/:id` - Obtener una variable específica
- `PUT /api/variables/:id` - Actualizar una variable
- `DELETE /api/variables/:id` - Eliminar una variable

## Tecnologías Utilizadas

- **Frontend**: React, Next.js
- **Backend**: API Routes de Next.js
- **Base de datos**: MongoDB con Mongoose
- **Autenticación**: JWT
- **Despliegue**: Vercel
