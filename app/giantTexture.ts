import * as THREE from 'three';

/**
 * Deterministic illustrative atmospheres, not observation mosaics or current
 * weather. Belt structure, storms, and Saturn's hexagon are visual models.
 * Uranus/Neptune use restrained natural-colour-inspired cyan/blue palettes;
 * the famous saturated Voyager Neptune treatment is deliberately avoided.
 */
export function createGiantTexture(id: string, worldColor: string, accent: string) {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d')!;
  const image = context.createImageData(width, height);
  const pixels = image.data;
  const tau = Math.PI * 2;
  let seed = 5381;
  for (let i = 0; i < id.length; i++) seed = ((seed << 5) + seed) ^ id.charCodeAt(i);
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
  // A tileable low-frequency random field amortizes noise work over 2M pixels.
  const fieldWidth = 128;
  const fieldHeight = 128;
  const field = new Float32Array(fieldWidth * fieldHeight);
  for (let i = 0; i < field.length; i++) field[i] = random();
  const smooth = (x: number) => x * x * (3 - 2 * x);
  const mix = (a: number, b: number, t: number) => a + (b - a) * t;
  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  const noise = (u: number, v: number, frequency: number) => {
    const x = ((u * frequency) % fieldWidth + fieldWidth) % fieldWidth;
    const y = ((v * frequency) % fieldHeight + fieldHeight) % fieldHeight;
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const tx = smooth(x - ix);
    const ty = smooth(y - iy);
    const nx = (ix + 1) % fieldWidth;
    const ny = (iy + 1) % fieldHeight;
    return mix(mix(field[iy * fieldWidth + ix], field[iy * fieldWidth + nx], tx),
      mix(field[ny * fieldWidth + ix], field[ny * fieldWidth + nx], tx), ty);
  };
  const rgb = (css: string) => {
    const hex = new THREE.Color(css).getHex();
    return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
  };
  const palettes: Record<string, { light: number[]; dark: number[]; turbulence: number; contrast: number }> = {
    jupiter: { light: [227, 214, 187], dark: [145, 108, 85], turbulence: 0.013, contrast: 1 },
    saturn: { light: [232, 218, 182], dark: [184, 164, 126], turbulence: 0.005, contrast: 0.5 },
    uranus: { light: [162, 200, 201], dark: [137, 179, 188], turbulence: 0.002, contrast: 0.11 },
    neptune: { light: [126, 168, 189], dark: [96, 143, 173], turbulence: 0.005, contrast: 0.22 },
  };
  const palette = palettes[id] ?? { light: rgb(worldColor), dark: rgb(accent), turbulence: 0.008, contrast: 0.3 };
  const periodicDifference = (u: number, center: number) => {
    const d = u - center;
    return d - Math.round(d);
  };
  // Longitude functions repeat exactly at u=0/1, eliminating a vertical seam.
  const longitude = new Float64Array(width);
  const waveA = new Float64Array(width);
  const waveB = new Float64Array(width);
  const waveC = new Float64Array(width);
  for (let x = 0; x < width; x++) {
    const angle = x / width * tau;
    longitude[x] = angle;
    waveA[x] = Math.sin(angle * 7 + Math.sin(angle * 3) * 0.8);
    waveB[x] = Math.sin(angle * 17 + Math.sin(angle * 5) * 1.8);
    waveC[x] = Math.sin(angle * 39 + Math.sin(angle * 11) * 0.5);
  }
  for (let y = 0; y < height; y++) {
    const v = y / (height - 1);
    const latitude = (0.5 - v) * Math.PI;
    const poleDamping = Math.cos(latitude);
    for (let x = 0; x < width; x++) {
      const u = x / width;
      const n0 = noise(u * 4, v * 2, 32);
      const n1 = noise(u * 8 + 0.375, v * 5 + 0.21, 16);
      const n2 = noise(u * 16 + 0.75, v * 12, 8);
      let displacement = (waveA[x] * 0.46 + waveB[x] * 0.22 + waveC[x] * 0.08
        + (n0 - 0.5) * 0.8 + (n1 - 0.5) * 0.22) * palette.turbulence * poleDamping;
      let stormRadius = 10;
      let stormAngle = 0;
      if (id === 'jupiter') {
        const sx = periodicDifference(u, 0.68) / 0.051;
        const sy = (v - (0.5 + 22 / 180)) / 0.035;
        stormRadius = Math.sqrt(sx * sx + sy * sy);
        stormAngle = Math.atan2(sy, sx);
        if (stormRadius < 2.4) {
          displacement += Math.sin(stormAngle + stormRadius * 3) * 0.013
            * Math.exp(-stormRadius * stormRadius * 0.5);
        }
      }
      const warpedV = v + displacement;
      const broad = Math.sin(warpedV * Math.PI * 17 + n0 * 0.9);
      const narrow = Math.sin(warpedV * Math.PI * 47 + n1 * 1.6);
      const fine = Math.sin(warpedV * Math.PI * 127 + waveB[x] * 0.4);
      let darkness = clamp(0.46 + (broad * 0.29 + narrow * 0.13 + fine * 0.035) * palette.contrast);
      if (id === 'jupiter') {
        const latDegrees = Math.abs(latitude) * 180 / Math.PI;
        // Warm main belts flank the pale equatorial zone.
        const mainBelts = Math.exp(-Math.pow((latDegrees - 14) / 5.2, 2));
        darkness = clamp(darkness * 0.60 + mainBelts * 0.43 + (n1 - 0.5) * 0.14);
      }
      let red = mix(palette.light[0], palette.dark[0], darkness);
      let green = mix(palette.light[1], palette.dark[1], darkness);
      let blue = mix(palette.light[2], palette.dark[2], darkness);
      const textureDetail = (n2 - 0.5) * (id === 'jupiter' ? 13 : id === 'saturn' ? 5 : 1.8);
      red += textureDetail;
      green += textureDetail;
      blue += textureDetail;
      if (id === 'jupiter' && stormRadius < 1.48) {
        const edge = clamp((1.48 - stormRadius) * 2.5);
        const swirl = clamp(0.5 + Math.sin(stormAngle * 2 + stormRadius * 7 + n1 * 4.5) * 0.26
          + (n2 - 0.5) * 0.46);
        const core = Math.exp(-stormRadius * stormRadius * 2.5);
        red = mix(red, 167 + swirl * 37 + core * 8, edge * 0.82);
        green = mix(green, 104 + swirl * 32 + core * 14, edge * 0.82);
        blue = mix(blue, 74 + swirl * 20 + core * 10, edge * 0.82);
      }
      if (id === 'jupiter') {
        for (let oval = 0; oval < 3; oval++) {
          const sx = periodicDifference(u, 0.12 + oval * 0.19) / (0.014 + oval * 0.002);
          const sy = (v - 0.69 - oval * 0.007) / 0.010;
          const r2 = sx * sx + sy * sy;
          if (r2 < 3) {
            const alpha = Math.exp(-r2 * 1.7) * 0.45;
            red = mix(red, 233, alpha);
            green = mix(green, 220, alpha);
            blue = mix(blue, 197, alpha);
          }
        }
      } else if (id === 'saturn' && v < 0.10) {
        const sector = ((longitude[x] + Math.PI / 6) % (Math.PI / 3)) - Math.PI / 6;
        const hexagonRadius = 0.065 / Math.cos(sector);
        const cap = clamp((hexagonRadius - v) * 150);
        red = mix(red, 145, cap * 0.24);
        green = mix(green, 163, cap * 0.24);
        blue = mix(blue, 157, cap * 0.24);
        const rim = Math.exp(-Math.pow((v - hexagonRadius) / 0.0022, 2)) * 0.10;
        red *= 1 - rim;
        green *= 1 - rim;
        blue *= 1 - rim;
      } else if (id === 'uranus') {
        const polarHood = clamp((0.25 - v) / 0.16) * 0.22;
        red = mix(red, 199, polarHood);
        green = mix(green, 218, polarHood);
        blue = mix(blue, 214, polarHood);
      } else if (id === 'neptune') {
        const sx = periodicDifference(u, 0.24) / 0.035;
        const sy = (v - 0.64) / 0.021;
        const r2 = sx * sx + sy * sy;
        const darkStorm = Math.exp(-r2 * 1.8) * 0.32;
        red = mix(red, 64, darkStorm);
        green = mix(green, 104, darkStorm);
        blue = mix(blue, 135, darkStorm);
        const cloudX = periodicDifference(u, 0.29) / 0.024;
        const cloudY = (v - 0.616) / 0.004;
        const cloud = Math.exp(-(cloudX * cloudX + cloudY * cloudY)) * 0.45;
        red = mix(red, 213, cloud);
        green = mix(green, 225, cloud);
        blue = mix(blue, 226, cloud);
      }
      // Fine deterministic grain breaks perfect smoothness without noisy pixels.
      const grain = (random() - 0.5) * (id === 'jupiter' ? 2.5 : 0.7);
      const offset = (y * width + x) * 4;
      pixels[offset] = red + grain;
      pixels[offset + 1] = green + grain;
      pixels[offset + 2] = blue + grain;
      pixels[offset + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.name = `Helios illustrative ${id} atmosphere 2048x1024`;
  return texture;
}
