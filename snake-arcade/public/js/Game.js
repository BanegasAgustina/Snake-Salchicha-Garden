class Game {
  constructor() {
    this.mode = 'single';
    this.canvas = document.getElementById('game-canvas');
    this.render = new Render(this.canvas);
    this.reset();
    this.lastTime = 0;
    this.accumulator = 0;
  }

  reset() {
    this.snake1 = this.createSnake(5, Math.floor(Config.GRID_SIZE / 2));
    this.direction1 = 'right';
    this.nextDirection1 = 'right';
    this.score1 = 0;
    this.level = 1;
    this.speed = Config.INITIAL_SPEED;
    this.food = Collisions.generateFood(Config.GRID_SIZE, this.snake1);
    this.walls = [];
    this.paused = false;
    this.gameOver = false;
    this.winner = null;

    if (this.mode === 'multi') {
      this.snake2 = this.createSnake(Config.GRID_SIZE - 6, Math.floor(Config.GRID_SIZE / 2), 'left');
      this.direction2 = 'left';
      this.nextDirection2 = 'left';
      this.score2 = 0;
    }
  }

  createSnake(x, y, dir = 'right') {
    const snake = [];
    for (let i = 0; i < 3; i++) {
      if (dir === 'right') {
        snake.push({ x: x - i, y: y });
      } else {
        snake.push({ x: x + i, y: y });
      }
    }
    return snake;
  }

  setMode(mode) {
    this.mode = mode;
    this.reset();
  }

  setDirection(player, direction) {
    if (player === 1) {
      if (this.isValidDirection(this.direction1, direction)) {
        this.nextDirection1 = direction;
      }
    } else {
      if (this.isValidDirection(this.direction2, direction)) {
        this.nextDirection2 = direction;
      }
    }
  }

  isValidDirection(current, next) {
    const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
    return opposites[current] !== next;
  }

  moveSnake(snake, direction) {
    const head = { ...snake[0] };
    switch (direction) {
      case 'up': head.y--; break;
      case 'down': head.y++; break;
      case 'left': head.x--; break;
      case 'right': head.x++; break;
    }
    snake.unshift(head);
    return snake.pop();
  }

  update(deltaTime) {
    if (this.paused || this.gameOver) return;

    this.accumulator += deltaTime * 1000;

    if (this.accumulator >= this.speed) {
      this.accumulator = 0;
      this.tick();
    }

    this.render.updateAndDrawParticles(deltaTime);
  }

  tick() {
    this.direction1 = this.nextDirection1;
    const tail1 = this.moveSnake(this.snake1, this.direction1);

    if (Collisions.checkWall(this.snake1, Config.GRID_SIZE) || 
        Collisions.checkSelf(this.snake1) || 
        Collisions.checkWalls(this.snake1, this.walls)) {
      this.endGame(2);
      return;
    }

    if (this.mode === 'multi') {
      this.direction2 = this.nextDirection2;
      const tail2 = this.moveSnake(this.snake2, this.direction2);

      if (Collisions.checkWall(this.snake2, Config.GRID_SIZE) || 
          Collisions.checkSelf(this.snake2) || 
          Collisions.checkWalls(this.snake2, this.walls)) {
        this.endGame(1);
        return;
      }

      if (Collisions.checkOther(this.snake1, this.snake2)) {
        this.endGame(2);
        return;
      }
      if (Collisions.checkOther(this.snake2, this.snake1)) {
        this.endGame(1);
        return;
      }

      if (Collisions.checkFood(this.snake2, this.food)) {
        this.score2++;
        this.snake2.push(tail2);
        this.render.addParticle(this.food.x, this.food.y, Config.COLORS.SNAKE2);
        audio.playEat();
        this.food = Collisions.generateFood(Config.GRID_SIZE, this.snake1, this.snake2, this.walls);
      }
    }

    if (Collisions.checkFood(this.snake1, this.food)) {
      this.score1++;
      this.snake1.push(tail1);
      this.render.addParticle(this.food.x, this.food.y, Config.COLORS.FOOD);
      audio.playEat();
      
      if (this.score1 % Config.POINTS_PER_LEVEL === 0) {
        this.levelUp();
      }
      
      if (this.mode === 'multi') {
        this.food = Collisions.generateFood(Config.GRID_SIZE, this.snake1, this.snake2, this.walls);
      } else {
        this.food = Collisions.generateFood(Config.GRID_SIZE, this.snake1, [], this.walls);
      }
    }
  }

  levelUp() {
    this.level++;
    this.speed = Math.max(50, this.speed - Config.SPEED_INCREMENT);
    audio.playLevelUp();
    
    const newWalls = Collisions.generateWalls(Config.WALLS_PER_LEVEL, Config.GRID_SIZE, this.snake1, this.mode === 'multi' ? this.snake2 : []);
    this.walls.push(...newWalls);
  }

  draw() {
    this.render.clear();
    this.render.drawWalls(this.walls);
    this.render.drawFood(this.food);
    this.render.drawSnake(this.snake1, Config.COLORS.SNAKE1_HEAD, Config.COLORS.SNAKE1, this.direction1);
    
    if (this.mode === 'multi') {
      this.render.drawSnake(this.snake2, Config.COLORS.SNAKE2_HEAD, Config.COLORS.SNAKE2, this.direction2);
    }
  }

  endGame(winner) {
    this.gameOver = true;
    audio.playGameOver();
    this.winner = winner;
    
    if (this.mode === 'multi') {
      ui.showWinner(winner);
    } else {
      ui.showGameOver();
    }
  }

  togglePause() {
    this.paused = !this.paused;
  }

  gameLoop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    if (!this.gameOver) {
      this.update(deltaTime);
      this.draw();
    }

    requestAnimationFrame(t => this.gameLoop(t));
  }

  start() {
    this.lastTime = 0;
    this.accumulator = 0;
    this.gameLoop(0);
  }
}

const game = new Game();
