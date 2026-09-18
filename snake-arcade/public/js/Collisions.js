class Collisions {
  static checkWall(snake, gridSize) {
    const head = snake[0];
    return head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
  }

  static checkSelf(snake) {
    const head = snake[0];
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        return true;
      }
    }
    return false;
  }

  static checkOther(snake1, snake2) {
    const head = snake1[0];
    for (let i = 0; i < snake2.length; i++) {
      if (head.x === snake2[i].x && head.y === snake2[i].y) {
        return true;
      }
    }
    return false;
  }

  static checkWalls(snake, walls) {
    const head = snake[0];
    for (let wall of walls) {
      if (head.x === wall.x && head.y === wall.y) {
        return true;
      }
    }
    return false;
  }

  static checkFood(snake, food) {
    const head = snake[0];
    return head.x === food.x && head.y === food.y;
  }

  static generateFood(gridSize, snake1, snake2 = [], walls = []) {
    let food;
    do {
      food = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      };
    } while (
      this.isOccupied(food, snake1, snake2, walls));
    return food;
  }

  static isOccupied(pos, snake1, snake2 = [], walls = []) {
    for (let segment of snake1) {
      if (segment.x === pos.x && segment.y === pos.y) return true;
    }
    for (let segment of snake2) {
      if (segment.x === pos.x && segment.y === pos.y) return true;
    }
    for (let wall of walls) {
      if (wall.x === pos.x && wall.y === pos.y) return true;
    }
    return false;
  }

  static generateWalls(count, gridSize, snake1, snake2 = []) {
    const walls = [];
    for (let i = 0; i < count; i++) {
      let wall;
      do {
        wall = {
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize)
        };
      } while (this.isOccupied(wall, snake1, snake2, walls));
      walls.push(wall);
    }
    return walls;
  }
}
