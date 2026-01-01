import { LegendLayer } from "../render/LegendLayer";
import { SceneGraph } from "./SceneGraph";
import { LinearScale, CategoricalScale, Scale } from "../math/Scale";
import { GridLayer } from "../render/GridLayer";
import { AxisLayer, AxisConfig } from "../render/AxisLayer";
import { Series } from "../render/Series";
import { LineSeries } from "../render/LineSeries";
import { BarSeries } from "../render/BarSeries";
import { PieSeries } from "../render/PieSeries";
import { ScatterSeries } from "../render/ScatterSeries";
import { Point } from "../math/Transform";
import { InteractionManager } from "./InteractionManager";
import { ChartConfig, SeriesConfig, BaseSeriesConfig } from "../types";

export class Chart {
  container: HTMLElement;
  wrapper: HTMLElement;
  sceneGraph: SceneGraph;
  gridLayer: GridLayer;
  axisLayer: AxisLayer;
  legendLayer: LegendLayer;
  series: Series[] = [];
  xScale: Scale;
  yScale: LinearScale;
  interactionManager: InteractionManager;
  tooltip: HTMLElement;

  /** Start Y axis from zero when all values are positive (default: true) */
  startFromZero: boolean = true;
  /** Start X axis from zero when all values are positive (default: false) */
  startXFromZero: boolean = false;

  padding = { top: 20, right: 20, bottom: 40, left: 60 };

  constructor(container: HTMLElement, config?: ChartConfig) {
    this.container = container;
    this.container.style.position = "relative"; // Ensure relative positioning for tooltip
    this.container.style.overflow = "hidden"; // Default, will change if scrollable

    // Create wrapper for scrolling content
    this.wrapper = document.createElement("div");
    this.wrapper.style.width = "100%";
    this.wrapper.style.height = "100%";
    this.container.appendChild(this.wrapper);

    this.sceneGraph = new SceneGraph(this.wrapper);

    // Initialize Scales with Padding
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.xScale = new LinearScale(
      [0, 100],
      [this.padding.left, width - this.padding.right]
    );
    // Y scale inverted (0 at bottom)
    this.yScale = new LinearScale(
      [0, 100],
      [height - this.padding.bottom, this.padding.top]
    );

    // Initialize Layers (attached to wrapper)
    this.gridLayer = new GridLayer(this.wrapper, 0);
    this.gridLayer.setScales(this.xScale, this.yScale);
    this.gridLayer.visible = false; // Hide grid by default

    this.axisLayer = new AxisLayer(this.wrapper, 50); // Higher z-index to render above series
    this.axisLayer.setScales(this.xScale, this.yScale);

    this.legendLayer = new LegendLayer(this.wrapper, 100);

    this.sceneGraph.addLayer(this.gridLayer);
    this.sceneGraph.addLayer(this.axisLayer);
    this.sceneGraph.addLayer(this.legendLayer);

    // Interaction
    this.interactionManager = new InteractionManager(this);

    // Tooltip
    this.tooltip = document.createElement("div");
    this.tooltip.style.position = "absolute";
    this.tooltip.style.display = "none";
    this.tooltip.style.pointerEvents = "none";
    this.tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
    this.tooltip.style.color = "white";
    this.tooltip.style.padding = "8px 12px";
    this.tooltip.style.borderRadius = "6px";
    this.tooltip.style.fontSize = "12px";
    this.tooltip.style.zIndex = "1000";
    this.tooltip.style.whiteSpace = "nowrap";
    this.tooltip.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    this.container.appendChild(this.tooltip);

    if (config) {
      this.update(config);
    }
    // No default series - just render empty chart
    this.sceneGraph.render();
  }

  colors: string[] = [
    "#ef4444", // Red
    "#f59e0b", // Amber
    "#10b981", // Green
    "#3b82f6", // Blue
    "#06b6d4", // Cyan
    "#ec4899", // Pink
    "#6366f1", // Indigo
  ];

  // Store initial extent for bounds
  maxExtent: { x: [number, number]; y: [number, number] } | null = null;

