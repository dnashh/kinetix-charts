export interface Point {
  x: number;
  y: number;
}

export function lttb(data: Point[], threshold: number): Point[] {
  const dataLength = data.length;
  if (threshold === 0) return [];
  if (threshold >= dataLength) {
    return data;
  }

  const sampled: Point[] = [];
  let sampledIndex = 0;

  // Bucket size. Leave room for start and end data points
  const every = (dataLength - 2) / (threshold - 2);

  let a = 0; // Initially a is the first point in the triangle
  let maxAreaPoint: Point;
  let maxArea: number;
  let area: number;
  let nextA: number;

  sampled[sampledIndex++] = data[a]; // Always add the first point

  for (let i = 0; i < threshold - 2; i++) {
    // Calculate point average for next bucket (containing c)
    let avgX = 0;
    let avgY = 0;
    let avgRangeStart = Math.floor((i + 1) * every) + 1;
    let avgRangeEnd = Math.floor((i + 2) * every) + 1;
    avgRangeEnd = avgRangeEnd < dataLength ? avgRangeEnd : dataLength;

    const avgRangeLength = avgRangeEnd - avgRangeStart;

    for (; avgRangeStart < avgRangeEnd; avgRangeStart++) {
      avgX += data[avgRangeStart].x;
      avgY += data[avgRangeStart].y;
    }

    avgX /= avgRangeLength;
    avgY /= avgRangeLength;

    // Get the range for this bucket
    let rangeOffs = Math.floor((i + 0) * every) + 1;
    const rangeTo = Math.floor((i + 1) * every) + 1;

    // Point a
    const pointAX = data[a].x;
    const pointAY = data[a].y;

    maxArea = -1;
    maxAreaPoint = data[rangeOffs]; // Default to first point in bucket
    nextA = rangeOffs; // Default next a

    for (; rangeOffs < rangeTo; rangeOffs++) {
      // Calculate triangle area over three buckets
      area = Math.abs(
        (pointAX - avgX) * (data[rangeOffs].y - pointAY) -
          (pointAX - data[rangeOffs].x) * (avgY - pointAY)
      );
      area *= 0.5;

      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = data[rangeOffs];
        nextA = rangeOffs; // Next a is this b
      }
    }

    sampled[sampledIndex++] = maxAreaPoint; // Pick this point from the bucket
    a = nextA; // This a is the next a (chosen b)
  }

  sampled[sampledIndex++] = data[dataLength - 1]; // Always add last

  return sampled;
}
