// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 300;

document.body.style.background = 'url("forest_bg.png")';
document.body.style.backgroundSize = 'cover';
document.body.style.backgroundRepeat = 'no-repeat';
document.body.style.backgroundPosition = 'center top';
document.body.style.display = 'flex';
document.body.style.justifyContent = 'center';
document.body.style.alignItems = 'flex-start';
document.body.style.height = '100vh';
document.body.style.paddingTop = '40px';

const pushpa = new Image();
pushpa.src = 'pushpa.png';

const woodlogs = ['woodlog1.png', 'woodlog2.png'].map(src => {
    let img = new Image();
    img.src = src;
    return img;
});

let player = {
    x: 50, y: 220, width: 60, height: 70, vy: 0, jumping: false,
    frame: 0, frameTick: 0, spriteCols: 4, spriteWidth: 64, spriteHeight: 72
};

let obstacles = [];
let gravity = 2;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameOver = false;

function spawnObstacle() {
    const randomImg = woodlogs[Math.floor(Math.random() * woodlogs.length)];
    obstacles.push({ x: canvas.width, y: 230, width: 60, height: 60, img: randomImg });
}

function drawPlayer() {
    // Animate Pushpa running when on ground
    if (!player.jumping) {
        player.frameTick++;
        if (player.frameTick % 5 === 0) {
            player.frame = (player.frame + 1) % player.spriteCols;
        }
    } else {
        player.frame = 0;
    }

    ctx.drawImage(
        pushpa,
        player.frame * player.spriteWidth, 0,
        player.spriteWidth, player.spriteHeight,
        player.x, player.y,
        player.width, player.height
    );
}

function drawObstacles() {
    obstacles.forEach(ob => {
        ctx.drawImage(ob.img, ob.x, ob.y, ob.width, ob.height);
    });
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px monospace';
    ctx.fillText('Score: ' + score, canvas.width - 130, 30);
    ctx.fillText('High Score: ' + highScore, canvas.width - 180, 60);
}

function updateGame() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player.y += player.vy;
    player.vy += gravity;

    if (player.y > 220) {
        player.y = 220;
        player.jumping = false;
    }

    obstacles.forEach(ob => ob.x -= 6);
    obstacles = obstacles.filter(ob => ob.x + ob.width > 0);

    obstacles.forEach(ob => {
        if (
            player.x < ob.x + ob.width &&
            player.x + player.width > ob.x &&
            player.y < ob.y + ob.height &&
            player.y + player.height > ob.y
        ) {
            gameOver = true;
            document.getElementById('retryBtn').style.display = 'block';
            if (score > highScore) {
                localStorage.setItem('highScore', score);
            }
        }
    });

    drawPlayer();
    drawObstacles();
    drawScore();

    score++;

    if (score % 150 === 0) {
        spawnObstacle();
    }

    requestAnimationFrame(updateGame);
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !player.jumping) {
        player.vy = -25;
        player.jumping = true;
    }
});

document.getElementById('retryBtn').addEventListener('click', () => {
    player.y = 220;
    player.vy = 0;
    player.jumping = false;
    player.frame = 0;
    player.frameTick = 0;
    obstacles = [];
    score = 0;
    gameOver = false;
    document.getElementById('retryBtn').style.display = 'none';
    updateGame();
});

spawnObstacle();
updateGame();
