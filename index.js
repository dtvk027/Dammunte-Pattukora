import Player from './Player.js';
import Ground from './Ground.js';
import CactiController from './CactiController.js';
import Score from './Score.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Game Constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;
const PLAYER_WIDTH = 58;
const PLAYER_HEIGHT = 62;
const GROUND_WIDTH = 2400;
const GROUND_HEIGHT = 24;
const GAME_SPEED_START = 1;
const GAME_SPEED_INCREMENT = 0.00001;
const GROUND_AND_CACTUS_SPEED = 0.5;

// Game Objects
let player = null;
let ground = null;
let cactiController = null;
let score = null;
let scaleRatio = null;
let previousTime = null;
let gameSpeed = GAME_SPEED_START;
let gameOver = false;
let waitingToStart = true;

// Initialize Game
function createSprites() {
  player = new Player(
    ctx,
    PLAYER_WIDTH * scaleRatio,
    PLAYER_HEIGHT * scaleRatio,
    GAME_HEIGHT * scaleRatio,
    scaleRatio
  );

  ground = new Ground(
    ctx,
    GROUND_WIDTH * scaleRatio,
    GROUND_HEIGHT * scaleRatio,
    GROUND_AND_CACTUS_SPEED,
    scaleRatio
  );

  cactiController = new CactiController(
    ctx,
    scaleRatio,
    GROUND_AND_CACTUS_SPEED
  );

  score = new Score(ctx, scaleRatio);
}

function setScreen() {
  scaleRatio = getScaleRatio();
  canvas.width = GAME_WIDTH * scaleRatio;
  canvas.height = GAME_HEIGHT * scaleRatio;
  createSprites();
}

function getScaleRatio() {
  const screenHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
  const screenWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
  return Math.min(screenWidth / GAME_WIDTH, screenHeight / GAME_HEIGHT);
}

// Game Loop
function gameLoop(currentTime) {
  if (previousTime === null) {
    previousTime = currentTime;
    requestAnimationFrame(gameLoop);
    return;
  }
  const frameTimeDelta = currentTime - previousTime;
  previousTime = currentTime;

  clearScreen();

  if (!gameOver && !waitingToStart) {
    ground.update(gameSpeed, frameTimeDelta);
    cactiController.update(gameSpeed, frameTimeDelta);
    player.update(gameSpeed, frameTimeDelta);
    score.update(frameTimeDelta);
    gameSpeed += frameTimeDelta * GAME_SPEED_INCREMENT;
  }

  ground.draw();
  cactiController.draw();
  player.draw();
  score.draw();

  if (cactiController.collideWith(player)) {
    gameOver = true;
    showGameOver();
    setupGameReset();
    score.setHighScore();
  }

  if (waitingToStart) {
    showStartGameText();
  }

  requestAnimationFrame(gameLoop);
}

function clearScreen() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function showGameOver() {
  const fontSize = 30 * scaleRatio;
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = 'red';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = 'white';
  ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 40 * scaleRatio);
}

function showStartGameText() {
  const fontSize = 20 * scaleRatio;
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText('Press SPACE or TOUCH to start', canvas.width / 2, canvas.height / 2);
}

function setupGameReset() {
  window.addEventListener('keyup', reset, { once: true });
  window.addEventListener('touchstart', reset, { once: true });
}

function reset() {
  gameOver = false;
  waitingToStart = false;
  ground.reset();
  cactiController.reset();
  score.reset();
  gameSpeed = GAME_SPEED_START;
}

// Event Listeners
window.addEventListener('resize', () => setTimeout(setScreen, 100));
window.addEventListener('keyup', reset, { once: true });
window.addEventListener('touchstart', reset, { once: true });

// Start Game
setScreen();
requestAnimationFrame(gameLoop);
