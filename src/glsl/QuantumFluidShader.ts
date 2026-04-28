// Vertex shader is now embedded in GLSLShowcase.tsx (raw WebGL)
// This file only exports the fragment shader.

export const vertexShader = ''; // unused, kept for backward compat

export const fragmentShader = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

varying vec2 vUv;

// ═══ GLSL Noise: Simplex 3D (from glsl-noise skill) ═══
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// ═══ FBM (Fractal Brownian Motion) — from glsl-noise skill ═══
float fbm(vec3 p) {
  float val = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 5; i++) {
    val += amp * snoise(p * freq);
    freq *= 2.0;
    amp *= 0.5;
  }
  return val;
}

// ═══ SDF: Circle — from glsl-sdf skill ═══
float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

// ═══ Cosine Palette — from glsl-color skill ═══
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  // Normalize coordinates: center at (0,0), aspect-corrected
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * 2.0;
  p.x *= u_resolution.x / u_resolution.y;

  float t = u_time;

  // ═══ Layer 1: Distorted noise field ═══
  vec2 q = p;
  q += vec2(
    fbm(vec3(p * 1.5, t * 0.3)),
    fbm(vec3(p * 1.5 + 5.0, t * 0.3))
  ) * 0.5;

  // ═══ Layer 2: SDF circle with noise warp ═══
  float noiseWarp = fbm(vec3(q * 2.0, t * 0.5)) * 0.35;
  float d = sdCircle(q, 0.4 + noiseWarp);

  // ═══ Layer 3: Color ═══
  // Warm accent palette
  vec3 col = palette(
    d * 2.0 + t * 0.2,
    vec3(0.5, 0.5, 0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(1.0, 0.7, 0.4),
    vec3(0.0, 0.15, 0.2)
  );

  // Accent pulse: burnt orange (#FF4D00)
  vec3 accent = vec3(1.0, 0.3, 0.0);
  float accentMask = smoothstep(0.02, -0.02, d);
  col = mix(col, accent * 1.5, accentMask * 0.6);

  // ═══ Layer 4: Glow ring ═══
  float glow = 0.012 / (abs(d) + 0.005);
  col += glow * vec3(1.0, 0.5, 0.2) * 0.3;

  // ═══ Layer 5: Background noise texture ═══
  float bg = fbm(vec3(p * 3.0, t * 0.1)) * 0.08 + 0.02;
  col += vec3(bg);

  // ═══ Layer 6: Vignette ═══
  float vig = 1.0 - smoothstep(0.5, 1.8, length(p));
  col *= vig;

  // Tone mapping (prevent blowout)
  col = col / (1.0 + col);

  gl_FragColor = vec4(col, 1.0);
}
`;
