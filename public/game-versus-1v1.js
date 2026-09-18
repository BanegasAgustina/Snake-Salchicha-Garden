/* ==========================================================================
   MODO 1 VS 1 - Jugador 1: WASD | Jugador 2: Flechas
   ========================================================================== */

// Lista de skins disponibles para el modo versus, cada una con su id de carpeta y etiqueta visible
const VERSUS_SKINS = [
  { id: "salchicha marron", label: "Marrón 🤎" },
  { id: "salchicha negro", label: "Negro 🖤" },
  { id: "salchicha gris", label: "Gris 💙" },
  { id: "salchicha blancoy marron", label: "Blanco/Marrón 🤍" },
];

// Caché para no volver a cargar imágenes de una skin que ya fue cargada antes
const versusSkinCache = {};

// Devuelve la ruta de la imagen de cabeza mirando hacia abajo para mostrar en el selector del menú
function getSkinHeadPreviewUrl(skinId) {
  return `/img/${skinId}/cabeza abajo.png`;
}

// Devuelve la ruta alternativa de la cabeza mirando a la derecha, usada si la imagen principal falla
function getSkinHeadFallbackUrl(skinId) {
  return `/img/${skinId}/cabeza derecha.png`;
}

// Carga las imágenes de una skin para el modo versus. Si ya estaban en caché las devuelve directamente
async function loadVersusSkinImages(skinId) {
  if (versusSkinCache[skinId]) return versusSkinCache[skinId];
  const loader = new AssetLoader();
  await loader.loadSkin(skinId);
  versusSkinCache[skinId] = loader.images;
  return loader.images;
}

