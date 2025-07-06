# OneDash

OneDash es una aplicación web moderna para crear dashboards personalizables y dinámicos con widgets interactivos. Construida con React 19, TypeScript y un enfoque modular que facilita el desarrollo y mantenimiento.

## Arquitectura Técnica

### Stack Principal

- **React 19** - Framework principal con soporte para concurrent features
- **TypeScript 5.8** - Tipado estático completo
- **Vite 7.0** - Build tool y dev server optimizado
- **Zustand 5.0** - State management ligero y performante
- **ECharts 5.6** - Biblioteca de visualización de datos
- **React Grid Layout 1.5** - Sistema de grids drag & drop

### Dependencias Clave

```json
{
  "@dnd-kit/core": "^6.3.1", // Drag & drop framework
  "@floating-ui/react": "^0.27.13", // Positioning tooltips/popovers
  "echarts": "^5.6.0", // Charts library
  "react-grid-layout": "^1.5.2", // Grid layout system
  "react-colorful": "^5.6.1", // Color picker component
  "numeral": "^2.0.6", // Number formatting
  "lucide-react": "^0.525.0" // Icon library
}
```

## Estructura del Proyecto

```
src/
├── components/
│   ├── common/                 # Componentes reutilizables
│   │   ├── Card.tsx
│   │   ├── CustomColorPicker.tsx
│   │   ├── CustomSelect.tsx
│   │   ├── Icon.tsx
│   │   └── ReadonlyConfirmModal.tsx
│   ├── charts/                 # Componentes de gráficos
│   │   ├── BaseChart.tsx
│   │   └── BarChart.tsx
│   ├── dashboard/              # Layout del dashboard
│   │   ├── DashboardGrid.tsx
│   │   └── WidgetContainer.tsx
│   ├── layout/                 # Componentes de layout
│   │   ├── Header.tsx
│   │   ├── DashboardSidebar.tsx
│   │   ├── EditToolbar.tsx
│   │   ├── FloatingActionBar.tsx
│   │   ├── UserAvatar.tsx
│   │   └── WidgetConfigSidebar.tsx
│   └── widgets/                # Sistema de widgets
│       ├── common/             # Componentes compartidos
│       │   ├── ConfigDropdown.tsx
│       │   ├── ConfigInput.tsx
│       │   ├── ConfigSection.tsx
│       │   ├── ConfigTabs.tsx
│       │   ├── EmptyPlaceholder.tsx
│       │   └── MetricSelector/  # Selector de métricas avanzado
│       │       ├── MetricSelector.tsx
│       │       ├── hooks.ts
│       │       ├── types.ts
│       │       ├── components/
│       │       │   ├── CheckboxItem.tsx
│       │       │   ├── MetricFooter.tsx
│       │       │   ├── MetricSidebar.tsx
│       │       │   ├── ModifiersPanel.tsx
│       │       │   ├── SearchBar.tsx
│       │       │   ├── SearchResults.tsx
│       │       │   └── TabsList.tsx
│       │       └── tabs/
│       │           ├── CalculationsTab.tsx
│       │           ├── IndicatorsTab.tsx
│       │           └── TimerangeTab.tsx
│       ├── config/             # Configuración de widgets
│       │   ├── MetricConfig/
│       │   │   ├── MetricConfig.tsx
│       │   │   ├── MetricConfigTabs.tsx
│       │   │   ├── DataConfig.tsx
│       │   │   ├── VisualizationConfig.tsx
│       │   │   └── components/
│       │   │       ├── MetricItem.tsx
│       │   │       └── MetricSelectorSingle.tsx
│       │   └── TableConfig/
│       │       ├── TableConfig.tsx
│       │       ├── TableConfigTabs.tsx
│       │       ├── DataConfig.tsx
│       │       ├── VisualizationConfig.tsx
│       │       ├── BreakdownLevelConfig.tsx
│       │       ├── EventsConfig.tsx
│       │       ├── TableColumnsConfig.tsx
│       │       └── components/
│       │           ├── BreakdownItem.tsx
│       │           ├── ColumnItem.tsx
│       │           ├── ColumnsConfigDropdown.tsx
│       │           └── ConditionalFormatForm.tsx
│       └── render/             # Renderizado de widgets
│           ├── ChartWidget.tsx
│           ├── ErrorWidget.tsx
│           ├── MetricWidget.tsx
│           ├── TableWidget.tsx
│           └── TextWidget.tsx
├── hooks/                      # Custom hooks
│   ├── useECharts.ts          # Hook para ECharts con theming
│   ├── useGridLayout.ts       # Hook para React Grid Layout
│   └── useMetricGeneration.ts # Hook para generación de métricas
├── store/                      # Zustand stores
│   ├── dashboardStore.ts      # Estado de dashboards
│   ├── themeStore.ts          # Gestión de temas
│   └── widgetStore.ts         # Estado de widgets
├── styles/                     # Estilos CSS (metodología BEM)
│   ├── variables.css          # Variables CSS globales
│   ├── globals.css            # Estilos globales
│   ├── grid.css               # Estilos del grid layout
│   ├── header.css             # Estilos del header
│   ├── widgets.css            # Estilos base de widgets
│   ├── metric-widget.css      # Estilos específicos de métricas
│   ├── table-widget.css       # Estilos específicos de tablas
│   └── [otros].css            # Estilos específicos por componente
├── types/                      # Definiciones TypeScript
│   ├── dashboard.ts           # Tipos de dashboard
│   ├── widget.ts              # Tipos de widgets
│   ├── chart.ts               # Tipos de gráficos
│   ├── metricConfig.ts        # Tipos de configuración de métricas
│   └── breakdownLevels.ts     # Tipos de niveles de breakdown
└── utils/                      # Utilidades y helpers
    ├── helpers.ts             # Funciones auxiliares
    ├── format.ts              # Formateo de datos
    ├── generateTableData.ts   # Generación de datos para tablas
    └── chartOptions/          # Configuraciones de gráficos
```

