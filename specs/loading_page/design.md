# Design Document

## Overview

La animación de revelado de landing page para Acuatica será implementada usando GSAP 3 con una arquitectura de tres capas: estructura HTML existente de Webflow, estilos CSS inyectados dinámicamente y lógica de animación JavaScript. El diseño seguirá un patrón de timeline secuencial para controlar precisamente cada fase de la animación sin modificar el HTML o CSS existente.

## Architecture

### Estructura de Capas Actual

1. **Capa de Preloader (z-index: 100)**: `loader-wrapper` con contador y barra de progreso
2. **Capa de Imágenes Hero (z-index: 98)**: `loader_imgs` con galería de 7 imágenes
3. **Capa de Contenido Principal (z-index: 2)**: Navegación y contenido de la página

### Flujo de Animación

```
Inicialización → Inyección CSS → Preloader → Transición → Revelado de Contenido
```

## Components and Interfaces

### HTML Structure (Existente - No Modificar)

```html
<div class="loader-wrapper">
  <div class="loader5_component">
    <div class="loader5_ix-trigger"></div>
    <div class="loader5_progress">
      <div class="loader5_progress-bar"></div>
    </div>
    <div class="loader5_progress-content">
      <div class="loader5_text-wrapper">
        <div class="loader5_number">20</div>
        <div class="loader5_text">%</div>
      </div>
    </div>
  </div>
  <div class="loader_imgs">
    <div class="hero-imgs">
      <img class="hero-img z-index-1" src="..." />
      <img class="hero-img z-index-2" src="..." />
      <img class="hero-img z-index-3" src="..." />
      <img class="hero-img z-index-4" src="..." />
      <img class="hero-img z-index-5" src="..." />
      <img class="hero-img z-index-6" src="..." />
      <img class="hero-img z-index-7" src="..." />
    </div>
  </div>
</div>

<main class="main-wrapper"></main><div class="navbar5_component">...</div>
  <div class="header103_content-wrapper">
    <h2>Título Principal</h2>
  </div>
</main>
```

### CSS Architecture (Inyectado Dinámicamente)

- **Critical Styles**: Estilos esenciales inyectados via JavaScript
- **Layout**: Posicionamiento fixed/absolute para capas
- **Animations**: Estados iniciales para GSAP con clip-path
- **Responsive**: Altura mínima 100vh para contenedores

### JavaScript Timeline Structure

```javascript
const masterTimeline = gsap.timeline();

// Fase 1: Preloader (0-4s)
masterTimeline
  .to(counter, { value: 100, duration: 2, onUpdate: updateCounter }, 0)
  .to(progressBar, { width: "30%", duration: 1 }, 0.5)
  .to(progressBar, { width: "100%", duration: 1.5 }, 1.5)
  .to(progressBar, { autoAlpha: 0, duration: 0.3 }, 3.5)

  // Fase 2: Transición (4s)
  .to(preloaderContainer, { yPercent: -100, duration: 1 }, 4)

  // Fase 3: Revelado (4.5-7s)
  .to(
    heroImages,
    {
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      stagger: 0.1,
      duration: 0.8,
    },
    4.5
  )
  .to(heroContainer, { scale: 1.2, duration: 2 }, 4.8)
  .to(navigation, { y: 0, duration: 0.6 }, 5.5)
  .to(titleSpans, { y: 0, opacity: 1, stagger: 0.05 }, 5.7);
```

## Data Models

### Animation Configuration

```javascript
const animationConfig = {
  preloader: {
    counter: { duration: 2, ease: "power2.out" },
    progressBar: {
      phase1: { width: "30%", duration: 1 },
      phase2: { width: "100%", duration: 1.5 },
    },
  },
  reveal: {
    images: { stagger: 0.1, duration: 0.8 },
    zoom: { scale: 1.2, duration: 2 },
    navigation: { y: 0, duration: 0.6 },
    title: { stagger: 0.05, duration: 0.4 },
  },
};
```

### DOM Elements Mapping

```javascript
const preloaderElements = {
  container: ".loader5_component",
  digits: ".loader5_number",
  progressBar: ".loader5_progress-bar",
  progressContainer: ".loader5_progress",
};

const contentElements = {
  heroImages: ".hero-img",
  heroContainer: ".hero-imgs",
  navigation: ".navbar5_component",
  titleContainer: ".header103_content-wrapper h2",
  mainWrapper: ".main-wrapper",
};
```

