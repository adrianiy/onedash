# Estructura CSS de OneDash

## Organización de Estilos

La estructura de archivos CSS en OneDash está organizada siguiendo un enfoque modular que refleja la arquitectura de componentes. Esta organización mejora la mantenibilidad, facilita la localización de estilos específicos y reduce la duplicación.

### Estructura de Directorios

```
/styles
  /base              # Estilos base y variables
    variables.css    # Variables CSS globales
    globals.css      # Estilos globales
    reset.css        # Reseteo de estilos predeterminados
  /components        # Estilos agrupados por componentes
    /layout          # Componentes de layout
    /dashboard       # Componentes relacionados con el dashboard
    /common          # Componentes comunes reutilizables
    /widgets         # Componentes de widgets
      /config        # Configuración de widgets
      /render        # Renderizado de widgets
  /auth              # Estilos relacionados con autenticación
  /utils             # Utilidades y componentes visuales compartidos
  index.css          # Punto de entrada que importa todos los estilos
```

## Convenciones de Nomenclatura

1. **Notación BEM**: Todos los archivos CSS deben seguir la notación BEM para evitar colisiones:

   ```css
   /* Bloque */
   .component-name {
   }

   /* Elemento */
   .component-name__element {
   }

   /* Modificador */
   .component-name--modifier {
   }
   ```

2. **Nombres de archivos**: Los nombres de archivos CSS deben corresponder con el componente que estilizan.
   - Usar kebab-case: `widget-config-sidebar.css` en lugar de `widgetConfigSidebar.css`

## Variables CSS

Siempre usar las variables CSS definidas en `styles/base/variables.css`. NUNCA usar valores hardcodeados:

```css
/* ✅ CORRECTO */
color: var(--color-text-primary);
background: var(--color-surface);
padding: var(--spacing-md);
border-radius: var(--radius-md);

/* ❌ INCORRECTO */
color: #404042;
background: #ffffff;
padding: 12px;
border-radius: 6px;
```

## Agregar Nuevos Estilos

1. Crear el archivo CSS en la ubicación correspondiente según la estructura
2. Agregar la importación en `styles/index.css` en la sección adecuada
3. Mantener la coherencia con el enfoque de nomenclatura BEM

## Estilos Globales y Reset

- `base/reset.css`: Contiene los estilos de reseteo básicos, configuración de scrollbars, etc.
- `base/globals.css`: Contiene estilos globales para la aplicación

## Responsabilidad y Mantenimiento

- Cada archivo CSS debe tener una única responsabilidad
- Evitar la duplicación de estilos entre archivos
- Mantener los archivos CSS pequeños y enfocados en su propósito
- Respetar las variables CSS y las convenciones establecidas

Esta estructura mejora significativamente la mantenibilidad del código CSS y facilita el trabajo colaborativo en el proyecto.
