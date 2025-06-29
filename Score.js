export default class Score {
  score = 0;
  HIGH_SCORE_KEY = "highScore";

  constructor(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
  }

  update(frameTimeDelta) {
    this.score += frameTimeDelta * 0.01;
    this.updateDOMScore(); // Sync every frame
  }

  reset() {
    this.score = 0;
    this.updateDOMScore(); // Reset DOM too
  }

  setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (this.score > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
      this.updateDOMScore(); // Also sync DOM
    }
  }

  updateDOMScore() {
    const current = Math.floor(this.score);
    const high = Number(localStorage.getItem(this.HIGH_SCORE_KEY)) || 0;

    if (typeof window !== "undefined" && window.updateScoreDisplay) {
      window.updateScoreDisplay(current, high);
    }
  }

  // ✅ New method for game speed logic
  getCurrentScore() {
    return Math.floor(this.score);
  }
}
