import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';

/** A feather is one shared mesh: tapered tubular rachis/barbs plus a convex eye vane.
 * All vertices carry local coordinates and a part ID for one shared material.
 * No textures, billboards, random placement, or per-branch draw calls. */
export function createFeatherGeometry(detail: 'high' | 'low' = 'high'): BufferGeometry {
  const positions: number[] = [];
  const parts: number[] = [];
  const centers: number[] = [];
  const radii: number[] = [];
  const indices: number[] = [];
  const reference = new Vector3(0, 0, 1);
  const bend = (y: number) => 0.018 * y * y;

  function tube(points: Vector3[], radius: number, part: number, sides = 3) {
    const base = positions.length / 3;
    for (let i = 0; i < points.length; i++) {
      const tangent = points[Math.min(i + 1, points.length - 1)].clone()
        .sub(points[Math.max(0, i - 1)]).normalize();
      const normal = new Vector3().crossVectors(tangent, reference).normalize();
      const binormal = new Vector3().crossVectors(tangent, normal).normalize();
      const r = radius * (1 - 0.94 * i / (points.length - 1));
      for (let j = 0; j < sides; j++) {
        const a = j / sides * Math.PI * 2;
        const p = points[i].clone().addScaledVector(normal, Math.cos(a) * r)
          .addScaledVector(binormal, Math.sin(a) * r);
        positions.push(p.x, p.y, p.z);
        parts.push(part);
        centers.push(...points[i].toArray());
        radii.push(r);
      }
      if (i === 0) continue;
      for (let j = 0; j < sides; j++) {
        const a = base + (i - 1) * sides + j;
        const b = base + (i - 1) * sides + (j + 1) % sides;
        indices.push(a, b, a + sides, b, b + sides, a + sides);
      }
    }
  }

  tube(Array.from({ length: detail === 'high' ? 33 : 17 }, (_, i) => {
    const y = i / (detail === 'high' ? 32 : 16) * 4.88;
    return new Vector3(0, y, bend(y));
  }), 0.021, 1, 6);

  for (let i = 0; i < 112; i++) {
    const y = 0.48 + i / 111 * 4.12;
    const t = (y - 0.48) / 4.12;
    const width = (0.18 + 0.48 * Math.sin(Math.PI * t) ** 0.85)
      * (0.92 + 0.08 * Math.cos(i * 1.7));
    for (const side of [-1, 1]) {
      const points: Vector3[] = [];
      const segments = detail === 'high' ? 7 : 3;
      for (let j = 0; j <= segments; j++) {
        const u = j / segments;
        const x = side * width * Math.sin(u * Math.PI * 0.48);
        const py = y + (0.24 + 0.33 * t) * u + 0.16 * u ** 3;
        const z = bend(py) - 0.14 * u * u + 0.015 * Math.sin(i * 0.8) * u;
        points.push(new Vector3(x, py, z));
      }
      tube(points, 0.0068, 0);
      // Sparse forked tips break the silhouette and catch narrow specular accents.
      if (i % 3 === 0) {
        // Identical fork origins in both tessellation tiers prevent a silhouette pop.
        const u = 4 / 7;
        const py = y + (0.24 + 0.33 * t) * u + 0.16 * u ** 3;
        const start = new Vector3(side * width * Math.sin(u * Math.PI * 0.48), py,
          bend(py) - 0.14 * u * u + 0.015 * Math.sin(i * 0.8) * u);
        tube(Array.from({ length: 5 }, (_, j) => {
          const u = j / 4;
          return new Vector3(start.x + side * width * 0.32 * u,
            start.y + 0.45 * u, start.z + 0.06 * u - 0.09 * u * u);
        }), 0.004, 0);
      }
    }
  }

  // Curved teardrop eye vane: front/back shade correctly from any orbit angle.
  const base = positions.length / 3;
  const rows = detail === 'high' ? 32 : 16;
  const columns = detail === 'high' ? 20 : 12;
  for (let row = 0; row <= rows; row++) {
    const t = row / rows;
    const y = 2.8 + t * 1.78;
    const width = 0.54 * Math.sin(Math.PI * t) ** 0.72 * (1.12 - 0.28 * t);
    for (let col = 0; col <= columns; col++) {
      const u = col / columns * 2 - 1;
      const x = u * width;
      const z = bend(y) + 0.105 * Math.sin(Math.PI * t) * (1 - u * u);
      positions.push(x, y, z);
      parts.push(2);
      centers.push(x, y, z);
      radii.push(0);
      if (row < rows && col < columns) {
        const a = base + row * (columns + 1) + col;
        indices.push(a, a + 1, a + columns + 1, a + 1, a + columns + 2, a + columns + 1);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('center', new Float32BufferAttribute(centers, 3));
  geometry.setAttribute('radius', new Float32BufferAttribute(radii, 1));
  geometry.setAttribute('part', new Float32BufferAttribute(parts, 1));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