const Versus1v1 = {
  playing: false,
  paused: false,
  gameOver: false,
  rafId: null,
  speed: 140,
  lastTick: 0,
  graceUntil: 0,
  bone: { x: 0, y: 0 },
  isBot: false,
  bricks: [],
  bombs: [],
  explosionParticles: [],

  skins: { player1: "salchicha marron", player2: "salchicha negro" },
  sliderIndex: { player1: 0, player2: 1 },

  imagesP1: null,
  imagesP2: null,

  player1: null,
  player2: null,

  isRunning() {
    const inGrace = this.graceUntil > 0 && performance.now() < this.graceUntil;
    return this.playing && !this.gameOver && !inGrace;
  },

  initMenu() {
    this.buildSkinSliders();
    this.bindSkinSliders();
  },

  buildSkinSliders() {
    [1, 2].forEach((playerNum) => {
      const track = document.getElementById(`versus-track-${playerNum}`);
      if (!track) return;
      track.innerHTML = "";

      VERSUS_SKINS.forEach((skin, index) => {
        const slide = document.createElement("div");
        slide.className = "versus-slide";
        slide.dataset.index = String(index);
        const img = document.createElement("img");
        img.src = getSkinHeadPreviewUrl(skin.id);
        img.alt = skin.label;
        img.draggable = false;
        img.onerror = function () {
          this.onerror = null;
          this.src = getSkinHeadFallbackUrl(skin.id);
        };
        slide.appendChild(img);
        track.appendChild(slide);
      });
    });

    this.setSliderIndex(1, this.sliderIndex.player1, false);
    this.setSliderIndex(2, this.sliderIndex.player2, false);
  },

  bindSkinSliders() {
    document.querySelectorAll(".versus-slider").forEach((slider) => {
      const player = slider.dataset.player;
      const playerNum = player === "player1" ? 1 : 2;

      slider.querySelector(".versus-prev")?.addEventListener("click", () => {
        const key = player;
        const next =
          (this.sliderIndex[key] - 1 + VERSUS_SKINS.length) %
          VERSUS_SKINS.length;
        this.setSliderIndex(playerNum, next);
        sound.playClick();
      });

      slider.querySelector(".versus-next")?.addEventListener("click", () => {
        const key = player;
        const next = (this.sliderIndex[key] + 1) % VERSUS_SKINS.length;
        this.setSliderIndex(playerNum, next);
        sound.playClick();
      });
    });
  },

  setSliderIndex(playerNum, index, animate = true) {
    const key = playerNum === 1 ? "player1" : "player2";
    const otherKey = playerNum === 1 ? "player2" : "player1";

    // Make sure the selected skin isn't the same as the other player's
    let finalIndex = index;
    let originalIndex = index;
    let attempts = 0;

    // If the selected skin is already used by the other player, pick the next one
    while (
      finalIndex === this.sliderIndex[otherKey] &&
      attempts < VERSUS_SKINS.length
    ) {
      finalIndex = (finalIndex + 1) % VERSUS_SKINS.length;
      attempts++;
    }

    this.sliderIndex[key] = finalIndex;
    const skin = VERSUS_SKINS[finalIndex];
    this.skins[key] = skin.id;

    const track = document.getElementById(`versus-track-${playerNum}`);
    const label = document.getElementById(`versus-label-${playerNum}`);
    if (!track) return;

    if (label) label.textContent = skin.label;
    if (typeof updateActiveSkinPreview === "function")
      updateActiveSkinPreview();

    track.querySelectorAll(".versus-slide").forEach((slide, i) => {
      slide.classList.toggle("active", i === finalIndex);
      // Add disabled style if this skin is used by the other player
      slide.classList.toggle("disabled", i === this.sliderIndex[otherKey]);
    });

    const applyOffset = () => {
      const viewport = track.parentElement;
      const slideWidth = viewport?.clientWidth || 140;
      track.style.transition = animate
        ? "transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)"
        : "none";
      track.style.transform = `translateX(${-finalIndex * slideWidth}px)`;
    };

    applyOffset();
    requestAnimationFrame(applyOffset);

    // Also update the other track to show which skins are disabled
    this.updateDisabledSkins(playerNum === 1 ? 2 : 1);
  },

  // Update the other player's track to show disabled skins
  updateDisabledSkins(playerNum) {
    const track = document.getElementById(`versus-track-${playerNum}`);
    const key = playerNum === 1 ? "player1" : "player2";
    const otherKey = playerNum === 1 ? "player2" : "player1";
    if (!track) return;

    track.querySelectorAll(".versus-slide").forEach((slide, i) => {
      slide.classList.toggle("disabled", i === this.sliderIndex[otherKey]);
    });
  },

  refreshSliderLayout() {
    this.setSliderIndex(1, this.sliderIndex.player1, false);
    this.setSliderIndex(2, this.sliderIndex.player2, false);
  },

  createPlayer(headX, headY, direction, skin) {
    const behind = {
      derecha: { x: -1, y: 0 },
      izquierda: { x: 1, y: 0 },
      arriba: { x: 0, y: 1 },
      abajo: { x: 0, y: -1 },
    }[direction];

    const snake = [{ x: headX, y: headY }];
    for (let i = 1; i < 3; i++) {
      snake.push({
        x: headX + behind.x * i,
        y: headY + behind.y * i,
      });
    }

    return {
      snake,
      previousSnake: cloneSnakeSegments(snake),
      direction,
      nextDirection: direction,
      skin,
      score: 0,
      alive: true,
    };
  },

  /** Spawn en esquinas opuestas, sin ir uno hacia el otro en la misma fila */
  setupVersusSpawn() {
    const g = GRID_SIZE;
    const mid = Math.floor(g / 2);
    const inset = 3;

    // J1: lado izquierdo, sube por el borde
    this.player1 = this.createPlayer(
      inset,
      Math.min(g - 4, mid + 2),
      "arriba",
      this.skins.player1,
    );

    // J2: lado derecho, baja por el borde
    this.player2 = this.createPlayer(
      g - 1 - inset,
      Math.max(3, mid - 2),
      "abajo",
      this.skins.player2,
    );
  },

  addRandomBrick(minDistFromPlayers = 2) {
    const g = GRID_SIZE;
    const playerPositions = [...this.player1.snake, ...this.player2.snake];
    for (let attempts = 0; attempts < 100; attempts++) {
      const x = Math.floor(Math.random() * g);
      const y = Math.floor(Math.random() * g);
      const blocked =
        (x === this.bone.x && y === this.bone.y) ||
        this.bricks.some((b) => b.x === x && b.y === y) ||
        playerPositions.some((p) => p.x === x && p.y === y);
      if (!blocked) {
        this.bricks.push({ x, y });
        return;
      }
    }
  },

  spawnBomb() {
    const g = GRID_SIZE;
    const playerPositions = [...this.player1.snake, ...this.player2.snake];
    for (let attempts = 0; attempts < 100; attempts++) {
      const x = Math.floor(Math.random() * g);
      const y = 0; // Start from top
      const blocked =
        (x === this.bone.x && y === this.bone.y) ||
        this.bricks.some((b) => b.x === x && b.y === y) ||
        this.bombs.some((b) => b.x === x && b.y === y) ||
        playerPositions.some((p) => p.x === x && p.y === y);
      if (!blocked) {
        this.bombs.push({
          x,
          y,
          id: Date.now(),
          spawnTime: performance.now(),
          falling: true,
        });
        return;
      }
    }
  },

  isBrickAt(x, y) {
    return this.bricks.some((b) => b.x === x && b.y === y);
  },

  isBombAt(x, y) {
    return this.bombs.some((b) => b.x === x && b.y === y);
  },

  removeBombAt(x, y) {
    const index = this.bombs.findIndex((b) => b.x === x && b.y === y);
    if (index !== -1) {
      this.bombs.splice(index, 1);
      this.createExplosion(x, y);
    }
  },

  updateBombs() {
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const bomb = this.bombs[i];
      if (bomb.falling) {
        // Move bomb down
        const nextY = bomb.y + 1;
        // Check if next position is valid
        const blocked =
          nextY >= GRID_SIZE ||
          this.isBrickAt(bomb.x, nextY) ||
          this.isBombAt(bomb.x, nextY) ||
          this.player1.snake.some((p) => p.x === bomb.x && p.y === nextY) ||
          this.player2.snake.some((p) => p.x === bomb.x && p.y === nextY);

        if (blocked) {
          // Stop falling
          bomb.falling = false;
        } else {
          // Move down
          bomb.y = nextY;
        }
      }
    }
  },

  createExplosion(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      this.explosionParticles.push({
        x,
        y,
        angle,
        speed: 2 + Math.random(),
        life: 1,
        maxLife: 1,
      });
    }
  },

  updateExplosions() {
    this.explosionParticles = this.explosionParticles.filter((p) => {
      p.life -= 0.02;
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed;
      return p.life > 0;
    });
  },

  drawExplosions(drawCtx) {
    this.explosionParticles.forEach((p) => {
      const alpha = p.life;
      const size = TILE_SIZE * 0.3 * p.life;
      drawCtx.save();
      drawCtx.globalAlpha = alpha;
      drawCtx.fillStyle = "#ff6b6b";
      drawCtx.beginPath();
      drawCtx.arc(
        p.x * TILE_SIZE + TILE_SIZE / 2,
        p.y * TILE_SIZE + TILE_SIZE / 2,
        size,
        0,
        Math.PI * 2,
      );
      drawCtx.fill();
      drawCtx.restore();
    });
  },

  drawBomb(drawCtx, bomb) {
    const now = performance.now();
    const pulse = 1 + 0.1 * Math.sin((now - bomb.spawnTime) / 100);
    const size = TILE_SIZE * 0.8 * pulse;
    const offset = (size - TILE_SIZE) / 2;

    const cx = bomb.x * TILE_SIZE + TILE_SIZE / 2;
    const cy = bomb.y * TILE_SIZE + TILE_SIZE / 2;

    // Glow rojo
    drawCtx.save();
    drawCtx.shadowColor = "rgba(255, 0, 0, 0.6)";
    drawCtx.shadowBlur = 15;
    drawCtx.fillStyle = "#333";
    drawCtx.beginPath();
    drawCtx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    drawCtx.fill();

    // Mecha
    drawCtx.strokeStyle = "#8B4513";
    drawCtx.lineWidth = 3;
    drawCtx.beginPath();
    drawCtx.moveTo(cx, cy - size / 2);
    drawCtx.lineTo(cx, cy - size / 2 - 8);
    drawCtx.stroke();

    // Chispa
    const spark = Math.sin(now / 50) > 0;
    if (spark) {
      drawCtx.shadowBlur = 10;
      drawCtx.fillStyle = "#ff9800";
      drawCtx.beginPath();
      drawCtx.arc(cx, cy - size / 2 - 10, 3, 0, Math.PI * 2);
      drawCtx.fill();
    }
    drawCtx.restore();
  },

  async start(isBotMode = false) {
    // Detener cualquier partida anterior que esté corriendo
    this.stop();
    // Sincronizar la configuración del menú (dificultad, modo de obstáculos, etc.)
    syncMenuSettingsFromDOM();

    // Establecer si es modo Jugador vs Bot (true) o 1vs1 entre dos jugadores (false)
    this.isBot = isBotMode;

    // Establecer el tamaño del tablero según la configuración
    GRID_SIZE = gameState.boardSize;
    TILE_SIZE = CANVAS_SIZE / GRID_SIZE;

    // Asignar las skins seleccionadas en el menú para cada jugador
    this.skins.player1 = VERSUS_SKINS[this.sliderIndex.player1].id;
    this.skins.player2 = VERSUS_SKINS[this.sliderIndex.player2].id;

    // Reiniciar arrays de obstáculos, bombas y partículas de explosión
    this.bricks = [];
    this.bombs = [];
    this.explosionParticles = [];

    // Colocar las serpientes de cada jugador en su posición de inicio
    this.setupVersusSpawn();
    // Generar decoraciones del jardín (flores, etc.)
    generateGardenDecorations();

    // Añadir ladrillos iniciales si el modo de obstáculos lo permite
    if (
      gameState.obstaclesMode === "bricks" ||
      gameState.obstaclesMode === "both"
    ) {
      this.addRandomBrick(4); // Ladrillo para jugador 1
      this.addRandomBrick(4); // Ladrillo para jugador 2
    }
    // Añadir bombas iniciales si el modo de obstáculos lo permite
    if (
      gameState.obstaclesMode === "bombs" ||
      gameState.obstaclesMode === "both"
    ) {
      this.spawnBomb(); // Primera bomba
      this.spawnBomb(); // Segunda bomba
    }

    // Cambiar a la pantalla del juego y actualizar la interfaz
    showScreen("game-screen");
    updateGameScreenPanel();
    // Ocultar la pantalla de pausa por si estaba activa
    document.getElementById("pause-overlay")?.classList.remove("active");

    // Esperar dos frames para asegurar que los elementos HTML estén listos
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    // Obtener el contexto del canvas para dibujar
    const c = refreshGameContext();
    if (!c) {
      // Si no se puede obtener el contexto, mostrar mensaje de error
      await showAppModal({
        title: "Error",
        message: "No se encontró el tablero de juego.",
        confirmText: "Entendido",
      });
      return;
    }

    try {
      // Cargar las imágenes de las skins para cada jugador
      this.imagesP1 = await loadVersusSkinImages(this.skins.player1);
      this.imagesP2 = await loadVersusSkinImages(this.skins.player2);

      // Ejecutar la cuenta regresiva antes de iniciar la partida
      if (typeof runBoardCountdown === "function") {
        sound.playClick();
        await runBoardCountdown();
      }

      // Establecer la velocidad del juego según la dificultad (igual que el modo solitario):
      // - facil: 180ms por movimiento
      // - normal: 135ms por movimiento
      // - dificil: 90ms por movimiento
      const diffSpeeds = { facil: 180, normal: 135, dificil: 90 };
      this.speed = diffSpeeds[gameState.difficulty] || 135;

      // Establecer el estado del juego a "jugando"
      this.playing = true;
      this.paused = false;
      this.gameOver = false;
      // Periodo de gracia inicial para que los jugadores no choquen inmediatamente
      this.graceUntil = 0;
      // Registrar el momento del último movimiento para controlar la velocidad
      this.lastTick = performance.now();

      // Colocar el primer hueso en el tablero
      this.spawnBone();
      // Actualizar la interfaz del HUD (puntuaciones, etc.)
      this.updateHud();
      // Dibujar el estado inicial del juego
      this.draw();
      // Iniciar el ciclo principal del juego
      this.loop();
    } catch (err) {
      // Manejar errores de inicio
      console.error("Versus 1v1:", err);
      this.playing = false;
      await showAppModal({
        title: "No se pudo iniciar el 1 vs 1",
        message:
          "Revisa que el servidor esté activo (<code>npm start</code>) y recarga la página.",
        confirmText: "Entendido",
      });
      // Volver al menú principal
      showScreen("menu-screen");
    }
  },

  onResize() {
    if (!this.playing) return;
    refreshGameContext();
    this.draw();
  },

  stop() {
    this.playing = false;
    this.paused = false;
    this.gameOver = false;
    this.graceUntil = 0;
    this.isBot = false;
    this.bricks = [];
    this.bombs = [];
    this.explosionParticles = [];
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  },

  loop() {
    if (!this.playing) {
      this.rafId = null;
      return;
    }

    const now = performance.now();
    const inGrace = this.graceUntil > 0 && now < this.graceUntil;

    if (
      !this.paused &&
      !this.gameOver &&
      !inGrace &&
      now - this.lastTick >= this.speed
    ) {
      this.tick();
      this.lastTick = now;
    }

    this.draw(inGrace ? now : 0);
    this.rafId = requestAnimationFrame(() => this.loop());
  },

  spawnBone() {
    for (let attempt = 0; attempt < 500; attempt++) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      const blocked =
        [...this.player1.snake, ...this.player2.snake].some(
          (s) => s.x === x && s.y === y,
        ) ||
        this.isBrickAt(x, y) ||
        this.isBombAt(x, y);
      if (!blocked) {
        this.bone = { x, y };
        return;
      }
    }
    this.bone = { x: 0, y: 0 };
  },

  moveHead(head, direction) {
    const h = { ...head };
    if (direction === "arriba") h.y--;
    else if (direction === "abajo") h.y++;
    else if (direction === "izquierda") h.x--;
    else h.x++;
    return h;
  },

  getBotDirectionForVersus(botSnake) {
    const head = { ...botSnake[0] };
    const directions = [
      { dir: "arriba", dx: 0, dy: -1 },
      { dir: "abajo", dx: 0, dy: 1 },
      { dir: "izquierda", dx: -1, dy: 0 },
      { dir: "derecha", dx: 1, dy: 0 },
    ];

    // Get current direction to avoid 180 turns
    let currentDir;
    if (botSnake.length >= 2) {
      const prev = botSnake[1];
      if (prev.x < head.x) currentDir = "derecha";
      else if (prev.x > head.x) currentDir = "izquierda";
      else if (prev.y < head.y) currentDir = "abajo";
      else if (prev.y > head.y) currentDir = "arriba";
    }
    const opposite = {
      arriba: "abajo",
      abajo: "arriba",
      izquierda: "derecha",
      derecha: "izquierda",
    };

    // Filter valid directions
    const validDirections = directions.filter((d) => {
      if (d.dir === opposite[currentDir]) return false;
      const nx = head.x + d.dx;
      const ny = head.y + d.dy;

      // Check grid bounds
      if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) return false;

      // Check collision with self
      if (botSnake.some((s) => s.x === nx && s.y === ny)) return false;
      // Check collision with player
      if (this.player1.snake.some((s) => s.x === nx && s.y === ny))
        return false;

      // Check collision with bricks
      if (this.isBrickAt(nx, ny)) return false;

      // Check collision with bombs
      if (this.isBombAt(nx, ny)) return false;

      return true;
    });

    if (validDirections.length === 0) return currentDir; // No valid moves, just go anywhere

    // Score each direction
    const scored = validDirections.map((d) => {
      const nx = head.x + d.dx;
      const ny = head.y + d.dy;

      // Distance to bone (smaller is better)
      const distToBone =
        Math.abs(nx - this.bone.x) + Math.abs(ny - this.bone.y);

      // Random factor to make bot less perfect
      const randomFactor = Math.random() * 0.5;

      return {
        ...d,
        score: -distToBone + randomFactor,
      };
    });

    // Pick direction with highest score
    scored.sort((a, b) => b.score - a.score);
    return scored[0].dir;
  },

  tick() {
    // Update bombs every 10 ticks to make them fall slower
    if (this.bombTickCounter === undefined) this.bombTickCounter = 0;
    this.bombTickCounter++;
    if (this.bombTickCounter % 10 === 0) {
      this.updateBombs();
    }

    this.updateExplosions();

    // Bot movement if isBot
    if (this.isBot && this.player2.alive) {
      this.player2.nextDirection = this.getBotDirectionForVersus(
        this.player2.snake,
      );
    }

    this.player1.previousSnake = cloneSnakeSegments(this.player1.snake);
    this.player2.previousSnake = cloneSnakeSegments(this.player2.snake);

    this.player1.direction = this.player1.nextDirection;
    this.player2.direction = this.player2.nextDirection;

    const head1 = this.moveHead(this.player1.snake[0], this.player1.direction);
    const head2 = this.moveHead(this.player2.snake[0], this.player2.direction);

    if (head1.x === head2.x && head1.y === head2.y) {
      this.endGame("empate");
      return;
    }

    const crash1 =
      head1.x < 0 ||
      head1.x >= GRID_SIZE ||
      head1.y < 0 ||
      head1.y >= GRID_SIZE ||
      this.player1.snake.some(
        (s, i) => i > 0 && s.x === head1.x && s.y === head1.y,
      ) ||
      this.player2.snake.some((s) => s.x === head1.x && s.y === head1.y) ||
      this.isBrickAt(head1.x, head1.y);

    const crash2 =
      head2.x < 0 ||
      head2.x >= GRID_SIZE ||
      head2.y < 0 ||
      head2.y >= GRID_SIZE ||
      this.player2.snake.some(
        (s, i) => i > 0 && s.x === head2.x && s.y === head2.y,
      ) ||
      this.player1.snake.some((s) => s.x === head2.x && s.y === head2.y) ||
      this.isBrickAt(head2.x, head2.y);

    // Check bomb collisions
    if (this.isBombAt(head1.x, head1.y)) {
      this.removeBombAt(head1.x, head1.y);
      this.player1.alive = false;
    }
    if (this.isBombAt(head2.x, head2.y)) {
      this.removeBombAt(head2.x, head2.y);
      this.player2.alive = false;
    }

    if (!crash1 && this.player1.alive) {
      // Player 1 survives
    } else {
      this.player1.alive = false;
    }

    if (!crash2 && this.player2.alive) {
      // Player 2 survives
    } else {
      this.player2.alive = false;
    }

    if (!this.player1.alive && !this.player2.alive) {
      this.endGame("empate");
      return;
    }
    if (!this.player1.alive) {
      this.endGame("player2");
      return;
    }
    if (!this.player2.alive) {
      this.endGame("player1");
      return;
    }

    this.player1.snake.unshift(head1);
    this.player2.snake.unshift(head2);

    const ate1 = head1.x === this.bone.x && head1.y === this.bone.y;
    const ate2 = head2.x === this.bone.x && head2.y === this.bone.y;

    if (ate1) {
      this.player1.score++;
      sound.playEat();
      this.spawnBone();

      // Level up logic: add obstacles
      if (
        gameState.obstaclesMode === "bricks" ||
        gameState.obstaclesMode === "both"
      ) {
        this.addRandomBrick(3);
      }
      if (
        gameState.obstaclesMode === "bombs" ||
        gameState.obstaclesMode === "both"
      ) {
        if (Math.random() > 0.7) {
          this.spawnBomb();
        }
      }
    } else {
      this.player1.snake.pop();
    }

    if (ate2) {
      this.player2.score++;
      sound.playEat();
      if (!ate1) {
        this.spawnBone();
        // Level up logic for bot too
        if (
          gameState.obstaclesMode === "bricks" ||
          gameState.obstaclesMode === "both"
        ) {
          this.addRandomBrick(3);
        }
        if (
          gameState.obstaclesMode === "bombs" ||
          gameState.obstaclesMode === "both"
        ) {
          if (Math.random() > 0.7) {
            this.spawnBomb();
          }
        }
      }
    } else {
      this.player2.snake.pop();
    }

    this.updateExplosions();
    this.updateHud();
  },

  draw(graceNow = 0) {
    const drawCtx = refreshGameContext();
    if (!drawCtx) return;

    drawGardenBackground(drawCtx);
    drawGardenFlowers({
      snakes: [this.player1.snake, this.player2.snake],
      bone: this.bone,
      bricks: this.bricks,
    });

    // Draw bricks
    if (
      (gameState.obstaclesMode === "bricks" ||
        gameState.obstaclesMode === "both") &&
      this.bricks.length > 0
    ) {
      const brickSize = TILE_SIZE * 0.9;
      const brickOffset = (brickSize - TILE_SIZE) / 2;
      this.bricks.forEach((brick) => {
        if (typeof assets !== "undefined" && assets.images?.ladrillo) {
          drawSprite(
            drawCtx,
            assets.images.ladrillo,
            brick.x * TILE_SIZE - brickOffset,
            brick.y * TILE_SIZE - brickOffset,
            brickSize,
            brickSize,
          );
        }
      });
    }

    // Draw bombs
    if (
      gameState.obstaclesMode === "bombs" ||
      gameState.obstaclesMode === "both"
    ) {
      this.bombs.forEach((bomb) => this.drawBomb(drawCtx, bomb));
    }

    const boneImg = this.imagesP1?.hueso || this.imagesP2?.hueso;
    drawBoneSprite(drawCtx, this.bone, boneImg);

    const progress =
      this.playing && !this.paused && !this.gameOver
        ? (performance.now() - this.lastTick) / this.speed
        : 1;

    drawSnakeFromLoader(
      drawCtx,
      this.player1,
      { images: this.imagesP1 },
      { progress },
    );
    drawSnakeFromLoader(
      drawCtx,
      this.player2,
      { images: this.imagesP2 },
      { progress },
    );

    // Draw explosions
    this.drawExplosions(drawCtx);

    if (graceNow > 0 && this.graceUntil > graceNow) {
      const secs = Math.ceil((this.graceUntil - graceNow) / 1000);
      drawCtx.save();
      drawCtx.fillStyle = "rgba(20, 50, 24, 0.55)";
      drawCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      drawCtx.font = "700 42px Fredoka, Outfit, sans-serif";
      drawCtx.textAlign = "center";
      drawCtx.textBaseline = "middle";
      drawCtx.fillStyle = "#fff9c4";
      drawCtx.shadowColor = "rgba(255, 213, 79, 0.8)";
      drawCtx.shadowBlur = 16;
      drawCtx.fillText(
        secs > 0 ? `¡Preparados! ${secs}` : "¡Ya!",
        CANVAS_SIZE / 2,
        CANVAS_SIZE / 2 - 12,
      );
      drawCtx.font = "600 18px Outfit, sans-serif";
      drawCtx.fillStyle = "rgba(255, 255, 255, 0.9)";
      drawCtx.shadowBlur = 0;
      drawCtx.fillText(
        this.isBot ? "WASD" : "WASD · Flechas",
        CANVAS_SIZE / 2,
        CANVAS_SIZE / 2 + 28,
      );
      drawCtx.restore();
    }
  },

  updateHud() {
    const scoreText = `${this.player1.score} - ${this.player2.score}`;
    const best = this.loadBest();

    const scoreVal = document.getElementById("score-val");
    const levelVal = document.getElementById("level-val");
    const desktopScore = document.getElementById("desktop-score");
    const desktopLevel = document.getElementById("desktop-level");
    const desktopHighscore = document.getElementById("desktop-highscore");

    const modeLabel = this.isBot ? "JUGADOR VS BOT" : "1 VS 1";

    if (scoreVal) scoreVal.textContent = scoreText;
    // No escribir el modo en el HUD móvil (level-val) para evitar texto superpuesto;
    // el modo ya se muestra en el panel de estadísticas de escritorio (desktop-level).
    const mobileLevelItem = levelVal?.closest(".hud-item");
    if (mobileLevelItem) mobileLevelItem.style.display = "none";
    if (desktopScore) desktopScore.textContent = scoreText;
    if (desktopLevel) desktopLevel.textContent = modeLabel;
    if (desktopHighscore)
      desktopHighscore.textContent = `${best.p1} - ${best.p2}`;

    const scoreLabel = document.querySelector(".hud-item .hud-label");
    if (scoreLabel) scoreLabel.textContent = "MARCADOR";
  },

  loadBest() {
    try {
      const raw = localStorage.getItem("salchicha_versus_best");
      if (raw) {
        const b = JSON.parse(raw);
        return { p1: b.player1 || 0, p2: b.player2 || 0 };
      }
    } catch {
      /* ignore */
    }
    return { p1: 0, p2: 0 };
  },

  saveBest() {
    const best = this.loadBest();
    localStorage.setItem(
      "salchicha_versus_best",
      JSON.stringify({
        player1: Math.max(best.p1, this.player1.score),
        player2: Math.max(best.p2, this.player2.score),
      }),
    );
    updateMenuBestScores();
  },

  endGame(winner) {
    this.playing = false;
    this.gameOver = true;
    this.saveBest();
    sound.playGameOver();

    const best = this.loadBest();
    setTimeout(() => {
      document.getElementById("final-score").textContent =
        `${this.player1.score} - ${this.player2.score}`;
      const modeLabel = this.isBot ? "JUGADOR VS BOT" : "1 VS 1";
      document.getElementById("final-level").textContent = modeLabel;

      const deathReason = document.getElementById("death-reason");
      if (deathReason) {
        if (winner === "empate") {
          deathReason.innerHTML = `¡Empate! 🤝<br><small>Mejor marcador: ${best.p1} - ${best.p2}</small>`;
        } else if (winner === "player1") {
          if (this.isBot) {
            deathReason.innerHTML = `¡Tú ganas! 🎉<br><small>Mejor marcador: ${best.p1} - ${best.p2}</small>`;
          } else {
            deathReason.innerHTML = `¡Jugador 1 (WASD) gana! 🎉<br><small>Mejor marcador: ${best.p1} - ${best.p2}</small>`;
          }
        } else {
          if (this.isBot) {
            deathReason.innerHTML = `¡Bot gana! 🤖<br><small>Mejor marcador: ${best.p1} - ${best.p2}</small>`;
          } else {
            deathReason.innerHTML = `¡Jugador 2 (Flechas) gana! 🎉<br><small>Mejor marcador: ${best.p1} - ${best.p2}</small>`;
          }
        }
      }

      showGameOverModal();
    }, 700);
  },

  togglePause() {
    if (!this.playing || this.gameOver) return;
    this.paused = !this.paused;
    const pauseOverlay = document.getElementById("pause-overlay");
    if (this.paused) pauseOverlay?.classList.add("active");
    else {
      pauseOverlay?.classList.remove("active");
      this.lastTick = performance.now();
    }
  },

  setDirection(player, dir) {
    const p = player === 1 ? this.player1 : this.player2;
    if (!p || !this.playing || this.paused || this.gameOver) return;
    const opposite = {
      arriba: "abajo",
      abajo: "arriba",
      izquierda: "derecha",
      derecha: "izquierda",
    };
    if (p.direction !== opposite[dir]) p.nextDirection = dir;
  },

  onKeyDown(e) {
    const keys = [
      "w",
      "W",
      "a",
      "A",
      "s",
      "S",
      "d",
      "D",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      " ",
    ];
    if (keys.includes(e.key)) e.preventDefault();
    if (!this.playing || this.gameOver) return;

    const inGrace = this.graceUntil > 0 && performance.now() < this.graceUntil;
    if (e.key === " " && inGrace) return;

    switch (e.key) {
      case "w":
      case "W":
        this.setDirection(1, "arriba");
        break;
      case "ArrowUp":
        this.setDirection(this.isBot ? 1 : 2, "arriba");
        break;
      case "s":
      case "S":
        this.setDirection(1, "abajo");
        break;
      case "ArrowDown":
        this.setDirection(this.isBot ? 1 : 2, "abajo");
        break;
      case "a":
      case "A":
        this.setDirection(1, "izquierda");
        break;
      case "ArrowLeft":
        this.setDirection(this.isBot ? 1 : 2, "izquierda");
        break;
      case "d":
      case "D":
        this.setDirection(1, "derecha");
        break;
      case "ArrowRight":
        this.setDirection(this.isBot ? 1 : 2, "derecha");
        break;
      case " ":
        if (!inGrace && !e.repeat) this.togglePause();
        break;
    }
  },

  onSwipe(dx, dy, threshold) {
    if (!this.isRunning() || this.paused) return;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
      this.setDirection(1, dx > 0 ? "derecha" : "izquierda");
    } else if (Math.abs(dy) > threshold) {
      this.setDirection(1, dy > 0 ? "abajo" : "arriba");
    }
  },

  onDpad(dir) {
    if (!this.isRunning() || this.paused) return;
    this.setDirection(1, dir);
  },

  onJoystick(player, dir) {
    if (!this.isRunning() || this.paused) return;
    // In bot mode, only player 1's joystick is active
    if (this.isBot && player === 2) return;
    this.setDirection(player, dir);
  },
};

function updateVersusHudLabels() {
  Versus1v1.updateHud();
}

function resetVersusHudLabels() {
  const scoreLabel = document.querySelector(".hud-item .hud-label");
  const levelLabel = document.querySelectorAll(".hud-item .hud-label")[1];
  if (scoreLabel) scoreLabel.textContent = "HUESOS";
  if (levelLabel) levelLabel.textContent = "NIVEL";
}