  update(config: ChartConfig) {
    // Add series from config
    if (config.series) {
      // Clear existing series only if new series are provided
      this.series = [];
      this.sceneGraph.layers = this.sceneGraph.layers.filter(
        (l) => !(l instanceof Series)
      );

      config.series.forEach((s) => {
        this.addSeries(s);
      });
    }

    // After setting data, calculate max extent
    // We need to iterate over all series to find global min/max
    let xMin = Infinity,
      xMax = -Infinity,
      yMin = Infinity,
      yMax = -Infinity;

    const stringXValues = new Set<string>();
    let hasStringX = false;

    const isStrictCategorical = config.xAxis?.type === "categorical";

    // Helper to check points - also tries to detect if string X can be numeric
    const checkPoints = (points: Point[]) => {
      points.forEach((p) => {
        let xVal = p.x;

        // Try to detect numeric strings (e.g. "123", "45.6")
        // Don't coerce if strictly categorical
        if (typeof xVal === "string" && !isStrictCategorical) {
          const parsed = parseFloat(xVal);
          if (!isNaN(parsed) && isFinite(parsed)) {
            // This looks like a number, treat it as numeric
            xVal = parsed;
            // Also update the point for consistent rendering
            (p as any).x = parsed;
          }
        }

        if (typeof xVal === "number") {
          if (isStrictCategorical) {
            xVal = String(xVal);
            (p as any).x = xVal;
            hasStringX = true;
            stringXValues.add(xVal);
          } else {
            if (xVal < xMin) xMin = xVal;
            if (xVal > xMax) xMax = xVal;
          }
        } else {
          hasStringX = true;
          stringXValues.add(String(p.x));
        }

        if (p.y < yMin) yMin = p.y;
        if (p.y > yMax) yMax = p.y;
        // Check y0 for stacked
        if ((p as any).y0 !== undefined) {
          if ((p as any).y0 < yMin) yMin = (p as any).y0;
          if ((p as any).y0 > yMax) yMax = (p as any).y0;
        }
      });
    };

    // We need to access the data from config or series
    this.series.forEach((s) => {
      checkPoints(s.data);
    });

    // Handle Categorical Scale
    if (hasStringX) {
      // Switch to CategoricalScale
      const domain = Array.from(stringXValues);
      // Re-initialize xScale as CategoricalScale
      const range = this.xScale.range;
      this.xScale = new CategoricalScale(domain, range);

      // Update all series with new scale
      this.series.forEach((s) => s.setScales(this.xScale, this.yScale));
      this.gridLayer.setScales(this.xScale, this.yScale);
      this.axisLayer.setScales(this.xScale, this.yScale);
    } else {
      // Ensure LinearScale (if we switched back from categorical, or just init)
      if (this.xScale instanceof CategoricalScale) {
        const range = this.xScale.range;
        this.xScale = new LinearScale([0, 100], range); // Temp domain

        this.series.forEach((s) => s.setScales(this.xScale, this.yScale));
        this.gridLayer.setScales(this.xScale, this.yScale);
        this.axisLayer.setScales(this.xScale, this.yScale);
      }
    }

    // SCROLLING LOGIC
    if (this.xScale instanceof CategoricalScale) {
      const minPointWidth = 40;
      const itemCount = this.xScale.domain.length;
      const shouldScroll = config.xAxis?.scrollable || itemCount > 20;

      if (shouldScroll) {
        this.container.style.overflowX = "auto";
        const requiredWidth = Math.max(
          this.container.clientWidth,
          itemCount * minPointWidth
        );
        this.wrapper.style.width = `${requiredWidth}px`;

        // Update scale range to match new width
        this.xScale.range = [
          this.padding.left,
          requiredWidth - this.padding.right,
        ];
      } else {
        this.container.style.overflowX = "hidden";
        this.wrapper.style.width = "100%";
        // Reset range to container width
        this.xScale.range = [
          this.padding.left,
          this.container.clientWidth - this.padding.right,
        ];
      }
    } else {
      this.container.style.overflowX = "hidden";
      this.wrapper.style.width = "100%";
    }

    if (xMin !== Infinity || hasStringX) {
      // Apply startXFromZero if enabled and all X values are positive
      if (this.startXFromZero && xMin > 0 && !hasStringX) {
        xMin = 0;
      }

      // Add 15% buffer
      const xRange = xMax - xMin;
      const yRange = yMax - yMin;
      const xBuffer = xRange * 0.15;
      const yBuffer = yRange * 0.15;

      this.maxExtent = {
        x: [xMin, xMax + xBuffer],
        y: [yMin - yBuffer, yMax + yBuffer],
      };

      // Check if we have any PieSeries
      const hasPieSeries = this.series.some((s) => s instanceof PieSeries);

      // Set initial domain to this extent (or config provided)
      if (!(this.xScale instanceof CategoricalScale)) {
        if (
          config.xAxis &&
          (config.xAxis.min !== undefined || config.xAxis.max !== undefined)
        ) {
          this.xScale.domain = [
            config.xAxis.min !== undefined
              ? config.xAxis.min
              : this.maxExtent.x[0],
            config.xAxis.max !== undefined
              ? config.xAxis.max
              : this.maxExtent.x[1],
          ];
        } else {
          this.xScale.domain = [...this.maxExtent.x];
        }
      }

      // Update Axis Config
      const defaultAxisVisible = !hasPieSeries;

      this.axisLayer.config = {
        ...this.axisLayer.config,
        visible: defaultAxisVisible,
        theme: config.theme || "light", // Pass theme
        ...config.xAxis,
      };

      if (config.xAxis && config.xAxis.visible !== undefined) {
        this.axisLayer.config.visible = config.xAxis.visible;
      }

      if (config.yAxis && config.yAxis.visible !== undefined) {
        this.axisLayer.config.visible = config.yAxis.visible;
      }

      // Update Legend
      this.legendLayer.setTheme(config.theme || "light");
      this.legendLayer.setSeries(this.series);

      // Force hide for PieSeries if it was implicitly visible
      if (hasPieSeries) {
        this.axisLayer.config.visible = false;
      }

      // Initial Y Scale
      this.updateYScale();
    }

    this.sceneGraph.render();
  }

