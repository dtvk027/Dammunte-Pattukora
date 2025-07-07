import Player from "./Player.js";
import Ground from "./Ground.js";
import CactiController from "./CactiController.js";
import Score from "./Score.js";
import Background from "./Background.js"; // <-- NEW IMPORT

// Canvas Setup
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Game Constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;
const PLAYER_WIDTH = 88 / 1.5;
const PLAYER_HEIGHT = 94 / 1.5;
const MAX_JUMP_HEIGHT = 190;
const MIN_JUMP_HEIGHT = 150;
const GROUND_WIDTH = 2400;
const GROUND_HEIGHT = 24;
const GROUND_AND_CACTUS_SPEED = 0.5;
const GAME_SPEED_START = 1.0;
const GAME_SPEED_INCREMENT = 0.00003; // much faster (feel free to tweak!)
const GAME_SPEED_MAX = 3.0;


const BACKGROUND_CONFIG = {
  image: "images/bg.png", // <-- Your background image path
  speed: 0.1 // Parallax speed
};

const CACTI_CONFIG = [
    { width: 65 / 1.5, height: 90 / 1.5, image: "images/cactus_1.png" },
    { width: 80 / 1.5, height: 84 / 1.5, image: "images/cactus_2.png" },
    { width: 70 / 1.5, height: 66 / 1.5, image: "images/cactus_3.png" },
];

// Game Variables
let player, ground, cactiController, score, background;
let scaleRatio;
let previousTime = null;
let gameSpeed = GAME_SPEED_START;
let waveTime = 0;
let gameOver = false;
let waitingToStart = true;
let hasAddedEventListenersForRestart = false;

// ===================
// Sprite Initialization
// ===================
function createSprites() {
    const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
    const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
    const minJumpHeightInGame = MIN_JUMP_HEIGHT * scaleRatio;
    const maxJumpHeightInGame = MAX_JUMP_HEIGHT * scaleRatio;
    const groundWidthInGame = GROUND_WIDTH * scaleRatio;
    const groundHeightInGame = GROUND_HEIGHT * scaleRatio;

    background = new Background( // <-- NEW BACKGROUND INIT
        ctx,
        BACKGROUND_CONFIG.image,
        canvas.width,
        canvas.height,
        BACKGROUND_CONFIG.speed,
        scaleRatio
    );

    player = new Player(ctx, playerWidthInGame, playerHeightInGame, minJumpHeightInGame, maxJumpHeightInGame, scaleRatio);
    ground = new Ground(ctx, groundWidthInGame, groundHeightInGame, GROUND_AND_CACTUS_SPEED, scaleRatio);

    const cactiImages = CACTI_CONFIG.map(cactus => {
        const img = new Image();
        img.src = cactus.image;
        return {
            image: img,
            width: cactus.width * scaleRatio,
            height: cactus.height * scaleRatio,
        };
    });

    cactiController = new CactiController(ctx, cactiImages, scaleRatio, GROUND_AND_CACTUS_SPEED);
    score = new Score(ctx, scaleRatio);
}

// ===================
// Game Setup
// ===================
function setScreen() {
    scaleRatio = getScaleRatio();
    canvas.width = GAME_WIDTH * scaleRatio;
    canvas.height = GAME_HEIGHT * scaleRatio;
    createSprites();
}

function getScaleRatio() {
    const screenHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
    const screenWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);

    return screenWidth / screenHeight < GAME_WIDTH / GAME_HEIGHT
        ? screenWidth / GAME_WIDTH
        : screenHeight / GAME_HEIGHT;
}

// ===================
// Game Loop
// ===================
function gameLoop(currentTime) {
    if (!previousTime) {
        previousTime = currentTime;
        requestAnimationFrame(gameLoop);
        return;
    }

    const frameTimeDelta = currentTime - previousTime;
    previousTime = currentTime;

    clearScreen();

    if (!gameOver && !waitingToStart) {
        // First update score so we can use it to control speed
        score.update(frameTimeDelta);

        // Get current score
        const currentScore = score.getCurrentScore ? score.getCurrentScore() : 0;

        // Control speed based on score
        if (currentScore < 200) {
            gameSpeed = GAME_SPEED_START; // Stay at base speed
        } else {
            gameSpeed += GAME_SPEED_INCREMENT * frameTimeDelta; // Slowly ramp up
        }

        // Update game elements
        background.update(gameSpeed, frameTimeDelta);
        ground.update(gameSpeed, frameTimeDelta);
        cactiController.update(gameSpeed, frameTimeDelta);
        player.update(gameSpeed, frameTimeDelta);
    }

    if (!gameOver && cactiController.collideWith(player)) {
        gameOver = true;
        score.setHighScore();
        setupGameReset();
    }

    // Draw game elements
    background.draw();
    ground.draw();
    cactiController.draw();
    player.draw();

    if (gameOver) showGameOver();
    if (waitingToStart) showStartGameText();

    requestAnimationFrame(gameLoop);
}
// ===================
// Utility Functions
// ===================
function clearScreen() {
  // Dark green fallback (shows while background loads)
  ctx.fillStyle = "#0a1a0a";  // Deep jungle green
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function showStartGameText() {
    const fontSize = 40 * scaleRatio;
    ctx.font = `${fontSize}px Verdana`;
    ctx.fillStyle = "gray";
    const x = canvas.width / 14;
    const y = canvas.height / 2;
    ctx.fillText("Tap Screen or Press Space To Start", x, y);
}

function showGameOver() {
    const fontSize = 70 * scaleRatio;
    ctx.font = `${fontSize}px Verdana`;
    ctx.fillStyle = "gray";
    const x = canvas.width / 4.5;
    const y = canvas.height / 2;
    ctx.fillText("GAME OVER", x, y);
}

function setupGameReset() {
    if (!hasAddedEventListenersForRestart) {
        hasAddedEventListenersForRestart = true;
        setTimeout(() => {
            window.addEventListener("keyup", reset, { once: true });
            window.addEventListener("touchstart", reset, { once: true });
        }, 1000);
    }
}

function reset() {
    hasAddedEventListenersForRestart = false;
    gameOver = false;
    waitingToStart = false;
    ground.reset();
    cactiController.reset();
    score.reset();
    gameSpeed = GAME_SPEED_START;
}

// ===================
// Event Listeners
// ===================
window.addEventListener("resize", () => setTimeout(setScreen, 500));

if (screen.orientation) {
    screen.orientation.addEventListener("change", setScreen);
}

window.addEventListener("keyup", reset, { once: true });
window.addEventListener("touchstart", reset, { once: true });

// ===================
// Start Game
// ===================
setScreen();
requestAnimationFrame(gameLoop);

window.updateScoreDisplay = function (current, high) {
  const highScoreEl = document.getElementById("high-score");
  const currentScoreEl = document.getElementById("current-score");

  if (highScoreEl) highScoreEl.innerText = String(high).padStart(6, '0');
  if (currentScoreEl) currentScoreEl.innerText = String(current).padStart(6, '0');
};
