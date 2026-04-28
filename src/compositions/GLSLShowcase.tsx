import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';
import { vertexShader, fragmentShader } from '../glsl/QuantumFluidShader';

/* ═══════════════════════════════════════════════════════════
   GLSL SHOWCASE — Raw WebGL Canvas
   Uses direct WebGL API for maximum reliability in Remotion.
   No Three.js camera/geometry issues.
   ═══════════════════════════════════════════════════════════ */

function compileShader(gl: WebGLRenderingContext, source: string, type: number): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error('Shader compilation failed');
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vs: string, fs: string): WebGLProgram {
  const program = gl.createProgram()!;
  gl.attachShader(program, compileShader(gl, vs, gl.VERTEX_SHADER));
  gl.attachShader(program, compileShader(gl, fs, gl.FRAGMENT_SHADER));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    throw new Error('Program link failed');
  }
  return program;
}

// Simple fullscreen quad vertex shader
const VERT = `
attribute vec2 a_position;
varying vec2 vUv;
void main() {
  vUv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const GLSLShowcase: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Initialize WebGL once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const gl = canvas.getContext('webgl', {
      preserveDrawingBuffer: true,
      antialias: false,
    });
    if (!gl) {
      console.error('WebGL not available');
      return;
    }
    glRef.current = gl;

    // Build program
    const program = createProgram(gl, VERT, fragmentShader);
    programRef.current = program;

    // Fullscreen quad: two triangles covering -1..1
    const positions = new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1,  1,  1, -1,   1, 1,
    ]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.viewport(0, 0, width, height);
  }, [width, height]);

  // Draw every frame
  useEffect(() => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;

    gl.useProgram(program);

    // Set uniforms
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_resolution');
    gl.uniform1f(uTime, frame / fps);
    gl.uniform2f(uRes, width, height);

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }, [frame, fps, width, height]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
      />
    </AbsoluteFill>
  );
};