### Critical CSS Injection

```javascript
const criticalCSS = `
  .loader-wrapper{position:fixed;inset:0;z-index:100;display:block!important}
  .loader_imgs{position:relative;z-index:98;min-height:100vh;overflow:hidden}
  .hero-imgs{position:relative;width:100%;height:100vh}
  .hero-img{position:absolute;inset:0;width:100%;min-height:100vh;object-fit:cover}
`;
```

## Error Handling

### GSAP Loading Verification

- Verificar `typeof gsap !== 'undefined'` antes de ejecutar animaciones
- Fallback para asegurar estado inicial sin GSAP
- Console.error si GSAP no está disponible

### CSS Injection Safety

- Verificar existencia de elementos antes de aplicar estilos
- Try-catch en funciones de inyección CSS
- Prevenir duplicación de estilos con ID único

### DOM Elements Validation

- Verificar existencia de elementos antes de animarlos
- Logs de debugging para elementos encontrados/no encontrados
- Graceful degradation si elementos no existen

## Performance Optimization

### Hardware Acceleration

- `backface-visibility: hidden` en imágenes
- `transform-origin: center center` para escalado
- `will-change` removido después de animaciones

### Memory Management

- Cleanup de referencias DOM después de animación
- Remoción de estilos temporales
- Timeline disposal en onComplete

### Loading Strategy

- Inyección de CSS crítico antes de GSAP
- Estados iniciales aplicados inmediatamente
- Lazy loading de animaciones complejas

## Testing Strategy

### Functional Testing

1. **Preloader Functionality**

   - ✅ Contador anima de 0 a 100
   - ✅ Barra de progreso: 0% → 30% → 100%
   - ✅ Transición suave de salida

2. **Content Reveal**

   - 🔄 Clip-path revela imágenes con stagger
   - 🔄 Zoom dramático del contenedor
   - 🔄 Navegación se desliza desde arriba
   - 🔄 Título anima letra por letra

3. **Integration Testing**
   - ✅ CSS se inyecta correctamente
   - ✅ Estados iniciales se aplican
   - ✅ Timeline se ejecuta sin errores

### Browser Compatibility

- **Soporte Principal**: Chrome 90+, Firefox 88+, Safari 14+
- **Soporte Móvil**: iOS Safari 14+, Chrome Mobile 90+
- **Fallbacks**: CSS básico si clip-path no soportado

### Performance Metrics

- **Tiempo de inicialización**: < 100ms
- **FPS durante animación**: 60fps constante
- **Memoria utilizada**: < 50MB adicional
- **Tiempo total de animación**: ~7 segundos

## Implementation Status

### ✅ Completed Tasks

- [x] DOM element initialization
- [x] Critical CSS injection system
- [x] Counter animation (0-100)
- [x] Progress bar two-phase animation
- [x] Preloader transition (yPercent: -100)
- [x] Initial states configuration
- [x] Master timeline structure

### 🔄 In Progress Tasks

- [ ] Image reveal with clip-path stagger
- [ ] Dramatic zoom effect optimization
- [ ] Navigation slide-in animation
- [ ] Title letter-by-letter reveal

### 📋 Pending Refinements

- [ ] Odometer-style counter with vertical movement
- [ ] Precise timing synchronization
- [ ] Mobile performance optimization
- [ ] Cross-browser clip-path fallbacks

## Debug Tools

### Available Functions

```javascript
// En DevTools Console:
window.debugTimeline(); // Muestra estado del timeline
window.masterTimeline.progress(); // Progreso actual
window.masterTimeline.time(); // Tiempo actual
```

### Console Logging

- Inicialización de elementos DOM
- Estados iniciales configurados
- Timeline creado y ejecutándose
- Animación completa

## Deployment Notes

### Dependencies

- **GSAP 3**: Debe cargarse desde CDN antes del script
- **No jQuery**: Implementación vanilla JavaScript
- **No CSS externo**: Todo inyectado dinámicamente

### File Structure

```
/
├── index.html (existente - no modificar)
├── js/
│   └── index.js (implementación principal)
└── design.md (este documento)
```

### Integration Steps

1. Asegurar GSAP CDN en HTML
2. Incluir js/index.js después de GSAP
3. No modificar HTML/CSS existente
4. Probar en navegadores objetivo
