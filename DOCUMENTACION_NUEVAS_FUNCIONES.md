# Documentación de Nuevas Funciones - Salchicha Snake

## 1. Modo de Juego vs Bot 🤖
**Archivo**: `public/game.js`

### Funciones Agregadas:

#### `getBotDirection(botSnake, avoidBombs = true)`
Calcula la dirección óptima para el bot para moverse.
- **Parámetros**:
  - `botSnake`: Array de posiciones del cuerpo del bot.
  - `avoidBombs`: Si el bot debe evitar bombas (default: true).
- **Retorno**: Dirección (`arriba`, `abajo`, `izquierda`, `derecha`).
- **Funcionamiento**:
  1. Filtra direcciones válidas (no chocan con paredes, cuerpo, ladrillos o bombas).
  2. Puntúa cada dirección basada en la distancia a la comida y espacio disponible.
  3. Añade un factor aleatorio para que el bot no sea perfecto.
  4. Selecciona la dirección con la mayor puntuación.

#### `countAvailableSpace(startX, startY, snake)`
Calcula el espacio disponible a partir de una posición (algoritmo BFS - Flood Fill).
- **Parámetros**:
  - `startX`, `startY`: Posición inicial para evaluar.
  - `snake`: Cuerpo de la serpiente para evitar.
- **Retorno**: Número de celdas accesibles (máximo 50).
- **Uso**: Ayuda al bot a evitar caminos que lo dejen atrapado.

---

## 2. Obstáculos Mejorados 🧱💣
**Archivos**: `public/index.html`, `public/game.js`

### Opciones de Obstáculos:
- `Sin obstáculos`: Modo clásico sin obstáculos.
- `Con ladrillos 🧱`: Ladrillos fijos que aparecen al subir de nivel.
- `Con bombas 💣`: Bombas que explotan al contacto y terminan el juego.
- `Ambos 🧱💣`: Combina ladrillos y bombas.

### Funciones Agregadas:

#### `spawnBomb()`
Coloca una nueva bomba en el tablero en una posición válida.
- **Características**:
  - No coloca bombas sobre la serpiente, hueso o ladrillos.
  - Cada bomba tiene un ID único.

#### `isBombAt(x, y)`
Verifica si hay una bomba en las coordenadas indicadas.
- **Parámetros**: `x`, `y`: Coordenadas a revisar.
- **Retorno**: `true` si hay una bomba, `false` en caso contrario.

#### `removeBombAt(x, y)`
Elimina una bomba del tablero y crea una explosión.
- **Parámetros**: `x`, `y`: Posición de la bomba.
- **Efectos**: Crea partículas de explosión llamando a `createExplosion()`.

#### `createExplosion(x, y)`
Genera partículas de explosión visuales.
- **Parámetros**: `x`, `y`: Posición del centro de la explosión.
- **Características**: Crea 8 partículas que se mueven en todas direcciones.

#### `updateExplosions()`
Actualiza la posición y opacidad de las partículas de explosión.
- **Funcionamiento**: Reduce el tiempo de vida de las partículas y las mueve gradualmente.

#### `drawExplosions()`
Dibuja las partículas de explosión en el canvas.
- **Características**: Las partículas son círculos rojos/amarillos con gradiente.

#### `drawBomb(bomb)`
Dibuja una bomba en el canvas.
- **Parámetros**: `bomb`: Objeto de bomba con posición y tiempo de creación.
- **Efectos visuales**:
  - Glow rojo alrededor de la bomba.
  - Mecha parpadeante.
  - Chispa en la punta.

---

## 3. Música de Fondo 🎵
**Archivo**: `public/game.js`

### Modificaciones en `AudioController`:
- Actualizada la lista de archivos de música para incluir `sonido fondo.weba` (el archivo que realmente existe).
- Agregada lógica para probar múltiples archivos de música si el primero falla.
- Variable `currentMusicIndex` para trackear cuál archivo de música estamos usando.

---

## 4. Modo 1vs1 Móvil Landscape Mejorado 📱
**Archivo**: `public/style.css`

### Cambios en el Layout:
- **Arriba**: Joystick del Jugador 2.
- **Centro**: Canvas del juego.
- **Abajo**: Joystick del Jugador 1.
- **Controles**: Botones de audio, tema, pausa y menú en la parte inferior.
- **Joysticks**: Tamaño reducido a 80px para que quepan mejor en la pantalla.

---

## 5. Actualizaciones en `gameState`
**Archivo**: `public/game.js`

### Nuevos campos:
- `obstaclesMode`: Reemplaza a `obstaclesEnabled`, valores: `off`, `bricks`, `bombs`, `both`.
- `bombs`: Array de objetos de bomba.
- `explosionParticles`: Array de partículas de explosión.

---

## 6. Archivos Modificados:
- `public/index.html`:
  - Agregada opción "vs Bot 🤖" en selector de modo de juego.
  - Actualizadas opciones de obstáculos (4 opciones ahora).
- `public/game.js`:
  - Todas las nuevas funciones mencionadas.
  - Actualización de `gameState`.
  - Actualización de lógica de colisiones para bombas.
- `public/style.css`:
  - Modificado el layout del modo vs en landscape.

---

## 7. Cómo Probar:
1. **Modo Bot**: Selecciona "vs Bot 🤖" en el menú y juega.
2. **Obstáculos**: Prueba todas las opciones de obstáculos en solitario o bot.
3. **Música**: Asegúrate de que la música reproduzca correctamente.
4. **1vs1 Móvil**: Gira tu teléfono y prueba el nuevo layout.