  updateYScale() {
    // If categorical, we just use the full dataset for now as we don't support partial view yet
    if (this.xScale instanceof CategoricalScale) {
      // Recalculate full Y range
      let yMin = Infinity;
      let yMax = -Infinity;
      this.series.forEach((s) => {
        s.data.forEach((p) => {
          if (p.y < yMin) yMin = p.y;
          if (p.y > yMax) yMax = p.y;
        });
      });

      if (yMin !== Infinity) {
        // Check if any series has delta mode - if so, don't start from zero
        const hasDeltaMode = this.series.some(
          (s) => s instanceof BarSeries && (s as BarSeries).deltaMode
        );

        // Start from zero if all values are positive, startFromZero is enabled, and no delta mode
        if (this.startFromZero && yMin > 0 && !hasDeltaMode) {
          yMin = 0;
        }

        const yRange = yMax - yMin;
        const yBuffer =
          yRange * 0.15 || (yMax === 0 ? 1 : Math.abs(yMax) * 0.1);
        this.yScale.domain = [yMin, yMax + yBuffer];
      }
      return;
    }

    const [xMin, xMax] = this.xScale.domain;
    let yMin = Infinity;
    let yMax = -Infinity;

    // Check all series for data in current X range
    this.series.forEach((s) => {
      s.data.forEach((p) => {
        if (p.x >= xMin && p.x <= xMax) {
          if (p.y < yMin) yMin = p.y;
          if (p.y > yMax) yMax = p.y;
          if ((p as any).y0 !== undefined) {
            if ((p as any).y0 < yMin) yMin = (p as any).y0;
            if ((p as any).y0 > yMax) yMax = (p as any).y0;
          }
        }
      });
    });

    if (yMin === Infinity) {
      // Fallback to maxExtent if no data in view (shouldn't happen if x is constrained)
      if (this.maxExtent) {
        this.yScale.domain = [...this.maxExtent.y];
      }
      return;
    }

    // Check if any series has delta mode - if so, don't start from zero
    const hasDeltaMode = this.series.some(
      (s) => s instanceof BarSeries && (s as BarSeries).deltaMode
    );

    // Start from zero if all values are positive, startFromZero is enabled, and no delta mode
    if (this.startFromZero && yMin > 0 && !hasDeltaMode) {
      yMin = 0;
    }

    const yRange = yMax - yMin;
    const yBuffer = yRange * 0.15 || (yMax === 0 ? 1 : Math.abs(yMax) * 0.1);

    this.yScale.domain = [yMin, yMax + yBuffer];
  }

