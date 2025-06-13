export default class Player {
  constructor(ctx, width, height, canvasHeight, scaleRatio) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.scaleRatio = scaleRatio;

    this.x = 10 * scaleRatio;
    this.y = canvasHeight - height - 1.5 * scaleRatio;
    this.yStandingPosition = this.y;

    this.velocityY = 0;
    this.jumpPressed = false;
    this.jumpInProgress = false;
    this.falling = false;

    // Animation
    this.image = new Image();
    this.image.src = 'images/dino_run1.png';
    this.runImages = [
      'images/dino_run1.png',
      'images/dino_run2.png'
    ].map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
    this.currentRunImage = 0;
    this.animationTimer = 0;
    this.ANIMATION_INTERVAL = 100;

    this.setupControls();
  }

  setupControls() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') this.jumpPressed = true;
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') this.jumpPressed = false;
    });
    window.addEventListener('touchstart', () => this.jumpPressed = true);
    window.addEventListener('touchend', () => this.jumpPressed = false);
  }

  update(gameSpeed, frameTimeDelta) {
    this.handleRunAnimation(gameSpeed, frameTimeDelta);
    this.handleJump(frameTimeDelta);
  }

  handleRunAnimation(gameSpeed, frameTimeDelta) {
    this.animationTimer += frameTimeDelta * gameSpeed;
    if (this.animationTimer >= this.ANIMATION_INTERVAL) {
      this.animationTimer = 0;
      this.currentRunImage = (this.currentRunImage + 1) % this.runImages.length;
      this.image = this.runImages[this.currentRunImage];
    }
  }

  handleJump(frameTimeDelta) {
    const GRAVITY = 0.4 * this.scaleRatio;
    const JUMP_FORCE = 12 * this.scaleRatio;

    if (this.jumpPressed && !this.jumpInProgress && !this.falling) {
      this.velocityY = -JUMP_FORCE;
      this.jumpInProgress = true;
    }

    this.y += this.velocityY;
    this.velocityY += GRAVITY;

    if (this.y >= this.yStandingPosition) {
      this.y = this.yStandingPosition;
      this.velocityY = 0;
      this.jumpInProgress = false;
      this.falling = false;
    } else {
      this.falling = true;
    }
  }

  draw() {
    this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}
