# Variables CSS Obligatorias - OneDash

## 🎨 Sistema de Variables CSS Completo

### Colores Base

```css
/* ✅ OBLIGATORIO - Usar siempre estas variables */
--color-background: #ffffff;
--color-background-editing: #f5f5f5;
--color-surface: #ffffff;
--color-surface-hover: #f8f9fa;
--color-surface-secondary: #f9fafb;
--color-surface-tertiary: #e5e7eb;
--color-border: #e5e7eb;
--color-border-hover: #d1d5db;
--color-border-focus: #3b82f6;
```

### Colores de Texto

```css
/* ✅ OBLIGATORIO - Jerarquía de textos */
--color-text-primary: #404042; /* Textos principales */
--color-text-secondary: #6b7280; /* Textos secundarios */
--color-text-muted: #9ca3af; /* Textos tenues */
--color-text-inverse: #ffffff; /* Textos sobre fondos oscuros */
```

### Colores de Marca

```css
/* ✅ OBLIGATORIO - Sistema de colores primarios */
--color-primary: #3b82f6;
--color-primary-rgb: 59, 130, 246; /* Para usar con rgba() */
--color-primary-hover: #2563eb;
--color-primary-light: #eff6ff;

/* Estados y feedback */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-danger: #ef4444;
--color-info: #3b82f6;
```

### Espaciado Sistemático

```css
/* ✅ OBLIGATORIO - Sistema de espaciado */
--spacing-xs: 0.25rem; /* 4px */
--spacing-sm: 0.5rem; /* 8px */
--spacing-md: 0.75rem; /* 12px */
--spacing-lg: 1rem; /* 16px */
--spacing-xl: 1.5rem; /* 24px */
--spacing-xxl: 2rem; /* 32px */
--spacing-3xl: 3rem; /* 48px */
--spacing-4xl: 4rem; /* 64px */
```

### Border Radius

```css
/* ✅ OBLIGATORIO - Sistema de radios */
--radius-xs: 0.125rem; /* 2px */
--radius-sm: 0.25rem; /* 4px */
--radius-md: 0.375rem; /* 6px */
--radius-lg: 0.5rem; /* 8px */
--radius-xl: 0.75rem; /* 12px */
--radius-2xl: 1rem; /* 16px */
--radius-3xl: 1.5rem; /* 24px */
--radius-full: 9999px; /* Círculo */
```

### Sombras

```css
/* ✅ OBLIGATORIO - Sistema de sombras */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
```

### Transiciones

```css
/* ✅ OBLIGATORIO - Transiciones estándar */
--transition-fast: 150ms ease-in-out; /* Para hover, clicks */
--transition-normal: 250ms ease-in-out; /* Para animaciones normales */
--transition-slow: 350ms ease-in-out; /* Para animaciones complejas */
```

## 🚫 Valores Prohibidos

### ❌ NUNCA usar valores hardcodeados:

```css
/* PROHIBIDO */
color: #404042;
background: #ffffff;
padding: 12px;
margin: 16px;
border-radius: 6px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```

### ✅ SIEMPRE usar variables:

```css
/* CORRECTO */
color: var(--color-text-primary);
background: var(--color-surface);
padding: var(--spacing-md);
margin: var(--spacing-lg);
border-radius: var(--radius-md);
box-shadow: var(--shadow-sm);
```

## 🎨 Patrones de Uso Común

### Botones Estándar

```css
.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  transition: var(--transition-fast);
}

.btn:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-border-hover);
}

.btn--primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.btn--primary:hover {
  background: var(--color-primary-hover);
}
```

### Cards y Contenedores

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
  transition: var(--transition-fast);
}
```

### Estados Activos

```css
.element--active {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.element--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

## 🌙 Dark Theme Automático

Las variables CSS se ajustan automáticamente para dark theme:

```css
/* Light theme (por defecto) */
.component {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

/* Dark theme se aplica automáticamente con [data-theme="dark"] */
```

## ✅ Checklist de Variables CSS

Antes de escribir cualquier CSS, verificar:

- [ ] **Color**: ¿Uso `var(--color-*)`?
- [ ] **Espaciado**: ¿Uso `var(--spacing-*)`?
- [ ] **Border Radius**: ¿Uso `var(--radius-*)`?
- [ ] **Sombras**: ¿Uso `var(--shadow-*)`?
- [ ] **Transiciones**: ¿Uso `var(--transition-*)`?
- [ ] **RGB para transparencias**: ¿Uso `rgba(var(--color-*-rgb), 0.1)`?
- [ ] **Font Weight**: ¿Uso solo 400, 500, 600?
- [ ] **Dark Theme**: ¿Funciona automáticamente?

## 🎯 Patrones Específicos OneDash

### Controles de Visualización

```css
.viz-control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  background: var(--color-surface);
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  transition: var(--transition-fast);
}

.viz-control-btn:hover {
  background: var(--color-surface-secondary);
  color: var(--color-text-primary);
}

.viz-control-btn--active {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}
```

### Preview Containers

```css
.preview-container {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Config Sections

```css
.config-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-surface);
  border-radius: var(--radius-md);
}
```

---

**IMPORTANTE**: Estas variables garantizan consistencia visual, soporte automático de dark theme y mantenibilidad del código. Su uso es OBLIGATORIO en todo el proyecto OneDash.