## Sistema de Widgets

### Arquitectura Modular

OneDash implementa un sistema de widgets modular con separación clara de responsabilidades:

#### Tipos de Widget

```typescript
export type WidgetType = "chart" | "metric" | "table" | "text";

export interface BaseWidget {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  isConfigured?: boolean;
}
```

#### Widget de Métricas

```typescript
export interface MetricWidgetConfig {
  primaryMetric?: MetricDefinition;
  secondaryMetric?: MetricDefinition;
  size?: "small" | "medium" | "large";
  visualization?: {
    conditionalFormats?: ConditionalFormatRule[];
  };
}
```

#### Widget de Tablas

```typescript
export interface TableWidgetConfig {
  columns: (MetricDefinition & { visible?: boolean })[];
  data: Record<string, unknown>[];
  pagination?: boolean;
  breakdownLevels?: string[];
  visualization?: {
    showTitle?: boolean;
    compact?: boolean;
    showBorders?: boolean;
    alternateRowColors?: boolean;
    conditionalFormats?: ConditionalFormatRule[];
  };
}
```

### MetricSelector Avanzado

Sistema complejo de selección de métricas con:

- **Tabs organizados**: Indicators, Timerange, Calculations
- **Búsqueda inteligente**: Filtrado en tiempo real
- **Modifiers panel**: Configuración adicional de métricas
- **Hooks personalizados**: Lógica de estado encapsulada

## Gestión de Estado

### Arquitectura Zustand

```typescript
// Dashboard Store
interface DashboardState {
  dashboards: Dashboard[];
  currentDashboard: Dashboard | null;
  originalDashboard: Dashboard | null; // Para modo edición
  tempDashboard: Dashboard | null; // Copia temporal
  settings: DashboardSettings;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  selectedWidgetId: string | null;
  isConfigSidebarOpen: boolean;
}

// Widget Store
interface WidgetState {
  widgets: Widget[];
  selectedWidget: Widget | null;
  isConfiguring: boolean;
}

// Theme Store
interface ThemeState {
  theme: "light" | "dark";
  toggleTheme: () => void;
}
```

### Persistencia

- **localStorage** para dashboards y configuraciones
- **Serialización automática** con Zustand persist middleware
- **Inicialización lazy** con dashboard demo