  addSeries(seriesOrConfig: Series | SeriesConfig) {
    let series: Series;

    if (seriesOrConfig instanceof Series) {
      series = seriesOrConfig;
    } else {
      const seriesConfig = seriesOrConfig;
      switch (seriesConfig.type) {
        case "line":
          series = new LineSeries(this.wrapper, 1);
          (series as LineSeries).setData(seriesConfig.data);
          break;
        case "bar":
          series = new BarSeries(this.wrapper, 1);
          (series as BarSeries).setData(seriesConfig.data);
          if (seriesConfig.barWidth) {
            (series as BarSeries).barWidth = seriesConfig.barWidth;
          }
          if (seriesConfig.deltaMode) {
            (series as BarSeries).deltaMode = seriesConfig.deltaMode;
          }
          if (seriesConfig.align) {
            (series as BarSeries).align = seriesConfig.align;
          }
          break;
        case "pie":
          series = new PieSeries(this.wrapper, 1);
          (series as PieSeries).setData(seriesConfig.data);
          if (seriesConfig.innerRadius) {
            (series as PieSeries).innerRadius = seriesConfig.innerRadius;
          }
          break;
        case "scatter":
          series = new ScatterSeries(this.wrapper, 1);
          (series as ScatterSeries).setData(seriesConfig.data);
          if (seriesConfig.radius) {
            (series as ScatterSeries).radius = seriesConfig.radius;
          }
          break;
        default:
          console.warn(`Unknown series type: ${(seriesConfig as any).type}`);
          return;
      }

      if (seriesConfig.color) {
        series.color = seriesConfig.color;
      }

      if (seriesConfig.name) {
        series.name = seriesConfig.name;
      }
    }

    if (!series.color) {
      // Auto-assign color
      series.color = this.colors[this.series.length % this.colors.length];
    }

    series.setScales(this.xScale, this.yScale);
    this.series.push(series);
    this.sceneGraph.addLayer(series);

    // Re-calculate extent and render
    let xMin = Infinity,
      xMax = -Infinity,
      yMin = Infinity,
      yMax = -Infinity;

    const stringXValues = new Set<string>();
    let hasStringX = false;

    // Check Config for strict categorical
    const isStrictCategorical = this.axisLayer.config.type === "categorical";

    const checkPoints = (points: Point[]) => {
      points.forEach((p) => {
        let xVal = p.x;

        // Don't coerce if strictly categorical
        if (typeof xVal === "string" && !isStrictCategorical) {
          const parsed = parseFloat(xVal);
          if (!isNaN(parsed) && isFinite(parsed)) {
            xVal = parsed;
            (p as any).x = parsed;
          }
        }

        if (typeof xVal === "number") {
          if (xVal < xMin) xMin = xVal;
          if (xVal > xMax) xMax = xVal;
        } else {
          hasStringX = true;
          stringXValues.add(String(p.x));
        }
        if (p.y < yMin) yMin = p.y;
        if (p.y > yMax) yMax = p.y;
        if ((p as any).y0 !== undefined) {
          if ((p as any).y0 < yMin) yMin = (p as any).y0;
          if ((p as any).y0 > yMax) yMax = (p as any).y0;
        }
      });
    };

    // Re-check all series
    this.series.forEach((s) => {
      checkPoints(s.data);
    });

    // Handle Categorical Scale - same logic as update()
    if (hasStringX) {
      const domain = Array.from(stringXValues);
      const range = this.xScale.range;
      this.xScale = new CategoricalScale(domain, range);

      // Update all series with new scale
      this.series.forEach((s) => s.setScales(this.xScale, this.yScale));
      this.gridLayer.setScales(this.xScale, this.yScale);
      this.axisLayer.setScales(this.xScale, this.yScale);
    } else if (this.xScale instanceof CategoricalScale) {
      // Switch back to LinearScale if no string X values
      const range = this.xScale.range;
      this.xScale = new LinearScale([0, 100], range);

      this.series.forEach((s) => s.setScales(this.xScale, this.yScale));
      this.gridLayer.setScales(this.xScale, this.yScale);
      this.axisLayer.setScales(this.xScale, this.yScale);
    }

    // SCROLLING LOGIC
    if (this.xScale instanceof CategoricalScale) {
      const minPointWidth = 40;
      const itemCount = this.xScale.domain.length;
      const shouldScroll = this.axisLayer.config.scrollable || itemCount > 20;

      if (shouldScroll) {
        this.container.style.overflowX = "auto";
        const requiredWidth = Math.max(
          this.container.clientWidth,
          itemCount * minPointWidth
        );
        this.wrapper.style.width = `${requiredWidth}px`;

        // Update scale range to match new width
        this.xScale.range = [
          this.padding.left,
          requiredWidth - this.padding.right,
        ];
      } else {
        this.container.style.overflowX = "hidden";
        this.wrapper.style.width = "100%";
        // Reset range to container width
        this.xScale.range = [
          this.padding.left,
          this.container.clientWidth - this.padding.right,
        ];
      }
    } else {
      this.container.style.overflowX = "hidden";
      this.wrapper.style.width = "100%";
    }

    if (xMin !== Infinity || hasStringX) {
      const xRange = xMax - xMin;
      const yRange = yMax - yMin;
      const xBuffer = xRange * 0.15;
      const yBuffer = yRange * 0.15;

      this.maxExtent = {
        x: [xMin - xBuffer, xMax + xBuffer],
        y: [yMin - yBuffer, yMax + yBuffer],
      };

      // Update domains if not locked (simplified logic for now)
      if (!hasStringX) {
        this.xScale.domain = [...this.maxExtent.x];
      }
      this.yScale.domain = [...this.maxExtent.y];
    }

    // Check if we have any PieSeries
    const hasPieSeries = this.series.some((s) => s instanceof PieSeries);

    // Force hide for PieSeries if it was implicitly visible
    if (hasPieSeries) {
      this.axisLayer.config.visible = false;
    }

    if (xMin !== Infinity || hasStringX) {
      // Initial Y Scale
      this.updateYScale();
    }

    this.sceneGraph.render();
  }

