export default class Background {
  constructor(ctx, imagePath, gameWidth, gameHeight, speed, scaleRatio) {
    this.ctx = ctx;
    this.image = new Image();
    this.image.src = imagePath;
    this.loaded = false;

    // Game dimensions
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.speed = speed;
    this.scaleRatio = scaleRatio;

    // Scrolling positions
    this.x = 0;
    this.x2 = gameWidth;

    this.image.onload = () => {
      console.log(`Image loaded: ${this.image.width}x${this.image.height}`);
      this.loaded = true;
      // Calculate dimensions to perfectly fit canvas height
      this.scale = gameHeight / this.image.height;
      this.renderWidth = this.image.width * this.scale;
      this.renderHeight = gameHeight;
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
      this.ctx.fillStyle = "rgba(10,26,10,0.5)";
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
