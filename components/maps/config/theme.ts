export interface MapTheme {
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  brand: string;
  brandLight: string;
  border: string;
  borderHover: string;
  fontFamily: string;
  success: string;
  error: string;
  water: string;
  land: string;
}

export interface RegionData {
  [key: string]: unknown;
  id?: string;
  name?: string;
  value?: number;
}
