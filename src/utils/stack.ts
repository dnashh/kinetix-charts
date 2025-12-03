import { Point } from "../math/Transform";

export function stack(datasets: Point[][]): Point[][] {
  const stacked: Point[][] = [];
  const length = datasets[0].length;

  // Initialize stacked arrays
  for (let i = 0; i < datasets.length; i++) {
    stacked.push([]);
  }

  // Assuming all datasets have same length and x values
  for (let i = 0; i < length; i++) {
    let currentY = 0;
    for (let j = 0; j < datasets.length; j++) {
      const p = datasets[j][i];
      const y0 = currentY;
      const y1 = currentY + p.y;

      stacked[j].push({
        x: p.x,
        y: y1,
        y0: y0, // Add y0 property
      } as any);

      currentY = y1;
    }
  }

  return stacked;
}
