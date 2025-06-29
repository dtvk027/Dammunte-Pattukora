export default class Background {
  constructor(ctx, imagePath, gameWidth, gameHeight, speed, scaleRatio) {
    this.ctx = ctx;
    this.image = new Image();
    this.image.src = imagePath;
    this.loaded = false;

    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.speed = speed;
    this.scaleRatio = scaleRatio;

    // For infinite scrolling
    this.x = 0;
    this.x2 = gameWidth;

    this.image.onload = () => {
      console.log(`Background loaded: ${this.image.width}x${this.image.height}`);
      this.loaded = true;
      this.renderWidth = this.gameWidth;
      this.renderHeight = gameHeight;
    };

    this.image.onerror = () => {
      console.error("Failed to load background image!");
    };
  }

  update(gameSpeed, frameTimeDelta) {
    if (!this.loaded) return;
    
    const movement = gameSpeed * frameTimeDelta * this.speed * this.scaleRatio;
    this.x -= movement;
    this.x2 -= movement;
    
    if (this.x <= -this.renderWidth) this.x = this.renderWidth;
    if (this.x2 <= -this.renderWidth) this.x2 = this.renderWidth;
  }

  draw() {
    if (!this.loaded) {
      // Fallback - remove after debugging
      this.ctx.fillStyle = "rgba(255,0,0,0.5)";
      this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
      return;
    }
    
    this.ctx.drawImage(
      this.image,
      0, 0, this.image.width, this.image.height,
      this.x, 0, this.renderWidth, this.renderHeight
    );
    
    this.ctx.drawImage(
      this.image,
      0, 0, this.image.width, this.image.height,
      this.x2, 0, this.renderWidth, this.renderHeight
    );
  }

  reset() {
    this.x = 0;
    this.x2 = this.gameWidth;
  }
}
