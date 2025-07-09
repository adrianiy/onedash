# Configuración OAuth para OneDash

Esta guía te ayudará a configurar la autenticación OAuth con Google, GitHub y Microsoft para OneDash.

## Variables de Entorno

Copia el archivo `.env.example` a `.env.local` y completa las siguientes variables:

```bash
# NextAuth
NEXTAUTH_SECRET=tu-secreto-nextauth-muy-seguro
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

GITHUB_ID=tu-github-client-id
GITHUB_SECRET=tu-github-client-secret

AZURE_AD_CLIENT_ID=tu-azure-ad-client-id
AZURE_AD_CLIENT_SECRET=tu-azure-ad-client-secret
AZURE_AD_TENANT_ID=tu-azure-ad-tenant-id  # Opcional
```

## Configuración de Proveedores OAuth

### 1. Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Google+ API
4. Ve a "Credenciales" → "Crear credenciales" → "ID de cliente OAuth 2.0"
5. Configura los orígenes autorizados:
   - **Orígenes JavaScript autorizados**: `http://localhost:3000`
   - **URIs de redirección autorizados**: `http://localhost:3000/api/auth/callback/google`
6. Copia el Client ID y Client Secret a tu archivo `.env.local`

### 2. GitHub OAuth

1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Haz clic en "New OAuth App"
3. Completa la información:
   - **Application name**: OneDash
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copia el Client ID y genera un Client Secret
5. Añade las credenciales a tu archivo `.env.local`

### 3. Microsoft Azure AD

1. Ve a [Azure Portal](https://portal.azure.com/)
2. Busca "Azure Active Directory" → "App registrations"
3. Haz clic en "New registration"
4. Completa la información:
   - **Name**: OneDash
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: `http://localhost:3000/api/auth/callback/azure-ad`
5. Una vez creada la app:
   - Copia el "Application (client) ID"
   - Ve a "Certificates & secrets" → "New client secret"
   - Copia el valor del secret
   - Opcionalmente, copia el "Directory (tenant) ID"
6. Añade las credenciales a tu archivo `.env.local`

## Producción

Para producción, asegúrate de:

1. Actualizar `NEXTAUTH_URL` con tu dominio real
2. Actualizar las URLs de callback en cada proveedor OAuth
3. Usar secretos seguros y únicos
4. Configurar HTTPS

### URLs de Callback para Producción

- **Google**: `https://tu-dominio.com/api/auth/callback/google`
- **GitHub**: `https://tu-dominio.com/api/auth/callback/github`
- **Microsoft**: `https://tu-dominio.com/api/auth/callback/azure-ad`

## Características Implementadas

✅ **Autenticación híbrida**: Los usuarios pueden usar tanto email/contraseña como OAuth
✅ **Vinculación de cuentas**: Si un usuario se registra con email y luego usa OAuth con el mismo email, las cuentas se vinculan automáticamente
✅ **Interfaz consistente**: Botones OAuth tanto en login como en registro
✅ **Compatibilidad con sistema existente**: Los usuarios existentes pueden seguir usando email/contraseña
✅ **Estilos minimalistas**: Diseño coherente con el resto de la aplicación

## Solución de Problemas

### Error: "Configuration missing"

- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de que el archivo `.env.local` esté en la raíz del proyecto

### Error: "Callback URL mismatch"

- Verifica que las URLs de callback en los proveedores OAuth coincidan exactamente con las configuradas

### Error: "Invalid client"

- Verifica que el Client ID y Client Secret sean correctos
- Asegúrate de que la aplicación OAuth esté habilitada en el proveedor

## Seguridad

- **NEXTAUTH_SECRET**: Debe ser una cadena aleatoria y segura
- **Client Secrets**: Nunca los expongas en código cliente
- **HTTPS**: Obligatorio en producción
- **Validación de email**: La aplicación verifica que los emails coincidan para vincular cuentas
