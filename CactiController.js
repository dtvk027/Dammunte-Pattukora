import Cactus from "./Cactus.js";

export default class CactiController {
  #ctx;
  #canvas;
  #cactiImages;
  #scaleRatio;
  #baseSpeed;

  #cacti = [];
  #nextSpawnDistance = 0;

  constructor(ctx, cactiImages, scaleRatio = 1, baseSpeed = 1) {
    this.#ctx = ctx;
    this.#canvas = ctx.canvas;
    this.#cactiImages = cactiImages;
    this.#scaleRatio = scaleRatio;
    this.#baseSpeed = baseSpeed;
    this.#setNextSpawnDistance(1);
  }

  #lastCactusType = null;

  // Choose a cactus image but prevent same type repeating too often
  #getRandomImage() {
    let index;
    let tries = 0;
    do {
      index = Math.floor(Math.random() * this.#cactiImages.length);
      tries++;
    } while (
      this.#cactiImages.length > 1 &&
      index === this.#lastCactusType &&
      tries < 5 // prevent infinite loop in case of very small list
    );

    this.#lastCactusType = index;
    return this.#cactiImages[index];
  }

  // Set the next spawn distance with more spacing randomness
  #setNextSpawnDistance(gameSpeed) {
    const minDistance = 400 * this.#scaleRatio;
    const maxDistance = 800 * this.#scaleRatio;
    const speedFactor = Math.max(1, gameSpeed);

    // Make it slightly vary with speed, but clamp within range
    const randomDistance = minDistance + Math.random() * (maxDistance - minDistance);
    this.#nextSpawnDistance = randomDistance / speedFactor;
  }

  // Check the distance from the last cactus to right edge
  #canSpawnNewCactus() {
    if (this.#cacti.length === 0) return true;

    const lastCactus = this.#cacti[this.#cacti.length - 1];
    const distanceFromLast = this.#canvas.width - (lastCactus.x + lastCactus.width);
    return distanceFromLast >= this.#nextSpawnDistance;
  }

  #spawnCactus(xOffset = 0) {
    const cactusImage = this.#getRandomImage();
    const x = this.#canvas.width + xOffset;
    const y = this.#canvas.height - cactusImage.height;

    const cactus = new Cactus(
      this.#ctx,
      x,
      y,
      cactusImage.width,
      cactusImage.height,
      cactusImage.image
    );

    this.#cacti.push(cactus);
  }

  update(gameSpeed, frameTimeDelta) {
    const speed = this.#baseSpeed * gameSpeed;

    if (this.#canSpawnNewCactus()) {
      this.#spawnCactus();
      this.#setNextSpawnDistance(gameSpeed);
    }

    this.#cacti.forEach((cactus) => {
      cactus.update(speed, gameSpeed, frameTimeDelta, this.#scaleRatio);
    });

    // Remove cacti that are off-screen
    this.#cacti = this.#cacti.filter((cactus) => cactus.x + cactus.width > 0);
  }

  draw() {
    this.#cacti.forEach((cactus) => cactus.draw());
  }

  collideWith(sprite) {
    return this.#cacti.some((cactus) => cactus.collideWith(sprite));
  }

  reset() {
    this.#cacti = [];
    this.#setNextSpawnDistance(1);
  }
}
