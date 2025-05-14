const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let pushpa = { x: 50, y: 250, width: 20, height: 40, vy: 0, jumping: false, ducking: false };
let shekawat = { x: 0, y: 260, width: 20, height: 40 };
let gravity = 1;
let obstacles = [];
let gameSpeed = 5;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !pushpa.jumping && !pushpa.ducking) {
    pushpa.vy = -15;
    pushpa.jumping = true;
  }
  if (e.code === "ArrowDown" && !pushpa.jumping) {
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

setInterval(spawnObstacle, 1800);

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background trees
  ctx.strokeStyle = "#ccc";
  for (let i = 0; i < canvas.width; i += 100) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 300);
    ctx.stroke();
  }

  // Score + High Score
  score++;
  ctx.fillStyle = "#000";
  ctx.font = "20px monospace";
  ctx.fillText("Score: " + score, 650, 30);
  ctx.fillText("High: " + highScore, 650, 60);

  // Shekawat chasing
  if (shekawat.x < 30) {
    shekawat.x += 0.5;
  }
  ctx.fillStyle = "red";
  ctx.fillRect(shekawat.x, shekawat.y, shekawat.width, shekawat.height);
  ctx.fillStyle = "#000";

  // Update Pushpa
  pushpa.y += pushpa.vy;
  pushpa.vy += gravity;
  if (pushpa.y > (pushpa.ducking ? 270 : 250)) {
    pushpa.y = pushpa.ducking ? 270 : 250;
    pushpa.vy = 0;
    pushpa.jumping = false;
  }
  ctx.fillRect(pushpa.x, pushpa.y, pushpa.width, pushpa.height);

  // Update obstacles
  for (let i = 0; i < obstacles.length; i++) {
    let ob = obstacles[i];
    ob.x -= gameSpeed;
    ctx.fillRect(ob.x, ob.y, ob.width, ob.height);

    // Collision detection
    if (
      pushpa.x < ob.x + ob.width &&
      pushpa.x + pushpa.width > ob.x &&
      pushpa.y < ob.y + ob.height &&
      pushpa.y + pushpa.height > ob.y
    ) {
      if (score > highScore) {
        localStorage.setItem("highScore", score);
      }
      alert("Pushpa... Game Over!\nScore: " + score);
      window.location.reload();
    }
  }

  requestAnimationFrame(update);
}

update();
