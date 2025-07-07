import Cactus from "./Cactus.js";

export default class CactiController {
  #ctx;
  #canvas;
  #cactiImages;
  #scaleRatio;
  #baseSpeed;

  #cacti = [];
  #minGap = 150; // in pixels, scaled
  #maxGap = 350;

  #distanceSinceLastCactus = 0;

  constructor(ctx, cactiImages, scaleRatio = 1, baseSpeed = 1) {
    this.#ctx = ctx;
    this.#canvas = ctx.canvas;
    this.#cactiImages = cactiImages;
    this.#scaleRatio = scaleRatio;
    this.#baseSpeed = baseSpeed;
  }

  #getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  #shouldSpawnGroup() {
    return Math.random() < 0.3; // 30% chance
  }

  #spawnCactus(xOffset = 0) {
    const index = this.#getRandomNumber(0, this.#cactiImages.length - 1);
    const image = this.#cactiImages[index];

    const x = this.#canvas.width + xOffset;
    const y = this.#canvas.height - image.height;

    const cactus = new Cactus(
      this.#ctx,
      x,
      y,
      image.width,
      image.height,
      image.image
    );

    this.#cacti.push(cactus);
  }

  #maybeSpawnCactus(gameSpeed) {
    const minGap = this.#minGap / gameSpeed * this.#scaleRatio;
    const maxGap = this.#maxGap / gameSpeed * this.#scaleRatio;

    if (this.#distanceSinceLastCactus >= this.#getRandomNumber(minGap, maxGap)) {
      if (this.#shouldSpawnGroup()) {
        const groupSize = this.#getRandomNumber(2, 3);
        const spacing = 20 * this.#scaleRatio;
        for (let i = 0; i < groupSize; i++) {
          this.#spawnCactus(i * (spacing + 30)); // 30 = avg cactus width
        }
      } else {
        this.#spawnCactus();
      }

      this.#distanceSinceLastCactus = 0;
    }
  }

  update(gameSpeed, frameTimeDelta) {
    const speed = this.#baseSpeed * gameSpeed;
    const distanceThisFrame = speed * frameTimeDelta;

    this.#distanceSinceLastCactus += distanceThisFrame;

    this.#maybeSpawnCactus(gameSpeed);

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
    this.#distanceSinceLastCactus = 0;
  }
}
