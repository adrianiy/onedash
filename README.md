# OneDash

OneDash es una aplicación web para crear dashboards personalizables y dinámicos con widgets interactivos.

## Características

- 🎨 **Dashboards Personalizables**: Crea y edita dashboards con facilidad
- 📊 **Widgets Variados**: Gráficos, métricas, tablas y contenido de texto
- 🔧 **Grid Editable**: Arrastra y redimensiona widgets con React Grid Layout
- 📈 **Gráficos con ECharts**: Visualizaciones potentes y responsivas
- 🌓 **Tema Claro/Oscuro**: Cambia entre temas con un clic
- 💾 **Persistencia**: Los datos se guardan automáticamente en localStorage
- 🎯 **TypeScript**: Tipado completo para mejor experiencia de desarrollo

## Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: CSS personalizado con variables CSS
- **Estado**: Zustand para gestión de estado
- **Gráficos**: ECharts
- **Layout**: React Grid Layout
- **Iconos**: Lucide React
- **Build**: Vite

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/adrianiy/onedash.git
cd onedash
```

2. Instala las dependencias:

```bash
npm install
```

3. Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

4. Abre tu navegador en `http://localhost:3000`

## Estructura del Proyecto

```
onedash/
├── src/
│   ├── components/
│   │   ├── common/          # Componentes reutilizables
│   │   ├── dashboard/       # Componentes del dashboard
│   │   └── charts/          # Componentes de gráficos
│   ├── hooks/               # Custom hooks
│   ├── pages/               # Páginas principales
│   ├── store/               # Stores de Zustand
│   ├── styles/              # Estilos CSS
│   ├── types/               # Tipos TypeScript
│   └── utils/               # Utilidades
└── public/                  # Archivos estáticos
```

## Uso

### Crear un Dashboard

1. La aplicación se inicia con un dashboard de ejemplo
2. Usa el botón "Editar" para entrar en modo edición
3. Arrastra y redimensiona widgets según tus necesidades
4. Usa "Agregar Widget" para añadir nuevos elementos

### Tipos de Widgets

- **Gráficos**: Visualiza datos con gráficos de barras, líneas, etc.
- **Métricas**: Muestra valores importantes con tendencias
- **Texto**: Contenido personalizable para información
- **Tablas**: Datos tabulares con columnas configurables

### Personalización

- Cambia entre tema claro y oscuro
- Configura el grid y espaciado
- Personaliza colores y estilos en `src/styles/variables.css`

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build de producción
- `npm run lint` - Ejecuta el linter

## Contribución

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
