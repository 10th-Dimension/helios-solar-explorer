export type GraphicsQuality = 'ULTRA' | 'HIGH' | 'BALANCED';
export const GRAPHICS_PROFILES = {
  ULTRA: { pixelRatio: 2, sphereSegments: 112, starCount: 16000, atmosphereDetail: 1, ringSegments: 256, cloudOpacity: .94 },
  HIGH: { pixelRatio: 1.6, sphereSegments: 72, starCount: 9000, atmosphereDetail: .7, ringSegments: 160, cloudOpacity: .9 },
  BALANCED: { pixelRatio: 1, sphereSegments: 40, starCount: 3500, atmosphereDetail: .35, ringSegments: 96, cloudOpacity: .82 },
} as const;

export function automaticGraphicsQuality(width: number, cores: number): GraphicsQuality {
  return width < 760 ? 'BALANCED' : cores >= 8 ? 'ULTRA' : 'HIGH';
}
