import { Scale } from "../math/Scale";

export interface Layout {
  width: number;
  height: number;
  xScale: Scale;
  yScale: Scale;
}

export interface ChartState {
  timestamp: number;
  // Add more state as needed (e.g., mouse position, selection)
}

export interface ChartComponent {
  id: string;
  zIndex: number;
  setup(ctx: CanvasRenderingContext2D, layout: Layout): void;
  draw(ctx: CanvasRenderingContext2D, state: ChartState): void;
}
