class UI {
  constructor() {
    this.elements = {
      startScreen: document.getElementById('start-screen'),
      gameScreen: document.getElementById('game-screen'),
      pauseScreen: document.getElementById('pause-screen'),
      gameoverScreen: document.getElementById('gameover-screen'),
      winnerScreen: document.getElementById('winner-screen'),
      leaderboardScreen: document.getElementById('leaderboard-screen'),
      score: document.getElementById('score'),
      level: document.getElementById('level'),
      scoreP2: document.getElementById('score-p2'),
      player2Hud: document.getElementById('player2-hud'),
      finalScore: document.getElementById('final-score'),
      finalLevel: document.getElementById('final-level'),
      winnerText: document.getElementById('winner-text'),
      leaderboardList: document.getElementById('leaderboard-list'),
      playerName: document.getElementById('player-name'),
      particlesContainer: document.getElementById('particles')
    };
    this.init();
    this.bindEvents();
  }

  init() {
    this.createParticles();
  }

  createParticles() {
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.width = (Math.random() * 5 + 2) + 'px';
      particle.style.height = particle.style.width;
      particle.style.animationDelay = Math.random() * 5 + 's';
      this.elements.particlesContainer.appendChild(particle);
    }
  }

  bindEvents() {
    document.getElementById('single-btn').addEventListener('click', () => this.startSingle());
    document.getElementById('multi-btn').addEventListener('click', () => this.startMulti());
    document.getElementById('leaderboard-btn').addEventListener('click', () => this.showLeaderboard());
    
    document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
    document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());
    document.getElementById('menu-btn').addEventListener('click', () => this.goToMenu());
    
    document.getElementById('save-btn').addEventListener('click', () => this.saveScore());
    document.getElementById('restart-btn').addEventListener('click', () => this.restart());
    document.getElementById('menu-btn-2').addEventListener('click', () => this.goToMenu());
    
    document.getElementById('restart-btn-2').addEventListener('click', () => this.restart());
    document.getElementById('menu-btn-3').addEventListener('click', () => this.goToMenu());
    
    document.getElementById('back-btn').addEventListener('click', () => this.goToMenu());

    document.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    document.querySelectorAll('.dpad-btn').forEach(btn => {
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        game.setDirection(1, btn.dataset.dir);
      });
      btn.addEventListener('click', () => {
        game.setDirection(1, btn.dataset.dir);
      });
    });
  }

  handleKeydown(e) {
    if (!game.gameOver && !game.paused) {
      switch(e.key) {
        case 'ArrowUp': game.setDirection(1, 'up'); break;
        case 'ArrowDown': game.setDirection(1, 'down'); break;
        case 'ArrowLeft': game.setDirection(1, 'left'); break;
        case 'ArrowRight': game.setDirection(1, 'right'); break;
        case 'w': case 'W': 
          if (game.mode === 'multi') game.setDirection(2, 'up'); 
          break;
        case 's': case 'S': 
          if (game.mode === 'multi') game.setDirection(2, 'down'); 
          break;
        case 'a': case 'A': 
          if (game.mode === 'multi') game.setDirection(2, 'left'); 
          break;
        case 'd': case 'D': 
          if (game.mode === 'multi') game.setDirection(2, 'right'); 
          break;
      }
    }
    
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      if (!game.gameOver) this.togglePause();
    }
  }

  showScreen(screen) {
    ['startScreen', 'gameScreen', 'pauseScreen', 'gameoverScreen', 'winnerScreen', 'leaderboardScreen'].forEach(s => {
      if (s !== screen) {
        this.elements[s].classList.add('hidden');
      }
    });
    this.elements[screen].classList.remove('hidden');
  }

  startSingle() {
    audio.init();
    audio.playButton();
    game.setMode('single');
    this.elements.player2Hud.style.display = 'none';
    this.showScreen('gameScreen');
    this.updateHud();
    game.start();
  }

  startMulti() {
    audio.init();
    audio.playButton();
    game.setMode('multi');
    this.elements.player2Hud.style.display = 'block';
    this.showScreen('gameScreen');
    this.updateHud();
    game.start();
  }

  togglePause() {
    audio.playButton();
    game.togglePause();
    if (game.paused) {
      this.elements.pauseScreen.classList.remove('hidden');
    } else {
      this.elements.pauseScreen.classList.add('hidden');
    }
  }

  showGameOver() {
    this.elements.finalScore.textContent = game.score1;
    this.elements.finalLevel.textContent = game.level;
    this.elements.playerName.value = '';
    this.elements.gameoverScreen.classList.remove('hidden');
  }

  showWinner(winner) {
    this.elements.winnerText.textContent = `JUGADOR ${winner} GANA!`;
    this.elements.winnerScreen.classList.remove('hidden');
  }

  async showLeaderboard() {
    audio.playButton();
    this.showScreen('leaderboardScreen');
    await this.loadLeaderboard();
  }

  goToMenu() {
    audio.playButton();
    game.reset();
    this.showScreen('startScreen');
    this.elements.pauseScreen.classList.add('hidden');
    this.elements.gameoverScreen.classList.add('hidden');
    this.elements.winnerScreen.classList.add('hidden');
  }

  restart() {
    audio.playButton();
    game.reset();
    this.elements.pauseScreen.classList.add('hidden');
    this.elements.gameoverScreen.classList.add('hidden');
    this.elements.winnerScreen.classList.add('hidden');
    this.updateHud();
    game.start();
  }

  updateHud() {
    this.elements.score.textContent = game.score1;
    this.elements.level.textContent = game.level;
    if (game.mode === 'multi') {
      this.elements.scoreP2.textContent = game.score2;
    }
  }

  async saveScore() {
    const name = this.elements.playerName.value.trim() || 'JUGADOR';
    audio.playButton();
    
    try {
      await fetch('/guardar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: name,
          puntaje: game.score1,
          nivel: game.level
        })
      });
      
      this.elements.playerName.value = 'GUARDADO!';
      this.elements.playerName.disabled = true;
    } catch (e) {
      console.error('Error al guardar', e);
    }
  }

  async loadLeaderboard() {
    try {
      const response = await fetch('/jugadores');
      const players = await response.json();
      
      if (players.length === 0) {
        this.elements.leaderboardList.innerHTML = '<p style="text-align: center; color: var(--text-gray);">No hay registros aún</p>';
        return;
      }
      
      this.elements.leaderboardList.innerHTML = players.map((player, index) => `
        <div class="leaderboard-item">
          <span class="leaderboard-rank">${index + 1}.</span>
          <span class="leaderboard-name">${player.nombre}</span>
          <span class="leaderboard-score">${player.puntaje} pts</span>
        </div>
      `).join('');
    } catch (e) {
      this.elements.leaderboardList.innerHTML = '<p style="text-align: center; color: var(--text-gray);">Error al cargar leaderboard</p>';
    }
  }
}

const ui = new UI();

setInterval(() => {
  if (!game.gameOver && !game.paused) {
    ui.updateHud();
  }
}, 100);
