// Load images
const pushpaImg = new Image();
pushpaImg.src = 'pushpa.png';
pushpaImg.onload = () => console.log('Pushpa image loaded.');

const logSmallImg = new Image();
logSmallImg.src = 'woodlog1.png';
logSmallImg.onload = () => console.log('Small log image loaded.');

const logMediumImg = new Image();
logMediumImg.src = 'woodlog2.png';
logMediumImg.onload = () => console.log('Medium log image loaded.');
// Setup canvas
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
  gameSpeed = 5;
  isGameOver = false;
  retryBtn.style.display = 'none';
  pushpa.y = 200;
  spawnObstacle();
  gameLoop();
});

// Player (Pushpa)
const pushpa = {
  x: canvas.width / 4,
  y: 200,
  width: 40,
  height: 60,
  yVelocity: 0,
  draw() {
    ctx.drawImage(pushpaImg, this.x, this.y, this.width, this.height);
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

// Obstacle class (randomly picks small or medium log)
class Obstacle {
  constructor() {
    this.x = canvas.width;
    this.y = 240;

    // Randomly pick type
    if (Math.random() < 0.5) {
      this.width = 40;
      this.height = 40;
      this.image = logSmallImg;
    } else {
      this.width = 60;
      this.height = 50;
      this.image = logMediumImg;
    }
  }

  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  update() {
    this.x -= gameSpeed;
    this.draw();
  }
}

let obstacles = [];
let spawnTimeout;

function spawnObstacle() {
  if (isGameOver) return;

  obstacles.push(new Obstacle());

  // Gap logic scaled with game speed
  const baseSpeed = 5;
  const speedFactor = gameSpeed / baseSpeed;
  let gap;

  if (Math.random() < 0.6) {
    gap = (1300 + Math.random() * 200) / speedFactor;
  } else {
    gap = (1600 + Math.random() * 300) / speedFactor;
  }

  clearTimeout(spawnTimeout);
  spawnTimeout = setTimeout(spawnObstacle, gap);
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

  // Minimalist forest-like background
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

  if (gameSpeed < 12) {
    gameSpeed += 0.002;
  }

  // Score display
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
