import {
  Chart,
  LineSeries,
  BarSeries,
  PieSeries,
  ScatterSeries,
  stack,
} from "../src/index";
import { ChartConfig } from "../src/types";

// --- Data Generation Helpers ---
function generateData(count: number, step = 1, min = 10, max = 100) {
  const data = [];
  for (let i = 0; i <= count; i++) {
    data.push({ x: i * step, y: min + Math.random() * (max - min) });
  }
  return data;
}

function generateCategoricalData(count: number) {
  const data = [];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  for (let i = 0; i < count; i++) {
    data.push({
      x: months[i % months.length] + (Math.floor(i / 12) || ""),
      y: 10 + Math.random() * 90,
    });
  }
  return data;
}

function generateScatterData(count: number) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({ x: Math.random() * 100, y: Math.random() * 100 });
  }
  return data;
}

function generatePieData() {
  const labels = ["Direct", "Social", "Referral", "Organic"];
  return labels.map((l) => ({
    label: l,
    value: Math.floor(Math.random() * 100) + 10,
  }));
}

// --- Chart Creation Functions ---

let currentTheme: "light" | "dark" = "dark"; // Default to dark for "premium" look
const charts: Chart[] = [];

function registerChart(chart: Chart) {
  charts.push(chart);
  // Apply current theme
  chart.update({ theme: currentTheme });
  return chart;
}

function initLineChart(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  const chart = new Chart(container);

  // Clear default series
  chart.series = [];

  const series = new LineSeries(container, 1);
  series.setScales(chart.xScale, chart.yScale);
  series.color = "#6366f1"; // Indigo
  series.setData(generateData(50));

  chart.addSeries(series);

  // Configure Axes
  chart.update({
    xAxis: { xTickCount: 8, gridColor: "#334155", textColor: "#94a3b8" },
    yAxis: { yTickCount: 5, gridColor: "#334155", textColor: "#94a3b8" },
  });

  return registerChart(chart);
}

function initBarChart(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  const chart = new Chart(container);
  chart.series = [];

  const series = new BarSeries(container, 1);
  series.setScales(chart.xScale, chart.yScale);
  series.color = "#10b981"; // Emerald
  // Use categorical data
  series.setData(generateCategoricalData(8));

  chart.addSeries(series);

  chart.update({
    xAxis: { xTickCount: 8, gridColor: "#334155", textColor: "#94a3b8" },
    yAxis: { yTickCount: 5, gridColor: "#334155", textColor: "#94a3b8" },
  });

  return registerChart(chart);
}

function initPieChart(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  const chart = new Chart(container);
  chart.series = [];

  const series = new PieSeries(container, 1);
  series.setData(generatePieData());

  chart.addSeries(series);

  // Pie chart automatically hides axes based on our previous fix, but explicit is safer for demo
  chart.update({
    xAxis: { visible: false },
    yAxis: { visible: false },
  });

  return registerChart(chart);
}

function initScatterChart(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  const chart = new Chart(container);
  chart.series = [];

  const series = new ScatterSeries(container, 1);
  series.setScales(chart.xScale, chart.yScale);
  series.color = "#f59e0b"; // Amber
  series.radius = 5;
  series.setData(generateScatterData(50));

  chart.addSeries(series);

  chart.update({
    xAxis: { xTickCount: 5 },
    yAxis: { yTickCount: 5 },
  });

  return registerChart(chart);
}

function initStackedChart(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  const chart = new Chart(container);
  chart.series = [];

  const raw1 = generateData(10, 10, 0, 50);
  const raw2 = generateData(10, 10, 0, 50);
  const raw3 = generateData(10, 10, 0, 50);

  const stacked = stack([raw1, raw2, raw3]);
  const colors = ["#3b82f6", "#8b5cf6", "#ec4899"];

  stacked.forEach((data, i) => {
    const s = new BarSeries(container, 1);
    s.setScales(chart.xScale, chart.yScale);
    s.color = colors[i];
    s.setData(data);
    chart.addSeries(s);
  });

  chart.update({
    xAxis: { gridColor: "#334155", textColor: "#94a3b8" },
    yAxis: { gridColor: "#334155", textColor: "#94a3b8" },
  });

  return registerChart(chart);
}

