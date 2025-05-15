const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRAVITY = 1;
const JUMP_STRENGTH = 15;

let isJumping = false;
let score = 0;
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
let gameSpeed = 5;
let isGameOver = false;

const retryBtn = document.getElementById('retryBtn');
retryBtn.addEventListener('click', () => {
  obstacles = [];
  score = 0;
  isGameOver = false;
  retryBtn.style.display = 'none';
  pushpa.y = 200;
  spawnObstacle(); // Start spawning again
  gameLoop();
});

const pushpa = {
  x: 50,
  y: 200,
  width: 40,
  height: 60,
  yVelocity: 0,
  draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  },
  update() {
    if (isJumping) {
      this.yVelocity -= GRAVITY;
      this.y -= this.yVelocity;
      if (this.y >= 200) {
        this.y = 200;
        this.yVelocity = 0;
        isJumping = false;
      }
    }
    this.draw();
  },
};

class Obstacle {
  constructor() {
    this.x = canvas.width;
    this.y = 240;
    this.width = 30 + Math.random() * 20;
    this.height = 40;
  }
  draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  update() {
    this.x -= gameSpeed;
    this.draw();
  }
}

let obstacles = [];
let spawnTimeout;

function spawnObstacle() {
  if (!isGameOver) {
    obstacles.push(new Obstacle());
    // Spawn next obstacle between 1.2 and 2 seconds later
    clearTimeout(spawnTimeout);
    spawnTimeout = setTimeout(spawnObstacle, 1200 + Math.random() * 800);
  }
}

// Start spawning first obstacle
spawnObstacle();

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function gameLoop() {
  if (isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background trees (minimalist)
  ctx.fillStyle = '#ccc';
  ctx.fillRect(0, 220, canvas.width, 5);
  for (let i = 0; i < canvas.width; i += 80) {
    ctx.fillRect(i, 160, 10, 60);
  }

  pushpa.update();

  obstacles.forEach((obs, index) => {
    obs.update();
    if (detectCollision(pushpa, obs)) {
      isGameOver = true;
      retryBtn.style.display = 'block';
      // Save high score on game over
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
      }
    }
    if (obs.x + obs.width < 0) {
      obstacles.splice(index, 1);
      score++;
    }
  });

  // Score display
  ctx.fillStyle = 'black';
  ctx.font = '20px monospace';
  ctx.fillText('Score: ' + score, 650, 30);
  ctx.fillText('High Score: ' + highScore, 650, 60);

  requestAnimationFrame(gameLoop);
}

gameLoop();

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !isJumping && !isGameOver) {
    isJumping = true;
    pushpa.yVelocity = JUMP_STRENGTH;
  }
});