## Custom Hooks

### useECharts

```typescript
interface UseEChartsOptions {
  option: EChartsOption;
  theme?: "light" | "dark";
  autoResize?: boolean;
  onChartReady?: (chart: ECharts) => void;
}
```

- Manejo automático de temas
- Resize responsivo
- Cleanup automático de instancias
- Integración con theme store

### useGridLayout

- Gestión de layouts drag & drop
- Sincronización con dashboard store
- Validación de constraints

### useMetricGeneration

- Generación automática de métricas
- Cálculos complejos
- Formateo de datos

## Sistema de Estilos

### Metodología BEM

```css
.widget {
}
.widget__header {
}
.widget__content {
}
.widget__footer {
}
.widget--editing {
}
.widget--selected {
}
```

### Variables CSS

```css
:root {
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-info: #17a2b8;

  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 3rem;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### Theming

- Variables CSS dinámicas
- Soporte para tema claro/oscuro
- Transiciones suaves
- Sincronización con ECharts

## Formateo Condicional

### Sistema de Reglas

```typescript
interface ConditionalFormatRule {
  id: string;
  columnId: string;
  columnName: string;
  condition: "greater_than" | "less_than" | "equals" | "contains";
  value: string | number;
  style: {
    backgroundColor: string;
    textColor: string;
    fontWeight?: "bold" | "normal";
    fontStyle?: "italic" | "normal";
  };
  isEnabled: boolean;
}
```

### Aplicación

- Evaluación en tiempo real
- Múltiples reglas por columna
- Prioridad de reglas
- Performance optimizada

## Scripts de Desarrollo

```bash
# Desarrollo
npm run dev          # Vite dev server con HMR

# Build
npm run build        # TypeScript compilation + Vite build

# Linting
npm run lint         # ESLint con reglas React/TypeScript

# Preview
npm run preview      # Preview de build de producción
```

## Configuración ESLint

```javascript
// eslint.config.js
export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    extends: [
      "@eslint/js/recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react-hooks/recommended",
    ],
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
];
```

## Patrones de Diseño

### Composition Pattern

```typescript
// Ejemplo de composición de widgets
const MetricWidget = ({ config }: MetricWidgetProps) => (
  <Card>
    <CardHeader>
      <MetricTitle />
      <MetricActions />
    </CardHeader>
    <CardContent>
      <MetricValue />
      <MetricTrend />
    </CardContent>
  </Card>
);
```

### Provider Pattern

```typescript
// Theme provider con contexto
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme.theme);
  }, [theme.theme]);

  return <>{children}</>;
};
```

### Factory Pattern

```typescript
// Factory para crear widgets
const createWidget = (type: WidgetType, config: WidgetConfig): Widget => {
  switch (type) {
    case "metric":
      return new MetricWidget(config);
    case "table":
      return new TableWidget(config);
    case "chart":
      return new ChartWidget(config);
    default:
      throw new Error(`Unknown widget type: ${type}`);
  }
};
```

## Performance

### Optimizaciones Implementadas

- **React.memo** para componentes puros
- **useMemo/useCallback** para cálculos costosos
- **Lazy loading** de configuraciones
- **Debounced updates** en inputs
- **Virtual scrolling** en tablas grandes
- **Chart instance reuse** en ECharts

### Bundle Optimization

- **Tree shaking** automático con Vite
- **Code splitting** por rutas
- **Dynamic imports** para configuraciones
- **Asset optimization** automática

## Extensibilidad

### Agregar Nuevos Widgets

1. Crear tipo en `types/widget.ts`
2. Implementar componente en `components/widgets/render/`
3. Crear configuración en `components/widgets/config/`
4. Registrar en factory pattern
5. Añadir estilos específicos

### Agregar Nuevos Temas

1. Definir variables CSS en `styles/variables.css`
2. Crear variant en theme store
3. Implementar lógica de switching
4. Actualizar ECharts theme configuration

Este README proporciona una guía técnica completa para desarrolladores que trabajen con OneDash, cubriendo desde la arquitectura general hasta detalles específicos de implementación.
