class drawCanvas {
  canvas: HTMLCanvasElement | undefined;
  context: CanvasRenderingContext2D | undefined = undefined;
  ruleUnit: number = 15;
  ruleFrame: number = 4;
  ruleWidth: number = 10;
  shortPositionY: number = 20;
  longPositionY: number = 30;
  videoFrameRate: number = 23.976; 
  minRuleWidth: number = 0;
  isInit: boolean = false;

  constructor(canvas: HTMLCanvasElement | undefined, context: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.context = context;
  }

  isSatisfiedRepresntText = (x: number):boolean => {
    return x % this.ruleUnit === 0
  }

  setVideoFrameRate = (frameRate: number) => {
    this.videoFrameRate = frameRate;
  }

  setRuleUnit(ruleUnit: number) {
    this.ruleUnit = ruleUnit;
  }

  calculateRuleFrame(start: number, end: number) {
    const duration = end - start;
    const canvas = this.canvas;
    if (canvas) {

      for(let ruleFrame = 1; ruleFrame < duration; ruleFrame*=2) {
        const ruleCnt = duration / ruleFrame;
        const pixel = canvas.width / ruleCnt;
        if(pixel >= 5 && pixel <= 10) {
          this.ruleFrame = ruleFrame;
          this.ruleWidth = pixel;
          break;
        }
      }
    }
  }

  draw(start: number, end: number): void {
    const context = this.context;
    const canvas = this.canvas;
    const duration = end - start;
  
    if (context && canvas) {
      context.clearRect(0, 0, canvas?.width, canvas?.height);
    this.calculateRuleFrame(start, end)
    const ruleWidth = canvas.width / duration * this.ruleFrame;
    this.ruleWidth = ruleWidth;
    this.minRuleWidth = canvas.width / duration;
    const ruleCnt = canvas.width / ruleWidth;
    context.lineWidth = 0.5;

      for(let cnt = 0; cnt <= ruleCnt; cnt++) {
        const rulePositionX = ruleWidth * cnt; 
        const drawTextPositionX =  rulePositionX - 5;
        let linePositionY = this.shortPositionY;
        const drawRuleFrame = start + (this.ruleFrame * cnt);
  
        if (this.isSatisfiedRepresntText(cnt)) {
          linePositionY = this.longPositionY;
          context.fillText(String(drawRuleFrame), drawTextPositionX, 40);
        }

        context.strokeStyle = "#000000";
        context.beginPath();
        context.moveTo(rulePositionX-0.5, 0);
        context.lineTo(rulePositionX-0.5, linePositionY);
        context.stroke();
        context.closePath();
      }
    }
  }
 
}

export default drawCanvas;