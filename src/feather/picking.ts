import { DoubleSide, InstancedMesh, Matrix4, MeshBasicMaterial, Raycaster, Vector3 } from 'three';
import { createFeatherGeometry } from './geometry';

/** Shared distance geometry, with the shader width baked in. Instance matrices are
 * copied from the rendered frame, including every interaction offset. Raycasting
 * first rejects instance spheres; only intersected feathers visit triangles.
 * Subpixel alpha-to-coverage widening is deliberately not a click target. */
export class FeatherPicker {
  private readonly geometry = createFeatherGeometry('low');
  private readonly material = new MeshBasicMaterial({ side: DoubleSide });
  private readonly mesh = new InstancedMesh(this.geometry, this.material, 240);
  private width = 1;
  private readonly matrix = new Matrix4();
  constructor() {
    // Pick the solid vane and rachis, not hundreds of translucent subpixel barbs.
    const indices = this.geometry.index!, part = this.geometry.getAttribute('part');
    const solid: number[] = [];
    for (let i=0;i<indices.count;i+=3) if (part.getX(indices.getX(i)) >= 1)
      solid.push(indices.getX(i),indices.getX(i+1),indices.getX(i+2));
    this.geometry.setIndex(solid); this.geometry.computeBoundingBox();
  }
  sync(source: InstancedMesh, width: number) {
    if (width !== this.width) {
      this.geometry.scale(width / this.width, 1, 1);
      this.width = width;
      this.geometry.computeBoundingSphere(); this.geometry.computeBoundingBox();
    }
    this.mesh.count = source.count;
    this.mesh.instanceMatrix.array.set(source.instanceMatrix.array);
    this.mesh.matrixWorld.copy(source.matrixWorld);
    this.mesh.boundingSphere = source.boundingSphere;
  }
  pick(ray: Raycaster) { return ray.intersectObject(this.mesh, false)[0] ?? null; }
  eye(source: InstancedMesh, id: number) {
    source.getMatrixAt(id, this.matrix);
    return new Vector3(0, 3.64, .018*3.64**2+.104)
      .applyMatrix4(this.matrix).applyMatrix4(source.matrixWorld);
  }
  dispose() { this.mesh.dispose(); this.geometry.dispose(); this.material.dispose(); }
}
