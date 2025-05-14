const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const retryBtn = document.getElementById("retryBtn");

let pushpa, shekawat, obstacles, gravity, gameSpeed, score, highScore, gameOver, groundX;

function initGame() {
  pushpa = { x: 50, y: 250, width: 20, height: 40, vy: 0, jumping: false, ducking: false };
  shekawat = { x: 0, y: 260, width: 20, height: 40 };
  gravity = 1;
  obstacles = [];
  gameSpeed = 5;
  score = 0;
  gameOver = false;
  groundX = 0;
  highScore = localStorage.getItem("highScore") || 0;
  retryBtn.style.display = "none";
}

initGame();

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !pushpa.jumping && !pushpa.ducking && !gameOver) {
    pushpa.vy = -15;
    pushpa.jumping = true;
  }
  if (e.code === "ArrowDown" && !pushpa.jumping && !gameOver) {
    pushpa.ducking = true;
    pushpa.height = 20;
    pushpa.y = 270;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowDown") {
    pushpa.ducking = false;
    pushpa.height = 40;
    pushpa.y = 250;
  }
});

function spawnObstacle() {
  if (!gameOver) {
    let type = Math.random() < 0.5 ? "ground" : "hanging";
    let ob = {
      x: canvas.width,
      y: type === "ground" ? 270 : 180,
      width: 20,
      height: 30,
      type
    };
    obstacles.push(ob);
  }
}

setInterval(spawnObstacle, 1800);

function update() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Move ground
  groundX -= gameSpeed;
  if (groundX <= -canvas.width) groundX = 0;
  ctx.fillStyle = "#ccc";
  ctx.fillRect(groundX, 290, canvas.width, 10);
  ctx.fillRect(groundX + canvas.width, 290, canvas.width, 10);

  // Score
  score++;
  ctx.fillStyle = "#000";
  ctx.font = "20px monospace";
  ctx.fillText("Score: " + score, 650, 30);
  ctx.fillText("High: " + highScore, 650, 60);

  // Shekawat
  if (shekawat.x < 30) shekawat.x += 0.5;
  ctx.fillStyle = "red";
  ctx.fillRect(shekawat.x, shekawat.y, shekawat.width, shekawat.height);

  // Pushpa
  pushpa.y += pushpa.vy;
  pushpa.vy += gravity;
  if (pushpa.y > (pushpa.ducking ? 270 : 250)) {
    pushpa.y = pushpa.ducking ? 270 : 250;
    pushpa.vy = 0;
    pushpa.jumping = false;
  }
  ctx.fillStyle = "#000";
  ctx.fillRect(pushpa.x, pushpa.y, pushpa.width, pushpa.height);

  // Obstacles
  for (let i = 0; i < obstacles.length; i++) {
    let ob = obstacles[i];
    ob.x -= gameSpeed;
    ctx.fillRect(ob.x, ob.y, ob.width, ob.height);

    // Collision
    if (
      pushpa.x < ob.x + ob.width &&
      pushpa.x + pushpa.width > ob.x &&
      pushpa.y < ob.y + ob.height &&
      pushpa.y + pushpa.height > ob.y
    ) {
      endGame("Obstacle");
    }
  }

  // Shekawat collision with Pushpa
  if (
    shekawat.x + shekawat.width > pushpa.x &&
    shekawat.x < pushpa.x + pushpa.width &&
    shekawat.y < pushpa.y + pushpa.height &&
    shekawat.y + shekawat.height > pushpa.y
  ) {
    endGame("Shekawat");
  }

  requestAnimationFrame(update);
}

function endGame(reason) {
  gameOver = true;
  if (score > highScore) {
    localStorage.setItem("highScore", score);
  }
  ctx.fillStyle = "black";
  ctx.font = "24px monospace";
  ctx.fillText(`💀 Game Over (${reason})`, 300, 150);
  retryBtn.style.display = "inline-block";
}

function restartGame() {
  initGame();
  update();
}

update();
