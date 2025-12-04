import { AxisConfig } from "./render/AxisLayer";
import { Point } from "./math/Transform";
import { PieData } from "./render/PieSeries";

export interface ChartConfig {
  /** Width of the chart (optional, defaults to container width) */
  width?: number;
  /** Height of the chart (optional, defaults to container height) */
  height?: number;
  /** Padding around the chart area */
  padding?: { top: number; right: number; bottom: number; left: number };
  /** X Axis configuration */
  xAxis?: AxisConfig;
  /** Y Axis configuration */
  yAxis?: AxisConfig;
  /** List of series to render */
  series?: SeriesConfig[];
  /** Theme of the chart */
  theme?: "light" | "dark";
}

export type SeriesConfig =
  | LineSeriesConfig
  | BarSeriesConfig
  | PieSeriesConfig
  | ScatterSeriesConfig;

export interface BaseSeriesConfig {
  type: string;
  color?: string;
  visible?: boolean;
  name?: string; // Series name for legend
}

export interface LineSeriesConfig extends BaseSeriesConfig {
  type: "line";
  data: Point[];
}

export interface BarSeriesConfig extends BaseSeriesConfig {
  type: "bar";
  data: Point[];
  barWidth?: number;
  stacked?: boolean; // Not used directly by series, but by chart to pre-process
}

export interface PieSeriesConfig extends BaseSeriesConfig {
  type: "pie";
  data: PieData[];
  innerRadius?: number;
}

export interface ScatterSeriesConfig extends BaseSeriesConfig {
  type: "scatter";
  data: Point[];
  radius?: number;
}