// --- Playground Logic ---
let playgroundChart: Chart | null = null;

function initPlayground() {
  const container = document.getElementById("chart-playground");
  if (!container) return;

  playgroundChart = new Chart(container);
  registerChart(playgroundChart);
  updatePlaygroundChart();

  // Listeners
  document
    .getElementById("pg-type-select")
    ?.addEventListener("change", updatePlaygroundChart);
  document
    .getElementById("pg-update")
    ?.addEventListener("click", updatePlaygroundChart);
}

function updatePlaygroundChart() {
  if (!playgroundChart) return;

  const typeSelect = document.getElementById(
    "pg-type-select"
  ) as HTMLSelectElement;
  const type = typeSelect.value;

  const config: ChartConfig = {
    xAxis: { gridColor: "#334155", textColor: "#94a3b8" },
    yAxis: { gridColor: "#334155", textColor: "#94a3b8" },
    series: [],
    theme: currentTheme,
  };

  switch (type) {
    case "line":
      config.series = [
        {
          type: "line",
          data: generateData(100),
          color: "#6366f1",
        },
      ];
      break;
    case "bar":
      config.series = [
        {
          type: "bar",
          data: generateCategoricalData(12),
          color: "#10b981",
        },
      ];
      break;
    case "scatter":
      config.series = [
        {
          type: "scatter",
          data: generateScatterData(100),
          color: "#f59e0b",
          radius: 4,
        },
      ];
      break;
    case "stacked":
      config.series = [
        {
          type: "bar",
          data: generateData(10, 10),
          stacked: true,
          color: "#3b82f6",
        },
        {
          type: "bar",
          data: generateData(10, 10),
          stacked: true,
          color: "#ef4444",
        },
      ];
      break;
    case "pie":
      config.series = [
        {
          type: "pie",
          data: generatePieData(),
        },
      ];
      // Explicitly hide axes for pie chart in playground
      config.xAxis = { visible: false };
      config.yAxis = { visible: false };
      break;
  }

  playgroundChart.update(config);
}

// --- App Initialization ---

function initApp() {
  // Navigation
  const navItems = document.querySelectorAll(".nav-item");
  const views = document.querySelectorAll(".view");

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const target = (e.target as HTMLElement).closest(".nav-item");
      if (!target) return;

      const viewId = target.getAttribute("data-view");

      // Update Nav
      navItems.forEach((n) => n.classList.remove("active"));
      target.classList.add("active");

      // Update View
      views.forEach((v) => v.classList.remove("active"));
      document.getElementById(`view-${viewId}`)?.classList.add("active");

      // Trigger resize if needed (charts might need resize when becoming visible)
      window.dispatchEvent(new Event("resize"));
    });
  });

  // Init Charts
  initLineChart("chart-line");
  initBarChart("chart-bar");
  initPieChart("chart-pie");
  initScatterChart("chart-scatter");
  initStackedChart("chart-stacked");

  initPlayground();

  // Refresh Button
  document.getElementById("refresh-btn")?.addEventListener("click", () => {
    initLineChart("chart-line");
    initBarChart("chart-bar");
    initPieChart("chart-pie");
    initScatterChart("chart-scatter");
    initStackedChart("chart-stacked");
    updatePlaygroundChart();
  });

  // Theme Button
  document.getElementById("theme-btn")?.addEventListener("click", () => {
    currentTheme = currentTheme === "light" ? "dark" : "light";
    document.body.classList.toggle("light-theme", currentTheme === "light");

    // Update all charts
    charts.forEach((chart) => {
      chart.update({ theme: currentTheme });
    });
  });
}

// Start
initApp();
