# Changelog

All notable changes to Kinetix Charts will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2024-12-19

### Added
- **Render Animations** - Smooth entry animations for all chart types: lines draw progressively, bars grow from baseline, pie slices sweep in, and scatter points fade in
- **Pie Chart Legend & Labels** - Built-in legend at bottom of pie charts with percentage labels on slices (>5%)
- **Donut Chart Support** - Enhanced donut rendering with proper arc segments (set `innerRadius: 0.5`)
- **Multi-Line Chart Demo** - New demo showcasing multiple overlapping line series
- **Start From Zero Options** - New `startFromZero` (Y-axis, default: true) and `startXFromZero` (X-axis, default: false) config options
- **X-Axis Number Detection** - Automatically detects numeric string values (e.g., "123") and treats them as numbers
- **Minimum Chart Height** - CSS enforces `min-height: 200px` for chart containers

### Fixed
- **Tooltip Positioning** - Tooltips now stay within chart bounds, positioning on left/right without shrinking
- **Multi-Series Tooltips** - Hover shows ALL series values at that X position (not just the hovered series)
- **Duplicate Series Removed** - Chart constructor no longer creates default series, fixing ghost series issue
- **Delta Mode Improved** - Delta mode now auto-disables `startFromZero` to zoom into data variations properly

### Changed
- Tooltip styling improved: darker background, box shadow, nowrap text
- Vite dev server now serves demo at root (`/` instead of `/demo/index.html`)

## [0.2.0] - 2024-12-06

### Added
- **Delta Mode for Bar Charts** - New `deltaMode: true` option to visualize small variations between values more prominently
- **Multi-series Tooltips** - Tooltips now show data from all series at hover position with color indicators
- **Tooltip Formatting** - Tooltips use axis label formatters (`xLabelFormat`/`yLabelFormat`) for consistent formatting
- **Datetime Tooltip Support** - Properly formatted datetime values in tooltips when axis type is `datetime`

### Fixed
- **Dark Mode Text Contrast** - Axis labels now properly use light text (`#f9fafb`) in dark mode
- **Legend Deduplication** - Prevents duplicate series entries in legend
- **Axis Layer Z-Index** - Axis layer now renders above chart series (z-index 50)

### Changed
- Improved axis text contrast colors for better readability in both themes
- Axis label backgrounds now semi-transparent (0.95 opacity) for better layering

## [0.1.0] - 2024-12-06

### Added
- **Smart Y-axis label formatting** - Automatic K/M formatting for large numbers (10K, 2.5M)
- **Comprehensive demo** - Rebuilt demo showcasing all chart types with interactive playground
- **Complete documentation** - Full API reference, theming guide, and examples in README

### Fixed
- **Categorical bar charts** - Fixed domain corruption causing bars to render as thin lines
- **Bar baseline calculation** - Bars now properly extend from 0 or Y-domain minimum
- **CategoricalScale protection** - Domain no longer corrupted by numeric extent updates

### Changed
- Y-axis auto-includes 0 for bar charts to ensure proper bar baselines
- Pan/zoom disabled for categorical X-axis charts (by design)
- Demo uses larger Y values (10K-50K) to showcase smart formatting

## [0.0.3] - 2024-12-03

### Added
- Initial public release
- Line, Bar, Scatter, Pie/Donut chart types
- Pan and zoom interactions
- LTTB downsampling for large datasets
- Light and dark themes
- Auto-generated legends
