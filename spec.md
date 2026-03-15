# Chess Game

## Current State
Aplicacion de ajedrez completa con modo PvP y PvC, 6 niveles de dificultad, IA con minimax, resaltado de movimientos validos, deteccion de jaque/jaque mate, y retraso de 3 segundos en movimientos de IA.

## Requested Changes (Diff)

### Add
- Panel de administrador de anuncios accesible desde un boton en el header o footer
- Formulario para crear anuncios con: titulo, mensaje, tipo (informacion / alerta / promocion), activo/inactivo
- Lista de anuncios creados con opciones de editar, activar/desactivar y eliminar
- Banner de anuncio visible en la app del juego cuando hay anuncios activos
- Almacenamiento de anuncios en estado local (localStorage para persistencia)

### Modify
- Header o footer para incluir acceso al panel de anuncios

### Remove
- Nada

## Implementation Plan
1. Crear hook `useAnnouncements` que gestione anuncios en localStorage
2. Crear componente `AnnouncementBanner` que muestra anuncios activos en el juego
3. Crear componente `AnnouncementPanel` con formulario CRUD de anuncios
4. Integrar banner y boton de acceso al panel en App.tsx
