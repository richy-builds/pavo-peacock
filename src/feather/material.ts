import { DoubleSide, ShaderMaterial, Vector3 } from 'three';

export function createFeatherMaterial() {
  return new ShaderMaterial({
    side: DoubleSide,
    alphaToCoverage: true,
    uniforms: { uWidth: { value: 1 }, uPixelHeight: { value: 1350 }, uLight: { value: new Vector3(4, 7, 6) } },
    vertexShader: /* glsl */ `
      attribute float lifeHighlight;
      varying float vLife;
      attribute float part;
      attribute vec3 center;
      attribute float radius;
      uniform float uPixelHeight;
      uniform float uWidth;
      varying float vCoverage;
      varying vec3 vLocal;
      varying vec3 vWorld;
      varying vec3 vNormal;
      varying vec3 vAcross;
      varying vec3 vAlong;
      varying float vPart;
      void main() {
        vLife = lifeHighlight;
        vLocal = position;
        vPart = part;
        mat4 world = modelMatrix;
        #ifdef USE_INSTANCING
          world = modelMatrix * instanceMatrix;
        #endif
        vec3 shaped = position * vec3(uWidth, 1.0, 1.0);
        vec3 shapedCenter = center * vec3(uWidth, 1.0, 1.0);
        vec4 p = world * vec4(shaped, 1.0);
        float depth = max(0.1, -(viewMatrix * p).z);
        float pixelsPerUnit = projectionMatrix[1][1] * uPixelHeight * 0.5 / depth;
        float scale = length(world[0].xyz);
        float pixelRadius = radius * scale * pixelsPerUnit;
        float widen = part < 1.5 ? clamp(0.65 / max(pixelRadius, 0.001), 1.0, 8.0) : 1.0;
        p = world * vec4(shapedCenter + (shaped - shapedCenter) * widen, 1.0);
        vCoverage = part < 1.5 ? clamp(pixelRadius / 0.65, 0.0, 1.0) : 1.0;
        vWorld = p.xyz;
        // Instance scales are uniform; normalizing is sufficient here.
        vNormal = normalize(mat3(world) * (normal / vec3(uWidth, 1.0, 1.0)));
        vAcross = normalize(mat3(world) * vec3(1.0, 0.0, 0.0));
        vAlong = normalize(mat3(world) * vec3(0.0, 1.0, 0.0));
        gl_Position = projectionMatrix * viewMatrix * p;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vLife;
      uniform vec3 uLight;
      varying float vCoverage;
      varying vec3 vLocal;
      varying vec3 vWorld;
      varying vec3 vNormal;
      varying vec3 vAcross;
      varying vec3 vAlong;
      varying float vPart;
      float line(float value, float width) {
        float aa = max(fwidth(value), 0.0001);
        return 1.0 - smoothstep(width - aa, width + aa, abs(value));
      }
      void main() {
        vec3 N = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
        float veinPhase = (vLocal.y - abs(vLocal.x) * 0.65) * 170.0;
        float fineFade = 1.0 - smoothstep(1.0, 3.0, fwidth(veinPhase));
        if (vPart > 1.5) {
          N = normalize(N + (vAlong - sign(vLocal.x) * vAcross * 0.65) * cos(veinPhase) * fineFade * 0.28);
        }
        vec3 V = normalize(cameraPosition - vWorld);
        vec3 L = normalize(uLight - vWorld);
        float facing = abs(dot(N, V));
        float fresnel = pow(1.0 - facing, 2.2);
        float diffuse = max(dot(N, L), 0.0);
        float sheen = pow(max(dot(N, normalize(V + L)), 0.0), 42.0);
        float shift = clamp(0.2 + fresnel * 0.8 + 0.3 * dot(N, L), 0.0, 1.0);
        vec3 gold = vec3(0.23, 0.115, 0.026);
        vec3 emerald = vec3(0.003, 0.14, 0.038);
        vec3 teal = vec3(0.008, 0.11, 0.095);
        vec3 blue = vec3(0.003, 0.016, 0.12);
        vec3 color;
        float specularStrength = 0.6;
        if (vPart < 0.5) {
          float pattern = sin(vLocal.y * 11.0 + abs(vLocal.x) * 7.0);
          color = mix(mix(blue, teal, shift), gold, smoothstep(-0.2, 0.7, pattern));
          color *= 0.6 + 0.4 * smoothstep(0.0, 0.4, abs(vLocal.x));
        } else if (vPart < 1.5) {
          color = gold * 0.24;
          specularStrength = 0.8;
        } else {
          vec2 p = vec2(vLocal.x / 0.465, (vLocal.y - 3.64) / 0.67);
          p.x *= 1.0 + max(p.y, 0.0) * 0.2;
          p *= 1.95;
          float r = length(p);
          float a = atan(p.y, p.x);
          float waviness = 0.035 * sin(a * 7.0 + vLocal.y * 8.0) + 0.013 * sin(a * 23.0);
          r += waviness * smoothstep(0.6, 1.1, r);
          color = mix(vec3(0.002, 0.016, 0.022), gold * .55,
            .22 + .20 * sin(a * 31.0 + r * 22.0));
          color = mix(color, gold * .8, 1.0 - smoothstep(.92, 1.04, r));
          color = mix(color, mix(emerald, teal, shift), 1.0 - smoothstep(0.77, 0.83, r));
          color = mix(color, mix(teal, vec3(0.008, 0.16, 0.095), shift), 1.0 - smoothstep(0.67, 0.72, r));
          color = mix(color, mix(blue, vec3(0.003, 0.055, 0.19), shift), 1.0 - smoothstep(0.49, 0.54, r));
          // The dark centre has a heart-shaped lower notch rather than a circular pupil.
          vec2 c = vec2(p.x * 1.15, (p.y - 0.055) * 1.2);
          float heart = length(c) + 0.1 * exp(-c.x * c.x * 90.0) * (1.0 - smoothstep(-0.2, 0.1, c.y));
          color = mix(color, vec3(0.0003, 0.0002, 0.007) + fresnel * vec3(0.02, 0.002, 0.08),
            1.0 - smoothstep(0.30, 0.34, heart));
          float veins = sin(veinPhase);
          // Fade fine bands under minification, instead of allowing moiré.
          float barbs = sin((vLocal.y - abs(vLocal.x)*.65)*43.0 + sin(a*11.0)*.4);
          float barbFade = 1.0-smoothstep(.5,2.0,fwidth((vLocal.y-abs(vLocal.x)*.65)*43.0));
          color *= (0.65 + 0.35 * veins * fineFade) * (0.72 + .28*barbs*barbFade);
          // Separate vane barbs at the outer border; gaps fade out under minification.
          if (r > 1.5 && veins < -0.55 && fineFade > 0.65) discard;
          float filigree = line(r - 1.24 - .06*sin(a*9.0), .009) + line(r - 0.94 - 0.016 * sin(a * 26.0), 0.009)
            + line(r - 0.78, 0.005) * 0.6;
          color += gold * filigree * 0.3;
          float dots = pow(max(0.0, cos(a * 38.0)), 16.0) * line(r - 0.99, 0.025);
          color += vec3(0.045, 0.17, 0.075) * dots;
          // Fine metallic ridges are aligned with the branches, not broad plastic gloss.
          color += gold * pow(max(0.0, veins), 12.0) * fineFade * smoothstep(0.8, 1.05, r) * 0.32;
          specularStrength = 0.13;
        }
        color *= vPart < 1.5 ? mix(.12, 1.0, smoothstep(.3, 3.1, vLocal.y)) : 1.0;
        vec3 rimLight = vec3(0.003, 0.035, 0.055) * fresnel;
        vec3 specularColor = vPart > 1.5 ? normalize(color + vec3(0.002)) : vec3(0.65, 0.48, 0.20);
        vec3 lit = color * (0.18 + 1.3 * diffuse) + sheen * specularStrength * specularColor * smoothstep(0.15, 1.0, vCoverage) + rimLight;
        float eyeMask = vPart > 1.5 ? exp(-pow((vLocal.y-3.64)/.35,2.0)-pow(vLocal.x/.25,2.0)) : 0.0;
        lit += vLife * eyeMask * vec3(.025,.19,.13);
        gl_FragColor = vec4(lit, vCoverage);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}
