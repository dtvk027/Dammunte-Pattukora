export default class Background {
  constructor(ctx, imagePath, gameWidth, gameHeight, speed, scaleRatio) {
    this.ctx = ctx;
    this.image = new Image();
    this.image.src = imagePath;
    this.loaded = false;

    // Game dimensions (800x200)
    this.gameWidth = gameWidth; 
    this.gameHeight = gameHeight;
    this.speed = speed;
    this.scaleRatio = scaleRatio;

    // Positions for infinite scroll
    this.x = 0;
    this.x2 = gameWidth;

    this.image.onload = () => {
      this.loaded = true;
      // Calculate scaling to perfectly fit canvas height while maintaining aspect ratio
      this.scale = gameHeight / this.image.height; // 200/400 = 0.5
      this.renderWidth = this.image.width * this.scale; // 1600*0.5 = 800
      this.renderHeight = gameHeight; // 200
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
    if (!this.loaded) return;
    
    // Draw perfectly scaled background
    this.ctx.drawImage(
      this.image,
      0, 0, this.image.width, this.image.height, // Source dimensions (full image)
      this.x, 0, this.renderWidth, this.renderHeight // Canvas dimensions (scaled down)
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
