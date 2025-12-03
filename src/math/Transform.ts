import { Scale } from "./Scale";

export interface Point {
  x: number;
  y: number;
}

export class Transform {
  xScale: Scale;
  yScale: Scale;

  constructor(xScale: Scale, yScale: Scale) {
    this.xScale = xScale;
    this.yScale = yScale;
  }

  toPixels(x: number, y: number): Point {
    return {
      x: this.xScale.toPixels(x),
      y: this.yScale.toPixels(y),
    };
  }

  invert(pixelX: number, pixelY: number): Point {
    return {
      x: this.xScale.invert(pixelX),
      y: this.yScale.invert(pixelY),
    };
  }
}