  pan(dx: number, _dy: number) {
    if (!this.maxExtent) return;

    // X Axis Pan
    if (this.xScale.type === "categorical") {
      // Categorical pan not implemented yet
      return;
    }

    const [xd0, xd1] = this.xScale.domain as [number, number];
    const xRange = xd1 - xd0;
    const xPixelRange = this.xScale.range[1] - this.xScale.range[0];
    const xDomainShift = -(dx / xPixelRange) * xRange;

    let newXd0 = xd0 + xDomainShift;
    let newXd1 = xd1 + xDomainShift;

    // Strict Clamp X
    const [xMax0, xMax1] = this.maxExtent.x;

    // Check if we are trying to pan out of bounds
    if (newXd0 < xMax0) {
      newXd0 = xMax0;
      newXd1 = newXd0 + xRange;
    }
    if (newXd1 > xMax1) {
      newXd1 = xMax1;
      newXd0 = newXd1 - xRange;
    }

    this.xScale.domain = [newXd0, newXd1];

    // Auto-scale Y based on new X
    this.updateYScale();

    this.sceneGraph.render();
  }

  zoom(factor: number, centerPixel: number) {
    if (!this.maxExtent) return;

    if (this.xScale.type === "categorical") {
      // Categorical zoom not implemented yet
      return;
    }

    const [d0, d1] = this.xScale.domain as [number, number];
    const range = d1 - d0;
    const [xMax0, xMax1] = this.maxExtent.x;
    const maxRange = xMax1 - xMax0;

    // Min/Max Zoom Limits
    // Min range: 1% of max extent
    // Max range: 100% of max extent (cannot zoom out further than buffer)
    let newRange = range * (1 / factor);

    if (newRange < maxRange * 0.01) newRange = maxRange * 0.01; // Too zoomed in
    if (newRange > maxRange) newRange = maxRange; // Too zoomed out

    const centerDomain = this.xScale.invert(centerPixel) as number;
    const centerRatio = (centerDomain - d0) / range;

    let newD0 = centerDomain - centerRatio * newRange;
    let newD1 = newD0 + newRange;

    // Strict Clamp to max extent
    if (this.xScale.type === "linear" || this.xScale.type === "time") {
      const [xMax0, xMax1] = this.maxExtent.x;
      if (newD0 < xMax0) {
        newD0 = xMax0;
        newD1 = newD0 + newRange;
      }
      if (newD1 > xMax1) {
        newD1 = xMax1;
        newD0 = newD1 - newRange;
      }
      this.xScale.domain = [newD0, newD1];
    } else {
      // For categorical, we don't really support zoom yet in this way, or we need different logic
      // Just ignore clamp for now or implement index based zoom
    }

    this.updateYScale();
    this.sceneGraph.render();
  }

