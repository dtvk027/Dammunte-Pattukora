import Cactus from "./Cactus.js";

export default class CactiController {
  static CACTUS_INTERVAL_MIN = 500;
  static CACTUS_INTERVAL_MAX = 2000;

  #ctx;
  #canvas;
  #cactiImages;
  #scaleRatio;
  #baseSpeed;

  #nextCactusInterval = 0;
  #cacti = [];

  constructor(ctx, cactiImages, scaleRatio = 1, baseSpeed = 1) {
    this.#ctx = ctx;
    this.#canvas = ctx.canvas;
    this.#cactiImages = cactiImages;
    this.#scaleRatio = scaleRatio;
    this.#baseSpeed = baseSpeed;

    this.#setNextCactusTime();
  }

  #getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  #getDynamicInterval(gameSpeed) {
    const difficultyMultiplier = Math.min(gameSpeed, 3);
    const min = CactiController.CACTUS_INTERVAL_MIN / difficultyMultiplier;
    const max = CactiController.CACTUS_INTERVAL_MAX / difficultyMultiplier;

    return this.#getRandomNumber(min, max);
  }

  #setNextCactusTime(gameSpeed = 1) {
    this.#nextCactusInterval = this.#getDynamicInterval(gameSpeed);
  }

  #shouldSpawnGroup() {
    return Math.random() < 0.25; // 25% chance to spawn a group
  }

  #createCactus(xOffset = 0) {
    const index = this.#getRandomNumber(0, this.#cactiImages.length - 1);
    const cactusImage = this.#cactiImages[index];

    const x = this.#canvas.width * 1.5 + xOffset;
    const yOffset = this.#getRandomNumber(0, 10) * this.#scaleRatio;
    const y = this.#canvas.height - cactusImage.height - yOffset;

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

  #createCactusGroup() {
    const groupSize = this.#getRandomNumber(2, 3); // Groups are 2 or 3
    const spacing = 20 * this.#scaleRatio;

    for (let i = 0; i < groupSize; i++) {
      const xOffset = i * (60 + spacing); // Approx cactus width
      this.#createCactus(xOffset);
    }
  }

  update(gameSpeed, frameTimeDelta) {
    this.#nextCactusInterval -= frameTimeDelta;

    if (this.#nextCactusInterval <= 0) {
      if (this.#shouldSpawnGroup()) {
        this.#createCactusGroup();
      } else {
        this.#createCactus();
      }
      this.#setNextCactusTime(gameSpeed);
    }

    const speed = this.#baseSpeed * gameSpeed;

    this.#cacti.forEach((cactus) => {
      cactus.update(speed, gameSpeed, frameTimeDelta, this.#scaleRatio);
    });

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
    this.#setNextCactusTime();
  }
}
