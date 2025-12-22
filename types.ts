
export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT_IG = '4:5',
  STORY = '9:16',
  LANDSCAPE = '16:9'
}

export enum StylePreset {
  NATURAL = '☀️ 自然陽光',
  CINEMATIC = '🎬 電影質感',
  SOFT = '☁️ 柔和日系'
}

export interface SceneOption {
  value: string;
  label: string;
  group: string;
}

export interface GenerationState {
  loading: boolean;
  error: string | null;
  resultUrl: string | null;
}
