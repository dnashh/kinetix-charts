import { Layer } from "./Layer";
import { Scale } from "../math/Scale";
import { Point } from "../math/Transform";

export abstract class Series extends Layer {
  xScale: Scale | null = null;
  yScale: Scale | null = null;
  data: Point[] = [];
  visibleData: Point[] = [];
  color?: string;

  setScales(xScale: Scale, yScale: Scale) {
    this.xScale = xScale;
    this.yScale = yScale;
  }

  setData(data: Point[]) {
    this.data = data;
    this.updateVisibleData();
  }

  abstract updateVisibleData(): void;

  // For tooltip hit testing
  abstract getDataAt(point: Point): Point | null;
}
