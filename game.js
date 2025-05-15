const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const retry = document.getElementById("retryBtn");

let dino, obstacles, score, highScore, speed, gravity, groundY, gameOver, frame, gameStarted, nightMode;

const obstacleTypes = [
  { type: "CACTUS_SMALL", width: 17, height: 35, yPos: 265, minGap: 120 },
  { type: "CACTUS_LARGE", width: 25, height: 50, yPos: 250, minGap: 120 },
  { type: "PTERODACTYL", width: 30, height: 20, yPos: [230, 200, 170], minGap: 150 } // Low, mid, high
];

function init() {
  dino = { x: 50, y: 265, w: 40, h: 35, vy: 0, jumping: false, ducking: false };
  obstacles = [];
  score = 0;
  highScore = +localStorage.getItem("highScore") || 0;
  speed = 5;
  gravity = 1.2;
  groundY = canvas.height - 35;
  gameOver = false;
  gameStarted = false;
  frame = 0;
  nightMode = false;
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
  if (e.code === "Space" && !dino.jumping && gameStarted) {
    dino.vy = -10; // Tight jump for Dino Game
    dino.jumping = true;
    dino.ducking = false;
    dino.h = 35;
    dino.y = groundY - dino.h;
  }
  if (e.code === "ArrowDown" && !dino.jumping && gameStarted) {
    dino.ducking = true;
    dino.h = 17.5;
    dino.y = groundY - dino.h;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowDown" && gameStarted) {
    dino.ducking = false;
    dino.h = 35;
    dino.y = groundY - dino.h;
  }
});

// Spawn obstacles
function spawn() {
  if (gameOver || !gameStarted) return;
  let type;
  if (score < 400) {
    // Only cacti before 400 points
    type = Math.random() < 0.5 ? obstacleTypes[0] : obstacleTypes[1];
  } else {
    // Cacti and pterodactyls after 400 points
    let rand = Math.random();
    type = rand < 0.4 ? obstacleTypes[0] : rand < 0.8 ? obstacleTypes[1] : obstacleTypes[2];
  }
  let y = type.type === "PTERODACTYL" ? type.yPos[Math.floor(Math.random() * 3)] : type.yPos;
  obstacles.push({ x: canvas.width, y, w: type.width, h: type.height, type: type.type, minGap: type.minGap });
  console.log(`Spawned ${type.type} at x: ${canvas.width}, y: ${y}`); // Debug spawn
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

  // Day/night background
  nightMode = Math.floor(score / 700) % 2 === 1;
  ctx.fillStyle = nightMode ? "#000" : "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw ground
  ctx.fillStyle = nightMode ? "#555" : "#ccc";
  ctx.fillRect(0, groundY, canvas.width, 10);

  // Increase speed every 500 frames
  if (frame % 500 === 0) speed += 0.2;

  // Score
  if (frame % 10 === 0) score = Math.min(score + 1, 99999);
  ctx.fillStyle = nightMode ? "#fff" : "#000";
  ctx.font = "20px monospace";
  ctx.fillText("Score: " + score, 650, 30);
  ctx.fillText("High: " + highScore, 650, 60);

  // Dino (black/white based on night mode)
  dino.y += dino.vy;
  dino.vy += gravity;
  if (dino.y > groundY - dino.h) {
    dino.y = groundY - dino.h;
    dino.vy = 0;
    dino.jumping = false;
  }
  console.log("Dino y:", dino.y, "jumping:", dino.jumping, "ducking:", dino.ducking); // Debug dino
  ctx.fillStyle = nightMode ? "#fff" : "#000";
  ctx.fillRect(dino.x, dino.y, dino.w, dino.h);

  // Obstacles
  if (frame % 100 === 0 && obstacles.length < 3) {
    // Check for gap before spawning
    let lastObstacle = obstacles[obstacles.length - 1];
    if (!lastObstacle || lastObstacle.x < canvas.width - lastObstacle.minGap) {
      spawn();
    }
  }
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let o = obstacles[i];
    o.x -= speed;
    ctx.fillStyle = nightMode ? "#ccc" : "#555";
    if (o.type === "PTERODACTYL") {
      // Stylized pterodactyl (rectangle with "wings")
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillRect(o.x - 5, o.y + o.h / 2, 10, 5); // Left wing
      ctx.fillRect(o.x + o.w - 5, o.y + o.h / 2, 10, 5); // Right wing
    } else {
      ctx.fillRect(o.x, o.y, o.w, o.h); // Cactus
    }

    // Remove off-screen obstacles
    if (o.x + o.w < 0) {
      obstacles.splice(i, 1);
      continue;
    }

    // Collision
    if (checkCollision(dino, o)) {
      end("Obstacle");
      return;
    }
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
  ctx.fillStyle = nightMode ? "#fff" : "#000";
  ctx.font = "24px monospace";
  ctx.fillText(`💀 Game Over (${reason})`, 300, 150);
  retry.style.display = "block";
}

function restartGame() {
  init();
  gameStarted = true;
  loop();
}
