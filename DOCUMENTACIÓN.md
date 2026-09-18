# Documentación del Juego Salchicha Garden

Esta documentación explica la estructura del proyecto y la lógica principal del juego: menú, tablero, modo solitario, modo 1 vs 1, obstáculos, sonido, tema, responsive y servidor.

## Índice

1. [Estructura del proyecto](#estructura-del-proyecto)
2. [Servidor](#servidor)
3. [HTML: estructura de pantallas](#html-estructura-de-pantallas)
4. [CSS: diseño e interfaz](#css-diseño-e-interfaz)
5. [game.js: lógica principal](#gamejs-lógica-principal)
6. [Modo solitario](#modo-solitario)
7. [Obstáculos con ladrillos](#obstáculos-con-ladrillos)
8. [Modo 1 vs 1](#modo-1-vs-1)
9. [Audio](#audio)
10. [Tema claro/oscuro](#tema-clarooscuro)
11. [Datos guardados](#datos-guardados)

---

## Estructura del proyecto

```text
snake/
├── server.js
├── package.json
├── DOCUMENTACIÓN.md
├── public/
│   ├── index.html
│   ├── style.css
│   ├── game.js
│   ├── game-versus-1v1.js
│   └── context/
│       └── ThemeContext.js
├── img/
│   ├── hueso.png
│   ├── ladrillo.png
│   └── salchicha .../
└── audios/
    ├── masticar.m4a
    ├── golpe.mp3
    ├── comer.mp3
    └── musica de fondo...
```

El frontend vive en `public/`. Las imágenes y audios están fuera de `public/`, pero `server.js` los expone como rutas estáticas `/img` y `/audios`.

---

## Servidor

Archivo: `server.js`

Usa Express para levantar el juego localmente.

Flujo:

1. Importa `express`, `path` y `os`.
2. Define el puerto con `process.env.PORT || 3000`.
3. Busca la IP local para mostrar una URL útil en celular.
4. Expone:
   - `/img` → carpeta `img/`
   - `/audios` → carpeta `audios/`
   - `/` → carpeta `public/`
5. Usa una ruta comodín para devolver `public/index.html`.
6. Escucha en `0.0.0.0`, así el juego puede abrirse desde otros dispositivos de la misma red.

Comando:

```bash
npm start
```

URL local:

```text
http://localhost:3000
```

---

## HTML: estructura de pantallas

Archivo: `public/index.html`

Define todo el DOM del juego. No contiene lógica compleja; la lógica está en JavaScript.

### Capas globales

- `.app-bg-layer`: decoración visual del fondo.
- `.app-top-toolbar`: botones de configuración y tema.
- `.app-container`: contenedor principal.

### Pantalla de inicio

Sección:

```html
<section id="menu-screen" class="screen active">
```

Contiene:

- Selector de skin para solitario.
- Selector de skins para 1 vs 1.
- Mejores puntajes.
- Dificultad.
- Tamaño del tablero.
- Activación/desactivación de ladrillos.
- Selector de modo: `solo` o `versus`.
- Botón `#start-btn`.
- Botón flotante `#scroll-top-btn`, que aparece solo al hacer scroll en inicio.

### Pantalla de juego

Sección:

```html
<section id="game-screen" class="screen">
```

Contiene tres zonas principales:

- Panel izquierdo:
  - descripción del modo,
  - controles de teclado,
  - compañero activo o skins activas del 1 vs 1.
- Panel central:
  - `canvas#game-canvas`, donde se dibuja el tablero,
  - overlay de pausa,
  - controles táctiles,
  - botones de pausa, audio, tema y menú.
- Panel derecho:
  - estadísticas: puntaje, nivel/modo, récord y dificultad.

### Modales

Incluye:

- `#gameover-overlay`: fin del juego.
- `#countdown-overlay`: cuenta regresiva del modo solitario.
- `#settings-modal`: configuración de volumen.
- `#app-modal`: modal genérico para confirmaciones.

---

## CSS: diseño e interfaz

Archivo: `public/style.css`

El CSS controla la experiencia visual completa.

### Variables

En `:root` se definen:

- colores principales,
- fondos glass,
- sombras,
- transiciones,
- tipografías.

En `body.dark-mode` se sobrescriben variables para modo oscuro.

### Pantallas

La clase `.screen` oculta pantallas por defecto. La clase `.active` muestra la pantalla actual.

```css
.screen {
  display: none;
}

.screen.active {
  display: flex;
}
```

El cambio de pantalla lo maneja `showScreen()` en `game.js`.

### Tablero

`.canvas-container` envuelve el canvas y agrega:

- borde,
- fondo,
- partículas suaves,
- overlay de pausa,
- responsive cuadrado con `aspect-ratio: 1 / 1`.

El juego real no se dibuja con HTML, sino con Canvas 2D desde JavaScript.

### Responsive

Hay media queries para:

- móvil,
- tablet,
- landscape,
- pantallas táctiles,
- escritorio.

En móvil se priorizan:

- tablero grande,
- controles táctiles,
- botones compactos,
- HUD superior.

---

## game.js: lógica principal

Archivo: `public/game.js`

Este archivo contiene:

- configuración global del tablero,
- carga de imágenes,
- audio,
- estado del modo solitario,
- controles,
- canvas,
- obstáculos,
- menú,
- pausa,
- game over,
- estadísticas.

### Configuración base

Variables principales:

```js
let GRID_SIZE = 15;
const CANVAS_SIZE = 1000;
let TILE_SIZE = CANVAS_SIZE / GRID_SIZE;
```

`GRID_SIZE` es la cantidad de celdas por lado. Si el tablero es 15, hay 15 x 15 celdas.

`CANVAS_SIZE` siempre es 1000 px internos. El tamaño visual puede cambiar por CSS, pero la lógica se mantiene estable.

`TILE_SIZE` indica cuánto mide cada celda dentro del canvas.

### Estado del juego

Objeto principal:

```js
let gameState = {
  activeSkin,
  difficulty,
  boardSize,
  gameMode,
  obstaclesEnabled,
  highScore,
  snake,
  direction,
  nextDirection,
  score,
  level,
  speed,
  isPlaying,
  isPaused,
  isGameOver,
  bone,
  bricks,
  gardenDecorations,
  lastTickTime,
  previousSnake
};
```

Este objeto guarda todo lo necesario para una partida solitaria.

### Carga de sprites

Clase:

```js
class AssetLoader
```

Responsabilidades:

- cargar imágenes de la skin activa,
- cargar hueso y ladrillo,
- manejar fallback si una imagen falla,
- mejorar calidad de sprites pequeños con escalado previo.

Cada skin tiene:

- cabeza arriba,
- cabeza abajo,
- cabeza izquierda,
- cabeza derecha,
- cuerpo,
- cola.

### Canvas HiDPI

Funciones:

- `setupHiDpiCanvas(canvasEl)`
- `getRenderDpr()`
- `applyCanvasRenderQuality(context)`

Sirven para que el canvas se vea más nítido en pantallas con alto `devicePixelRatio`.

### Dibujo

Funciones principales:

- `drawGardenBackground(ctx)`: dibuja fondo del tablero y grilla.
- `drawGardenFlowers()`: dibuja decoraciones suaves.
- `drawBoneSprite()`: dibuja el hueso.
- `drawSnakeFromLoader()`: dibuja cabeza, cuerpo y cola.
- `draw()`: orden general de renderizado.

Orden de dibujo:

1. Fondo.
2. Flores/decoraciones.
3. Ladrillos.
4. Hueso.
5. Serpiente.

---

## Modo solitario

El modo solitario usa `gameState`.

### Inicio

Función:

```js
startGame()
```

Flujo:

1. Oculta game over.
2. Lee opciones del menú con `syncMenuSettingsFromDOM()`.
3. Si el modo es `versus`, delega en `Versus1v1.start()`.
4. Carga assets de la skin activa.
5. Inicializa la serpiente en el centro.
6. Reinicia puntaje, nivel, ladrillos y tiempo.
7. Define velocidad según dificultad.
8. Genera decoraciones.
9. Si los obstáculos están activos, agrega un ladrillo inicial.
10. Genera el primer hueso.
11. Muestra la pantalla de juego.
12. Arranca `requestAnimationFrame(gameLoop)`.

### Game loop

Función:

```js
gameLoop(time)
```

El navegador llama a esta función mediante `requestAnimationFrame`.

Flujo:

1. Si no se está jugando, está pausado o terminó, sale.
2. Calcula cuánto tiempo pasó desde el último movimiento.
3. Si pasó más que `gameState.speed`, ejecuta `tick()`.
4. Dibuja el tablero con `draw()`.
5. Actualiza estadísticas.
6. Pide el siguiente frame.

### Tick

Función:

```js
tick()
```

Es el movimiento real de la serpiente.

Orden lógico:

1. Guarda la serpiente anterior en `previousSnake`.
2. Aplica `nextDirection` como dirección actual.
3. Calcula la próxima posición de la cabeza.
4. Verifica pared.
5. Verifica ladrillo.
6. Verifica choque contra el cuerpo.
7. Si no hay choque, mueve la cabeza.
8. Si comió hueso:
   - suma puntaje,
   - reproduce sonido,
   - revisa récord,
   - actualiza nivel/velocidad,
   - agrega ladrillo si corresponde,
   - genera nuevo hueso.
9. Si no comió, elimina la cola.

La colisión se evalúa antes de mover y antes de dibujar para evitar que la serpiente se superponga visualmente con paredes o ladrillos.

---

## Obstáculos con ladrillos

Los ladrillos se guardan en:

```js
gameState.bricks = [];
```

Cada ladrillo es:

```js
{ x: number, y: number }
```

### Sistema de ocupación

Funciones:

```js
getCellKey(x, y)
isInsideGrid(x, y)
buildOccupiedCells(...)
findRandomFreeCell(...)
```

`getCellKey()` convierte una coordenada a string:

```text
"x,y"
```

Ejemplo:

```text
4,7
```

Esto permite usar un `Set` para consultar ocupación de forma clara.

### Spawn del hueso

Función:

```js
spawnBone()
```

Flujo:

1. Construye un `Set` con celdas ocupadas por:
   - serpiente,
   - ladrillos.
2. Busca una celda libre aleatoria.
3. Si no encuentra rápido, recorre el tablero completo como fallback.
4. Coloca el hueso solo si hay una celda libre.

Así se evita que el hueso aparezca dentro de un ladrillo o sobre la serpiente.

### Spawn de ladrillos

Funciones:

```js
canPlaceBrick(x, y, minDistFromHead)
addRandomBrick(minDistFromHead)
```

Un ladrillo solo se coloca si:

- está dentro del tablero,
- no está sobre la serpiente,
- no está sobre el hueso,
- no está sobre otro ladrillo,
- está a una distancia mínima de la cabeza.

`addRandomBrick()` intenta posiciones aleatorias y, si no encuentra, recorre el tablero completo.

### Colisión con ladrillos

Función:

```js
isBrickAt(x, y)
```

En `tick()` se usa así:

```js
if (gameState.obstaclesEnabled && isBrickAt(head.x, head.y)) {
  handleGameOver("ladrillo");
  return;
}
```

Esto ocurre antes de mover la serpiente.

---

## Modo 1 vs 1

Archivo: `public/game-versus-1v1.js`

El modo versus está encapsulado en:

```js
const Versus1v1 = { ... }
```

### Estado

Guarda:

- `playing`
- `paused`
- `gameOver`
- `speed`
- `bone`
- skins de ambos jugadores
- imágenes de ambos jugadores
- `player1`
- `player2`

Cada jugador tiene:

```js
{
  snake,
  previousSnake,
  direction,
  nextDirection,
  skin,
  score,
  alive
}
```

### Selección de skins

`VERSUS_SKINS` lista las skins disponibles.

Funciones:

- `buildSkinSliders()`
- `bindSkinSliders()`
- `setSliderIndex()`
- `refreshSliderLayout()`

Estas funciones construyen y actualizan los sliders del menú para J1 y J2.

### Inicio

Función:

```js
Versus1v1.start()
```

Flujo:

1. Detiene una partida anterior.
2. Lee opciones del menú.
3. Configura tamaño del tablero.
4. Toma las skins elegidas.
5. Posiciona ambos jugadores.
6. Cambia a pantalla de juego.
7. Carga imágenes de ambos.
8. Genera el hueso.
9. Actualiza HUD.
10. Arranca el loop.

En el estado actual no usa cuenta regresiva interna en 1 vs 1.

### Tick versus

Función:

```js
Versus1v1.tick()
```

Flujo:

1. Guarda serpientes anteriores para interpolación visual.
2. Aplica direcciones.
3. Calcula próxima cabeza de J1 y J2.
4. Detecta choque cabeza contra cabeza.
5. Detecta choques contra:
   - paredes,
   - cuerpo propio,
   - cuerpo del otro jugador.
6. Si alguien pierde, llama `endGame(winner)`.
7. Si ambos siguen vivos, mueve ambas serpientes.
8. Evalúa si alguno comió el hueso.
9. Actualiza puntajes y HUD.

### Controles

- Jugador 1: `WASD`.
- Jugador 2: flechas.
- En móvil: joysticks táctiles.

---

## Audio

Clase:

```js
class AudioController
```

Responsabilidades:

- manejar volumen de música,
- manejar volumen de efectos,
- reproducir click,
- reproducir comer,
- reproducir subir de nivel,
- reproducir game over,
- guardar preferencias en `localStorage`.

Sonidos principales:

- Comer hueso: `/audios/masticar.m4a`
- Golpe/game over: `/audios/golpe.mp3`
- Música: intenta archivos de fondo y, si falla, genera ambiente con Web Audio.

Métodos importantes:

- `startMusic()`
- `stopMusic()`
- `playClick()`
- `playEat()`
- `playLevelUp()`
- `playGameOver()`

---

## Tema claro/oscuro

Archivo: `public/context/ThemeContext.js`

Clase:

```js
class ThemeContext
```

Flujo:

1. Lee `salchicha_theme` desde `localStorage`.
2. Aplica o quita la clase `dark-mode` en `body`.
3. Actualiza iconos de botones de tema.
4. Permite alternar entre `light` y `dark`.

El CSS usa `body.dark-mode` para cambiar variables visuales.

---

## Datos guardados

El juego usa `localStorage`.

Claves:

| Clave | Uso |
|---|---|
| `salchicha_highscore` | Mejor puntaje del modo solitario |
| `salchicha_versus_best` | Mejores marcadores del 1 vs 1 |
| `salchicha_solo_history` | Historial de partidas solitarias |
| `salchicha_obstacles` | Si los ladrillos están activos |
| `salchicha_theme` | Tema claro/oscuro |
| `salchicha_sfx_volume` | Volumen de efectos |
| `salchicha_music_volume` | Volumen de música |
| `salchicha_muted` | Estado silenciado |

---

## Resumen del flujo completo

1. El servidor entrega `index.html`.
2. El navegador carga CSS, `ThemeContext.js`, `game.js` y `game-versus-1v1.js`.
3. Al cargar la página, `game.js` inicializa:
   - controles,
   - skins,
   - botones,
   - audio,
   - estado visual,
   - estadísticas.
4. El usuario elige modo y opciones.
5. Al presionar comenzar:
   - modo solitario usa `startGame()`,
   - modo 1 vs 1 usa `Versus1v1.start()`.
6. El loop actualiza posiciones y renderiza el canvas.
7. Si hay colisión, se detiene el juego y aparece el modal de fin.

