# Patrones de Diseño OneDash - Reglas Cline

## 🎨 Variables CSS Obligatorias

Siempre usar las variables CSS definidas en `styles/variables.css`. NUNCA usar valores hardcodeados:

### Colores

```css
/* ✅ CORRECTO */
color: var(--color-text-primary);
background: var(--color-surface);
border-color: var(--color-border);

/* ❌ INCORRECTO */
color: #404042;
background: #ffffff;
border-color: #e5e7eb;
```

### Espaciado

```css
/* ✅ CORRECTO */
padding: var(--spacing-md);
margin: var(--spacing-lg);
gap: var(--spacing-sm);

/* ❌ INCORRECTO */
padding: 12px;
margin: 16px;
gap: 8px;
```

### Radios y Sombras

```css
/* ✅ CORRECTO */
border-radius: var(--radius-md);
box-shadow: var(--shadow-sm);

/* ❌ INCORRECTO */
border-radius: 6px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```

## 🏗️ Arquitectura de Componentes

### Estructura Granular Obligatoria

- Máximo **200 líneas** por componente
- **Una responsabilidad** por archivo
- **Props tipadas** con TypeScript estricto
- **Componentes comunes** reutilizables desde `components/widgets/common/`

### Nomenclatura BEM Estricta

```css
/* Bloque */
.component-name {
  /* Estilos base */
}

/* Elemento */
.component-name__element {
  /* Estilos del elemento */
}

/* Modificador */
.component-name--modifier {
  /* Variación */
}
```

## 🎯 Diseño Minimalista y Moderno

### Principios Visuales

- **Espaciado consistente**: Usar solo variables de spacing definidas
- **Jerarquía visual clara**: font-weight 400 (normal) como estándar, 500 para énfasis
- **Colores sutiles**: Preferir opacidades bajas (0.1, 0.2) sobre colores sólidos
- **Transiciones suaves**: Usar `var(--transition-fast)` (150ms) para interacciones

### Botones y Controles

```css
/* Patrón estándar para botones */
.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0;
  background: var(--color-surface);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--color-text-secondary);
}

.control-btn:hover {
  background: var(--color-surface-secondary);
  color: var(--color-text-primary);
}

.control-btn--active {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}
```

### Iconos

- **Bordes finos**: Preferir iconos outline sobre filled
- **Tamaños consistentes**: 16px (sm), 20px (md), 24px (lg)
- **No emojis**: Usar solo iconos de Lucide React

## 📦 Componentes Comunes Obligatorios

### Usar Siempre Cuando Aplique

```typescript
// Placeholders
import { WidgetPlaceholder } from "../common";

// Configuración
import { ConfigSection, ConfigTabs } from "../common";

// Visualización
import {
  VisualizationPreviewContainer,
  VisualizationControlGroup,
} from "../common";

// Hooks
import { useConditionalFormatting } from "../common";
```

### Patrón Widget Estándar

```typescript
export const MiWidget: React.FC<WidgetProps> = ({ widget }) => {
  // 1. Validación de configuración
  const isConfigured = useMemo(() => {
    // Lógica específica
  }, [dependencies]);

  // 2. Hooks comunes
  const { getConditionalStyle } = useConditionalFormatting(conditionalFormats);

  // 3. Placeholder si no configurado
  if (!isConfigured) {
    return (
      <WidgetPlaceholder
        icon="widget-icon"
        title="Widget sin configurar"
        description="Configura el widget para mostrar datos"
      />
    );
  }

  // 4. Render configurado
  return <div className="mi-widget">{/* contenido */}</div>;
};
```

## 🎨 CSS y Estilos

### Jerarquía de Archivos CSS

1. **Base**: `viz-components.css` (fuente de verdad)
2. **Específicos**: Solo cuando sea absolutamente necesario
3. **Variables**: Siempre desde `variables.css`

### Patrones de Layout

```css
/* Container estándar */
.component-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

/* Preview container */
.preview-container {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-secondary);
  border-radius: var(--radius-md);
}
```

### Estados Interactivos

```css
/* Hover sutil */
.interactive-element:hover {
  background: var(--color-surface-hover);
  transform: translateY(-1px);
  transition: var(--transition-fast);
}

/* Estado activo con color primario */
.element--active {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

/* Estado disabled */
.element--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

## 🌙 Soporte Dark Theme

### Siempre Incluir

```css
/* Light theme por defecto */
.component {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

/* Dark theme automático con variables */
[data-theme="dark"] .component {
  /* Las variables CSS se ajustan automáticamente */
}
```

## 📱 Responsive Design

### Breakpoints Estándar

```css
/* Mobile-first approach */
.component {
  /* Estilos base (mobile) */
}

@media (min-width: 768px) {
  .component {
    /* Tablet adjustments */
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop adjustments */
  }
}
```

## ✅ Checklist Obligatorio

Antes de cualquier implementación verificar:

- [ ] **Variables CSS**: Solo uso de variables definidas, no valores hardcodeados
- [ ] **BEM Notation**: Nomenclatura consistente para clases CSS
- [ ] **Componentes comunes**: Reutilizar de `components/widgets/common/`
- [ ] **TypeScript**: Props tipadas estrictamente
- [ ] **Iconos Lucide**: Solo iconos de la librería, no emojis
- [ ] **Font-weight 400**: Peso estándar para textos
- [ ] **Espaciado consistente**: Solo variables de spacing
- [ ] **Transiciones suaves**: Usar variables de transición
- [ ] **Dark theme**: Automático con variables CSS
- [ ] **Responsive**: Mobile-first approach
- [ ] **Arquitectura granular**: Máximo 200 líneas por componente

## 🚫 Prohibiciones Absolutas

- ❌ **Valores CSS hardcodeados** (excepto 0)
- ❌ **Emojis** en lugar de iconos
- ❌ **Componentes > 200 líneas**
- ❌ **Props sin tipado**
- ❌ **Duplicación de estilos** entre archivos
- ❌ **Colores fuera de variables**
- ❌ **Font-weight diferente de 400, 500, 600**
- ❌ **Clases CSS sin BEM notation**
- ❌ **Componentes sin usar comunes cuando aplique**

Esta guía asegura consistencia, mantenibilidad y adherencia a los patrones de diseño establecidos en OneDash.
