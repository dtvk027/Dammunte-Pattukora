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
    
    // Positioning for infinite scroll
    this.x = 0;
    this.x2 = gameWidth; // Second image starts exactly after first
    
    // Set up image loading
    this.image.onload = () => {
      this.loaded = true;
      // Calculate dimensions to maintain aspect ratio
      this.aspectRatio = this.image.width / this.image.height;
      this.renderHeight = gameHeight;
      this.renderWidth = this.renderHeight * this.aspectRatio;
    };
  }

  update(gameSpeed, frameTimeDelta) {
    if (!this.loaded) return;
    
    const movement = gameSpeed * frameTimeDelta * this.speed * this.scaleRatio;
    this.x -= movement;
    this.x2 -= movement;
    
    // Reset positions when scrolled completely
    if (this.x <= -this.renderWidth) this.x = this.renderWidth;
    if (this.x2 <= -this.renderWidth) this.x2 = this.renderWidth;
  }

  draw() {
    if (!this.loaded) return;
    
    // Draw two copies side-by-side for seamless looping
    this.ctx.drawImage(
      this.image,
      this.x, 0, 
      this.renderWidth, this.renderHeight
    );
    
    this.ctx.drawImage(
      this.image,
      this.x2, 0,
      this.renderWidth, this.renderHeight
    );
  }

  reset() {
    this.x = 0;
    this.x2 = this.gameWidth;
  }
}
