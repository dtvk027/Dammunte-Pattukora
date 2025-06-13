import Player from "./Player.js";
import Ground from "./Ground.js";
import CactiController from "./CactiController.js";
import Score from "./Score.js";

// Constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;
const PLAYER_WIDTH = 58; // Pre-calculated 88/1.5
const PLAYER_HEIGHT = 62; // 94/1.5
const GROUND_WIDTH = 2400;
const GROUND_HEIGHT = 24;
const GAME_SPEED_START = 1;
const GAME_SPEED_INCREMENT = 0.00001;
const GROUND_AND_CACTUS_SPEED = 0.5;

// Game Setup
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let scaleRatio = null;

// Initialize game
setScreen();
window.addEventListener("resize", () => setTimeout(setScreen, 100));

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

// ... (Rest of your existing index.js code remains exactly the same)
