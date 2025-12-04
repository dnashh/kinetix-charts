# Kinetix Charts

High-performance, dependency-free charting library built with TypeScript and HTML5 Canvas.

## Features

- 🚀 **High Performance**: Built on HTML5 Canvas for rendering large datasets.
- 📦 **Dependency Free**: Zero external runtime dependencies.
- 📐 **Responsive**: Automatically adapts to container size.
- 📉 **Smart Downsampling**: Uses Largest-Triangle-Three-Buckets (LTTB) algorithm for efficient rendering of large time-series.
- 📊 **Multi-Chart Support**: Line, Bar, Stacked Bar, Pie, and Donut charts.
- 🏷️ **Legend**: Auto-generated legend with hover interaction.
- 🖱️ **Interactive**: Built-in Pan, Zoom, and Tooltips.
- 🎨 **Customizable**: Flexible styling options.

## Installation

```bash
npm install kinetix-charts
# or
bun add kinetix-charts
```

## Usage

### 1. Basic Setup

Create a container element with a defined width and height:

```html
<div id="chart" style="width: 800px; height: 400px;"></div>
```

Initialize the chart:

```javascript
import { Chart, LineSeries } from 'kinetix-charts';

const container = document.getElementById('chart');
const chart = new Chart(container);

// Clear default series if needed
chart.series = [];

// Create a Line Series
const series = new LineSeries(container, 1);
series.setScales(chart.xScale, chart.yScale);

// Set Data (Array of {x, y})
const data = [
  { x: 0, y: 10 },
  { x: 10, y: 20 },
  { x: 20, y: 15 },
  // ...
];
series.setData(data);

// Add to Chart
chart.addSeries(series);
```

### 2. Chart Types

#### Bar Chart

```javascript
import { BarSeries } from 'kinetix-charts';

const barSeries = new BarSeries(container, 1);
barSeries.setScales(chart.xScale, chart.yScale);
barSeries.color = "#10b981"; // Custom color

barSeries.setData([
  { x: "A", y: 30 }, // Supports categorical X if mapped to numbers
  { x: "B", y: 50 },
]);

chart.addSeries(barSeries);
```

#### Stacked Bar Chart

Use the `stack` utility to prepare data:

```javascript
import { BarSeries, stack } from 'kinetix-charts';

const rawData1 = [{ x: 0, y: 10 }, { x: 1, y: 20 }];
const rawData2 = [{ x: 0, y: 5 },  { x: 1, y: 15 }];

// Returns array of datasets with 'y0' property added
const stackedData = stack([rawData1, rawData2]);

const s1 = new BarSeries(container, 1);
s1.setScales(chart.xScale, chart.yScale);
s1.setData(stackedData[0]);
chart.addSeries(s1);

const s2 = new BarSeries(container, 1);
s2.setScales(chart.xScale, chart.yScale);
s2.setData(stackedData[1]);
chart.addSeries(s2);
```

#### Pie / Donut Chart

```javascript
import { PieSeries } from 'kinetix-charts';

const pieSeries = new PieSeries(container, 1);

// For Donut Chart, set innerRadius (0-1)
pieSeries.innerRadius = 0.6; 

pieSeries.setData([
  { label: "Category A", value: 30, color: "#ef4444" },
  { label: "Category B", value: 70, color: "#3b82f6" },
]);

chart.addSeries(pieSeries);
```

#### Scatter Plot

```javascript
import { ScatterSeries } from 'kinetix-charts';

const scatterSeries = new ScatterSeries(container, 1);
scatterSeries.setScales(chart.xScale, chart.yScale);
scatterSeries.color = "#f59e0b";
scatterSeries.radius = 5;

scatterSeries.setData([
  { x: 10, y: 20 },
  { x: 15, y: 35 },
  { x: 20, y: 10 },
]);

chart.addSeries(scatterSeries);
```

### 3. Interaction

Interactions are enabled by default:
- **Pan**: Click and drag to pan the X-axis. The Y-axis automatically scales to fit the data in the new view.
- **Zoom**: Scroll to zoom in/out on the X-axis.
- **Tooltip**: Hover over data points to see values.

### 4. Customization

#### Axis Customization

The axis supports persistent lines, text backgrounds, theming, and datetime formatting.

```javascript
chart.axisLayer.config = {
  visible: true,
  theme: 'dark', // 'light' or 'dark' - adapts text and background colors
  type: 'datetime', // 'numeric' or 'datetime' - formats labels accordingly
  xTickCount: 5,
  yTickCount: 5,
  // Custom formats override defaults
  // xLabelFormat: (val) => `Day ${val}`,
};
```

**Features:**
- **Persistent Lines**: X and Y axis lines are always visible.
- **Text Background**: Labels have a background to ensure readability.
- **Auto-Scaling**: Y-axis grows/shrinks based on the visible data range.
- **Precision**: Numeric labels are formatted to a maximum of 2 decimal places.

#### Legend

A legend is automatically generated based on the series names.
- **Position**: Defaults to top-right.
- **Interaction**: Hovering over the legend moves it to the top-left (or vice-versa) to prevent occlusion of data.
- **Customization**: Provide a `name` in the series config to label it in the legend.

```javascript
chart.addSeries({
  type: 'line',
  data: [...],
  name: 'Revenue 2024', // Shows in legend
  color: '#6366f1'
});
```


### 5. Configuration API (Declarative)

You can also use a declarative JSON configuration to setup or update the chart. This is useful for dynamic applications.

```javascript
const config = {
  width: 800, // Optional
  height: 400, // Optional
  padding: { top: 20, right: 20, bottom: 40, left: 60 },
  xAxis: { xTickCount: 10, xLabelFormat: (v) => `T${v}` },
  yAxis: { yTickCount: 5, yLabelFormat: (v) => `${v.toFixed(0)}` },
  series: [
    {
      type: 'line',
      data: [{x: 0, y: 10}, {x: 1, y: 20}],
      color: '#6366f1'
    },
    {
      type: 'bar',
      data: [{x: 2, y: 15}],
      color: '#10b981'
    }
  ]
};

// Initialize with config
const chart = new Chart(container, config);

// Or update existing chart
chart.update({
  series: [
    { type: 'pie', data: [{label: 'A', value: 30}, {label: 'B', value: 70}] }
  ]
});
```

## Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/dna_shh/kinetix-charts.git
   cd kinetix-charts
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Run tests**
   ```bash
   bun test
   ```

4. **Build**
   ```bash
   bun run build
   ```

5. **Run Demo**
   Open `demo/index.html` in your browser.

## License

MIT
