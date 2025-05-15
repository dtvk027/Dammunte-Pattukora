const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const retry = document.getElementById("retryBtn");

let pushpa, shekawat, obstacles, score, highScore, speed, gravity, groundY, gameOver, frame, gameStarted;

function init() {
  pushpa = { x: 50, y: 220, w: 40, h: 80, vy: 0, jumping: false, ducking: false };
  shekawat = { x: -50, y: 220, w: 40, h: 80 }; // Consistent with working Shekawat
  obstacles = [];
  score = 0;
  highScore = +localStorage.getItem("highScore") || 0;
  speed = 5;
  gravity = 0.8;
  groundY = canvas.height - 10;
  gameOver = false;
  gameStarted = false;
  frame = 0;
  retry.style.display = "none";
  ctx.fillStyle = "#000";
  ctx.font = "24px monospace";
  ctx.fillText("Press Space to Start", 300, 150);
}

init();

// Controls
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !gameStarted && !gameOver) {
    gameStarted = true;
    loop();
  }
  if (gameOver && e.code === "Space") {
    restartGame();
    return;
  }
  if (e.code === "Space" && !pushpa.jumping && gameStarted) {
    pushpa.vy = -14; // Reduced jump velocity for lower jump
    pushpa.jumping = true;
  }
  if (e.code === "ArrowDown" && !pushpa.jumping && gameStarted) {
    pushpa.ducking = true;
    pushpa.h = 40;
    pushpa.y = groundY - pushpa.h;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowDown" && gameStarted) {
    pushpa.ducking = false;
    pushpa.h = 80;
    pushpa.y = groundY - pushpa.h;
  }
});

// Spawn obstacles
function spawn() {
  if (gameOver || !gameStarted) return;
  let ow = pushpa.w / 2 + 5;
  let oh = pushpa.h / 2 + 10;
  let type = Math.random() < 0.5 ? "ground" : "air";
  let y = type === "ground" ? groundY - oh : groundY - oh - 100;
  obstacles.push({ x: canvas.width, y, w: ow, h: oh, type });
}

// Collision detection
function checkCollision(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// Game loop
function loop() {
  if (!gameStarted || gameOver) return;
  frame++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ground
  ctx.fillStyle = "#ccc";
  ctx.fillRect(0, groundY, canvas.width, 10);

  // Increase speed every 500 frames
  if (frame % 500 === 0) speed += 0.3;

  // Score
  if (frame % 10 === 0) score++;
  ctx.fillStyle = "#000";
  ctx.font = "20px monospace";
  ctx.fillText("Score: " + score, 650, 30);
  ctx.fillText("High: " + highScore, 650, 60);

  // Shekawat (red)
  if (shekawat.x < pushpa.x - 100) {
    shekawat.x += Math.min(speed * 0.8, 3); // Preserved working speed
  }
  console.log("Shekawat x:", shekawat.x); // Debug to confirm Shekawat movement
  ctx.fillStyle = "red";
  ctx.fillRect(shekawat.x, shekawat.y, shekawat.w, shekawat.h);

  // Pushpa (black)
  pushpa.y += pushpa.vy;
  pushpa.vy += gravity;
  if (pushpa.y > groundY - pushpa.h) {
    pushpa.y = groundY - pushpa.h;
    pushpa.vy = 0;
    pushpa.jumping = false;
  }
  ctx.fillStyle = "#000";
  ctx.fillRect(pushpa.x, pushpa.y, pushpa.w, pushpa.h);

  // Obstacles
  if (frame % 200 === 0) spawn();
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let o = obstacles[i];
    o.x -= speed;
    ctx.fillStyle = "#555";
    ctx.fillRect(o.x, o.y, o.w, o.h);

    // Remove off-screen obstacles
    if (o.x + o.w < 0) {
      obstacles.splice(i, 1);
      continue;
    }

    // Collision with obstacle
    if (checkCollision(pushpa, o)) {
      end("Obstacle");
      return;
    }
  }

  // Shekawat collision
  if (checkCollision(pushpa, shekawat)) {
    end("Shekawat");
    return;
  }

  requestAnimationFrame(loop);
}

function end(reason) {
  gameOver = true;
  gameStarted = false;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", score);
  }
  ctx.fillStyle = "#000";
  ctx.font = "24px monospace";
  ctx.fillText(`💀 Game Over (${reason})`, 300, 150);
  retry.style.display = "block";
}

function restartGame() {
  init();
  gameStarted = true;
  loop();
}