  handleHover(x: number, y: number) {
    // Check if within chart area
    if (
      x < this.padding.left ||
      x > this.wrapper.clientWidth - this.padding.right ||
      y < this.padding.top ||
      y > this.container.clientHeight - this.padding.bottom
    ) {
      this.tooltip.style.display = "none";
      return;
    }

    // First, try to find ANY data point to get the X value
    let targetX: number | string | null = null;
    let isPieChart = false;
    const matchedData: { series: Series; point: Point }[] = [];

    // Check for pie chart first (special handling)
    for (const series of this.series) {
      if (series instanceof PieSeries) {
        isPieChart = true;
        const dataPoint = series.getDataAt({ x, y });
        if (dataPoint) {
          matchedData.push({ series, point: dataPoint });
        }
        break;
      }
    }

    // For non-pie charts, collect data from ALL series at the same X
    if (!isPieChart) {
      // First pass: find the X value from any hit series
      for (const series of this.series) {
        const dataPoint = series.getDataAt({ x, y });
        if (dataPoint) {
          targetX = dataPoint.x;
          break;
        }
      }

      // If no direct hit, try to find closest X from first series
      if (targetX === null && this.series.length > 0) {
        const firstSeries = this.series[0];
        const dataPoint = firstSeries.getDataAt({ x, y });
        if (dataPoint) {
          targetX = dataPoint.x;
        }
      }

      // Second pass: collect ALL series data at this X
      if (targetX !== null) {
        for (const series of this.series) {
          // Find data point with matching X value
          const point = series.data.find((p) => p.x === targetX);
          if (point) {
            matchedData.push({ series, point });
          }
        }
      }
    }

    if (matchedData.length === 0) {
      this.tooltip.style.display = "none";
      return;
    }

    // Helper to format X value
    const formatX = (val: number | string): string => {
      if (typeof val === "string") {
        return val;
      }
      // Use custom formatter if available
      if (this.axisLayer.config.xLabelFormat) {
        return this.axisLayer.config.xLabelFormat(val);
      }
      // Use datetime formatting if axis type is datetime
      if (this.axisLayer.config.type === "datetime") {
        return new Date(val).toLocaleString();
      }
      // Default numeric formatting
      const d = this.xScale.domain as [number, number];
      const xRange = d[1] - d[0];
      const xDecimals = xRange < 10 ? 2 : 0;
      return val.toFixed(xDecimals);
    };

    // Helper to format Y value
    const formatY = (val: number): string => {
      // Use custom formatter if available
      if (this.axisLayer.config.yLabelFormat) {
        return this.axisLayer.config.yLabelFormat(val);
      }
      // Smart formatting for large numbers (same as axis labels)
      const absVal = Math.abs(val);
      if (absVal >= 1000000) {
        return (val / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
      } else if (absVal >= 1000) {
        return (val / 1000).toFixed(1).replace(/\.0$/, "") + "K";
      } else if (absVal >= 1) {
        return val.toFixed(1).replace(/\.0$/, "");
      } else {
        return val.toFixed(2);
      }
    };

    // Build tooltip content
    let content = "";
    const firstPoint = matchedData[0].point;

    // Handle pie chart special case
    if ((firstPoint as any).label !== undefined) {
      content = `Label: ${(firstPoint as any).label}<br>Value: ${formatY(
        (firstPoint as any).value
      )}`;
    } else {
      // Show X value once at the top
      content = `<div style="margin-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 4px;"><strong>X:</strong> ${formatX(
        firstPoint.x
      )}</div>`;

      // Show each series with color indicator
      matchedData.forEach(({ series, point }) => {
        const colorBox = `<span style="display: inline-block; width: 10px; height: 10px; background: ${series.color}; margin-right: 6px; border-radius: 2px;"></span>`;
        content += `<div style="margin: 2px 0;">${colorBox}<strong>${
          series.name || "Series"
        }:</strong> ${formatY(point.y)}</div>`;
      });
    }

    this.tooltip.innerHTML = content;
    this.tooltip.style.display = "block";

    // Position tooltip - prefer right side, but flip to left if it would overflow
    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;

    // Measure tooltip size (must be visible to measure)
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width || 150; // fallback estimate
    const tooltipHeight = tooltipRect.height || 50;

    // Horizontal positioning: prefer right, flip to left if overflow
    let left = x + 15;
    if (left + tooltipWidth > containerWidth - 10) {
      left = x - tooltipWidth - 15;
    }
    // Ensure minimum left bound
    if (left < 10) left = 10;

    // Vertical positioning: prefer below, flip to above if overflow
    let top = y + 10;
    if (top + tooltipHeight > containerHeight - 10) {
      top = y - tooltipHeight - 10;
    }
    // Ensure minimum top bound
    if (top < 10) top = 10;

    this.tooltip.style.left = `${left}px`;
    this.tooltip.style.top = `${top}px`;
  }

  // API for Control Panel

  setSeriesVisibility(index: number, visible: boolean) {
    if (this.series[index]) {
      this.series[index].visible = visible;
      this.updateYScale();
      this.sceneGraph.render();
    }
  }

  toggleSeries(index: number) {
    if (this.series[index]) {
      this.setSeriesVisibility(index, !this.series[index].visible);
    }
  }

  getSeriesInfo() {
    return this.series.map((s, i) => ({
      index: i,
      name: s.name,
      color: s.color,
      visible: s.visible,
      type: s.constructor.name.replace("Series", "").toLowerCase(),
    }));
  }

  updateAxis(
    xAxisConfig?: Partial<AxisConfig>,
    _yAxisConfig?: Partial<AxisConfig>
  ) {
    if (xAxisConfig) {
      const current = this.axisLayer.config;
      this.axisLayer.config = { ...current, ...xAxisConfig };

      if (xAxisConfig.visible !== undefined) {
        this.axisLayer.config.visible = xAxisConfig.visible;
      }
    }
    // Note: yAxis config usually shares same AxisLayer config for style,
    // but if we had separate logic we would handle it.
    // Current AxisLayer shares style for both.

    this.sceneGraph.render();
  }

  setGridVisible(visible: boolean) {
    this.gridLayer.visible = visible;
    this.sceneGraph.render();
  }

  setTheme(theme: "light" | "dark") {
    this.axisLayer.config.theme = theme;
    this.legendLayer.setTheme(theme);
    this.sceneGraph.render();
  }

  updateSeries(index: number, config: Partial<BaseSeriesConfig>) {
    const series = this.series[index];
    if (!series) return;

    if (config.color) series.color = config.color;
    if (config.name) series.name = config.name;
    if (config.visible !== undefined) series.visible = config.visible;

    this.sceneGraph.render();
  }

  /**
   * Generates a data URL for the chart content.
   * @param scale Scale factor for high resolution (default 1, or 2 for retina)
   */
  /**
   * Generates a data URL for the chart content.
   * @param options Options for export (scale, width, height, view)
   */
  getCanvasImage(
    options: {
      scale?: number;
      width?: number;
      height?: number;
      view?: { x: number; y: number; width: number; height: number }; // Custom view window in data coordinates (if supported)
      // Simplified: Just use scale/width/height for now, implementing true data-window pan/zoom requires modifying scales.
      // Let's implement full state save/restore.
    } = {}
  ): string {
    const scale = options.scale || 2;
    const targetWidth = options.width || this.wrapper.clientWidth;
    const targetHeight = options.height || this.wrapper.clientHeight;

    // 1. SAVE STATE
    const originalWidth = this.wrapper.style.width;
    const originalHeight = this.wrapper.style.height;
    const originalXDomain = [...this.xScale.domain];
    const originalYDomain = [...this.yScale.domain];
    const originalOverflow = this.container.style.overflow;

    try {
      // 2. APPLY TARGET DIMENSIONS
      // We force write the wrapper style to target px.
      // Note: using 'px' explicitly.
      this.wrapper.style.width = `${targetWidth}px`;
      this.wrapper.style.height = `${targetHeight}px`;
      // Hide overflow during capture to prevent scrollbars affecting capture if we are resizing container
      this.container.style.overflow = "hidden";

      // 3. APPLY VIEW / ZOOM (Optional)
      if (options.view) {
        const isScrollableCategorical =
          this.xScale instanceof CategoricalScale &&
          this.container.style.overflowX === "auto";

        if (!isScrollableCategorical && (options as any).window) {
          const w = (options as any).window;
          if (w.xMin !== undefined && w.xMax !== undefined) {
            this.xScale.domain = [w.xMin, w.xMax];
          }
          if (w.yMin !== undefined && w.yMax !== undefined) {
            this.yScale.domain = [w.yMin, w.yMax];
          }
        }
      }

      // 4. REFIT & RENDER
      // We need to notify sceneGraph of new size
      this.sceneGraph.resize(targetWidth, targetHeight);

      // Trigger update to re-calculate layout/scales based on new size
      // We call updateYScale() to ensure Y axis looks right for the new X range if strictly categorical logic didn't override it.
      // BUT update() might reset xScale domain if we are not careful.
      // In Chart.update(), it recalculates maxExtent and sets domain IF config.min/max are set or uses maxExtent.
      // It DOES NOT preserve current interactive domain.
      // So if we just changed domain above, `update()` might reset it.
      // HOWEVER, `update()` is only called with `config`.
      // We just need to re-render, not re-ingest config.
      // `sceneGraph.render()` draws.
      // `gridLayer` and `axisLayer` need `resize()` called on them?
      // `SceneGraph.resize` calls `resize` on all layers.
      // So we just need to ensure scales are correct (updated range).

      this.xScale.range = [this.padding.left, targetWidth - this.padding.right];
      this.yScale.range = [
        targetHeight - this.padding.bottom,
        this.padding.top,
      ];

      // Re-update Y scale in case X-range changed (for auto-scaling Y)
      // But only if we didn't explicitly set Y scale in 'view'.
      if (!(options as any).window?.yMin) {
        this.updateYScale();
      }

      this.sceneGraph.render();

      // 5. CAPTURE
      // Create temp canvas
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = targetWidth * scale;
      tempCanvas.height = targetHeight * scale;
      const ctx = tempCanvas.getContext("2d");
      if (!ctx) return "";

      ctx.scale(scale, scale);

      // Draw background
      const isDark = this.axisLayer.config.theme === "dark";
      ctx.fillStyle = isDark ? "#111827" : "#ffffff";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Draw visible layers
      const layers = [...this.sceneGraph.layers].sort(
        (a, b) => a.zIndex - b.zIndex
      );

      layers.forEach((layer) => {
        if (layer.visible && layer.canvas) {
          ctx.drawImage(layer.canvas, 0, 0, targetWidth, targetHeight);
        }
      });

      return tempCanvas.toDataURL("image/png");
    } finally {
      // 6. RESTORE STATE
      this.wrapper.style.width = originalWidth;
      this.wrapper.style.height = originalHeight;
      this.container.style.overflow = originalOverflow;

      // Restore scales
      this.xScale.domain = originalXDomain as [number, number] | string[];
      this.yScale.domain = originalYDomain as [number, number];

      // Restore dimensions (read from container for default behavior)
      // If wrapper was auto-sized, this might be tricky.
      // If strict categorical scrolling was on, `update` logic handles it.
      // We should just call `update`?
      // Or manually reset ranges.

      // Best is to just call render if we assume container size didn't change (we modified wrapper style)
      // BUT wrapper style is what matters.
      // We restored wrapper style.
      // Now we need to resize sceneGraph back.
      const currentWidth = this.wrapper.clientWidth; // Should be back to original
      const currentHeight = this.wrapper.clientHeight;

      this.sceneGraph.resize(currentWidth, currentHeight);

      // Reset ranges
      if (this.xScale instanceof CategoricalScale) {
        // Scrolling logic might need to re-run
        // Let's manually trigger the scrolling resize logic by calling update with empty object?
        // Or better: Just re-calculate ranges manually.
        // If scrollable, range matches wrapper width.
        this.xScale.range = [
          this.padding.left,
          currentWidth - this.padding.right,
        ];
      } else {
        this.xScale.range = [
          this.padding.left,
          currentWidth - this.padding.right,
        ];
      }
      this.yScale.range = [
        currentHeight - this.padding.bottom,
        this.padding.top,
      ];

      // Re-render
      this.sceneGraph.render();
    }
  }

  downloadImage(
    filename: string = "chart.png",
    options?: {
      scale?: number;
      width?: number;
      height?: number;
      window?: { xMin: number; xMax: number; yMin?: number; yMax?: number };
    }
  ) {
    const dataUrl = this.getCanvasImage(options);
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
