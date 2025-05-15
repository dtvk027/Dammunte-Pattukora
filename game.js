const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRAVITY = 1;
const JUMP_STRENGTH = 15;

let isJumping = false;
let score = 0;
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
let gameSpeed = 5; // initial speed
let isGameOver = false;

const retryBtn = document.getElementById('retryBtn');
retryBtn.addEventListener('click', () => {
  obstacles = [];
  score = 0;
  gameSpeed = 5;  // reset speed on retry
  isGameOver = false;
  retryBtn.style.display = 'none';
  pushpa.y = 200;
  spawnObstacle();
  gameLoop();
});

const pushpa = {
  x: canvas.width / 4,  // roughly center-left horizontally
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

    // Controlled random spacing for obstacles:
    // 60% chance medium gap (1.3 - 1.5 sec)
    // 40% chance far gap (1.8 - 2.2 sec)
    let gap;
    if (Math.random() < 0.6) {
      gap = 1300 + Math.random() * 200;
    } else {
      gap = 1800 + Math.random() * 400;
    }

    clearTimeout(spawnTimeout);
    spawnTimeout = setTimeout(spawnObstacle, gap);
  }
}

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

  // Background: forest feel (minimalist)
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

      // Save high score if beaten
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

  // Increase speed gradually, max 12
  if (gameSpeed < 12) {
    gameSpeed += 0.002;
  }

  // Display scores top right
  ctx.fillStyle = 'black';
  ctx.font = '22px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('Score: ' + score, canvas.width - 20, 40);
  ctx.fillText('High Score: ' + highScore, canvas.width - 20, 70);

  requestAnimationFrame(gameLoop);
}

gameLoop();

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !isJumping && !isGameOver) {
    isJumping = true;
    pushpa.yVelocity = JUMP_STRENGTH;
  }
});
