// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRAVITY = 1;
const JUMP_STRENGTH = 15;

let isJumping = false;
let score = 0;
let gameSpeed = 5;

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
function spawnObstacle() {
  obstacles.push(new Obstacle());
}
setInterval(spawnObstacle, 1500);

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function gameLoop() {
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
      alert('Game Over! Score: ' + score);
      document.location.reload();
    }
    if (obs.x + obs.width < 0) {
      obstacles.splice(index, 1);
      score++;
    }
  });

  // Score
  ctx.fillStyle = 'black';
  ctx.font = '20px monospace';
  ctx.fillText('Score: ' + score, 650, 30);

  requestAnimationFrame(gameLoop);
}

gameLoop();

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !isJumping) {
    isJumping = true;
    pushpa.yVelocity = JUMP_STRENGTH;
  }
});
