const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 300;

let gameState = 'start'; // 'start', 'playing', 'gameOver'
let lastKeyPress = 0; // Prevent rapid keypresses

const pushpa = {
    x: 50,
    y: canvas.height - 60,
    width: 40,
    height: 60,
    dy: 0,
    jumping: false,
    ducking: false,
    speed: 5,
};

const shekawat = {
    x: -50,
    y: canvas.height - 60,
    width: 40,
    height: 60,
    speed: 3,
};

let obstacles = [];
const obstacleTypes = [
    { type: 'ground', width: 20, height: 40, y: canvas.height - 40 },
    { type: 'air', width: 30, height: 20, y: canvas.height - 100 },
];

let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

const gravity = 0.5;
const jumpPower = -12;

function gameLoop() {
    if (gameState === 'playing') {
        updatePlaying();
        drawPlaying();
    } else if (gameState === 'start') {
        drawStart();
    } else if (gameState === 'gameOver') {
        updateGameOver();
        drawGameOver();
    }
    requestAnimationFrame(gameLoop);
}

function drawStart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    ctx.fillStyle = 'black';
    ctx.fillRect(pushpa.x, pushpa.y, pushpa.width, pushpa.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(shekawat.x, shekawat.y, shekawat.width, shekawat.height);
    document.getElementById('startMessage').classList.remove('hidden');
    document.getElementById('gameOverMessage').classList.add('hidden');
}

function updatePlaying() {
    pushpa.x += pushpa.speed;
    if (pushpa.jumping) {
        pushpa.dy += gravity;
        pushpa.y += pushpa.dy;
        if (pushpa.y >= canvas.height - 60) {
            pushpa.y = canvas.height - 60;
            pushpa.jumping = false;
            pushpa.dy = 0;
        }
    }
    pushpa.height = pushpa.ducking ? 30 : 60;

    shekawat.x += shekawat.speed;

    if (Math.random() < 0.02) {
        const type = Math.random() < 0.5 ? 'ground' : 'air';
        const obstacle = { ...obstacleTypes.find(t => t.type === type), x: canvas.width };
        obstacles.push(obstacle);
    }

    obstacles.forEach(obstacle => obstacle.x -= pushpa.speed);
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

    for (const obstacle of obstacles) {
        if (
            pushpa.x < obstacle.x + obstacle.width &&
            pushpa.x + pushpa.width > obstacle.x &&
            pushpa.y < obstacle.y + obstacle.height &&
            pushpa.y + pushpa.height > obstacle.y
        ) {
            gameState = 'gameOver';
            break;
        }
    }

    score += 1;
}

function drawPlaying() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    ctx.fillStyle = 'black';
    ctx.fillRect(pushpa.x, pushpa.y, pushpa.width, pushpa.height);
    ctx.fillStyle = 'gray';
    obstacles.forEach(obstacle => ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height));
    ctx.fillStyle = 'black';
    ctx.font = '20px monospace';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`High Score: ${highScore}`, 10, 60);
}

function updateGameOver() {
    if (shekawat.x < pushpa.x) {
        shekawat.x += shekawat.speed;
    } else {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }
        document.getElementById('gameOverMessage').classList.remove('hidden');
    }
}

function drawGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    ctx.fillStyle = 'black';
    ctx.fillRect(pushpa.x, pushpa.y, pushpa.width, pushpa.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(shekawat.x, shekawat.y, shekawat.width, shekawat.height);
    ctx.fillStyle = 'gray';
    obstacles.forEach(obstacle => ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height));
}

document.addEventListener('keydown', (e) => {
    const now = Date.now();
    if (now - lastKeyPress < 200) return; // Debounce keypresses
    lastKeyPress = now;

    if (e.code === 'Space') {
        console.log('Spacebar pressed, state:', gameState);
        if (gameState === 'start') {
            console.log('Starting game');
            gameState = 'playing';
            document.getElementById('startMessage').classList.add('hidden');
            resetGame();
        } else if (gameState === 'gameOver') {
            console.log('Restarting game');
            gameState = 'start';
            document.getElementById('gameOverMessage').classList.add('hidden');
        } else if (gameState === 'playing' && !pushpa.jumping) {
            console.log('Jumping');
            pushpa.dy = jumpPower;
            pushpa.jumping = true;
        }
    } else if (e.code === 'ArrowDown' && gameState === 'playing') {
        pushpa.ducking = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowDown' && gameState === 'playing') {
        pushpa.ducking = false;
    }
});

function resetGame() {
    console.log('Resetting game');
    pushpa.x = 50;
    pushpa.y = canvas.height - 60;
    pushpa.dy = 0;
    pushpa.jumping = false;
    pushpa.ducking = false;
    shekawat.x = -50;
    obstacles = [];
    score = 0;
}

// Start the game loop
gameLoop();
