class Render {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cellSize = Config.CELL_SIZE;
    this.gridSize = Config.GRID_SIZE;
    this.particles = [];
    this.init();
  }

  init() {
    this.canvas.width = this.gridSize * this.cellSize;
    this.canvas.height = this.gridSize * this.cellSize;
  }

  clear() {
    this.ctx.fillStyle = Config.COLORS.BG_MEDIUM;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
  }

  drawGrid() {
    this.ctx.strokeStyle = Config.COLORS.GRID;
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i <= this.gridSize; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.cellSize, 0);
      this.ctx.lineTo(i * this.cellSize, this.canvas.height);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.cellSize);
      this.ctx.lineTo(this.canvas.width, i * this.cellSize);
      this.ctx.stroke();
    }
  }

  drawSnake(snake, headColor, bodyColor, direction) {
    snake.forEach((segment, index) => {
      const x = segment.x * this.cellSize;
      const y = segment.y * this.cellSize;
      
      if (index === 0) {
        this.drawHead(x, y, headColor, direction);
      } else if (index === snake.length - 1) {
        this.drawTail(x, y, bodyColor, snake[index - 1], segment);
      } else {
        this.drawBody(x, y, bodyColor);
      }
    });
  }

  drawHead(x, y, color, direction) {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 10;
    this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
    this.ctx.restore();
  }

  drawBody(x, y, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x + 4, y + 4, this.cellSize - 8, this.cellSize - 8);
  }

  drawTail(x, y, color, prev, curr) {
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = 0.7;
    this.ctx.fillRect(x + 4, y + 4, this.cellSize - 8, this.cellSize - 8);
    this.ctx.globalAlpha = 1;
  }

  drawFood(food) {
    const x = food.x * this.cellSize + this.cellSize / 2;
    const y = food.y * this.cellSize + this.cellSize / 2;
    const radius = this.cellSize / 2 - 4;
    
    this.ctx.save();
    this.ctx.fillStyle = Config.COLORS.FOOD;
    this.ctx.shadowColor = Config.COLORS.FOOD;
    this.ctx.shadowBlur = 15;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawWalls(walls) {
    walls.forEach(wall => {
      const x = wall.x * this.cellSize;
      const y = wall.y * this.cellSize;
      this.ctx.fillStyle = Config.COLORS.WALL;
      this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
    });
  }

  addParticle(x, y, color) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x * this.cellSize + this.cellSize / 2,
        y: y * this.cellSize + this.cellSize / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1,
        color: color
      });
    }
  }

  updateAndDrawParticles(deltaTime) {
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= deltaTime * 2;
      
      if (p.life > 0) {
        this.ctx.save();
        this.ctx.globalAlpha = p.life;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        return true;
      }
      return false;
    });
  }
}
