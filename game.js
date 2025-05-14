const canvas = document.getElementById("game");
const ctx    = canvas.getContext("2d");
const retry  = document.getElementById("retryBtn");

let pushpa, shekawat, obstacles, score, highScore, speed, gravity, groundY, gameOver, frame;

function init(){
  // Character sizes
  pushpa    = { x:50,  y:220, w:40, h:80, vy:0, jumping:false, ducking:false };
  shekawat  = { x:0,   y:220, w:40, h:80 };
  obstacles = [];
  score     = 0;
  highScore = +localStorage.getItem("highScore")||0;
  speed     = 5;
  gravity   = 1;
  groundY   = canvas.height - 10;
  gameOver  = false;
  frame     = 0;
  retry.style.display = "none";
}

init();

// Controls
document.addEventListener("keydown", e=>{
  if(gameOver) return;
  if(e.code==="Space" && !pushpa.jumping){
    pushpa.vy = -20;
    pushpa.jumping = true;
  }
  if(e.code==="ArrowDown" && !pushpa.jumping){
    pushpa.ducking=true;
    pushpa.h=40;
    pushpa.y=groundY - pushpa.h;
  }
});
document.addEventListener("keyup", e=>{
  if(e.code==="ArrowDown"){
    pushpa.ducking=false;
    pushpa.h=80;
    pushpa.y=groundY - pushpa.h;
  }
});

// Spawn obstacles
function spawn(){
  if(gameOver) return;
  // half size of character
  let ow = pushpa.w/2, oh = pushpa.h/2;
  let type = Math.random()<0.5?"ground":"air";
  let y = type==="ground"
        ? groundY - oh
        : groundY - oh - 100; 
  obstacles.push({ x:canvas.width, y, w:ow, h:oh, type });
}

// Game loop
function loop(){
  if(gameOver) return;
  frame++;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Move ground
  ctx.fillStyle="#ccc";
  let gx = -(frame*speed)%canvas.width;
  ctx.fillRect(gx, groundY, canvas.width, 10);
  ctx.fillRect(gx+canvas.width, groundY, canvas.width, 10);

  // Increase speed every 200 frames
  if(frame%200===0) speed += 0.5;

  // Score
  score++;
  ctx.fillStyle="#000";
  ctx.font="20px monospace";
  ctx.fillText("Score: "+score, 650,30);
  ctx.fillText("High: "+highScore,650,60);

  // Shekawat (red)
  if(shekawat.x< pushpa.x - 50) shekawat.x += 0.7;
  ctx.fillStyle="red";
  ctx.fillRect(shekawat.x, shekawat.y, shekawat.w, shekawat.h);

  // Pushpa (black)
  pushpa.y += pushpa.vy;
  pushpa.vy += gravity;
  if(pushpa.y > groundY - pushpa.h){
    pushpa.y = groundY - pushpa.h;
    pushpa.vy = 0;
    pushpa.jumping = false;
  }
  ctx.fillStyle="#000";
  ctx.fillRect(pushpa.x,pushpa.y,pushpa.w,pushpa.h);

  // Obstacles
  if(frame%120===0) spawn();
  for(let i=0;i<obstacles.length;i++){
    let o = obstacles[i];
    o.x -= speed;
    ctx.fillStyle="#555";
    ctx.fillRect(o.x,o.y,o.w,o.h);

    // Collision
    if(pushpa.x< o.x+o.w &&
       pushpa.x+pushpa.w>o.x &&
       pushpa.y< o.y+o.h &&
       pushpa.y+pushpa.h>o.y){
      end("Obstacle");
    }
  }

  // Shekawat collision
  if(shekawat.x+shekawat.w > pushpa.x &&
     shekawat.x < pushpa.x+pushpa.w){
    end("Shekawat");
  }

  requestAnimationFrame(loop);
}

function end(reason){
  gameOver = true;
  if(score>highScore){
    localStorage.setItem("highScore",score);
  }
  ctx.fillStyle="#000";
  ctx.font="24px monospace";
  ctx.fillText(`💀 Game Over (${reason})`,300,150);
  retry.style.display="block";
}

function restartGame(){
  init();
  loop();
}

loop();
