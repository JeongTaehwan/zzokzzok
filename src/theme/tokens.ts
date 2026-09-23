/** 파스텔 유아용품 팔레트 — docs/02-프로토타입.md §1 */
import { useColorScheme } from 'react-native';

export interface Theme {
  scheme: 'light' | 'dark';
  bg: string; bg2: string; bg3: string;
  ink: string; ink2: string; ink3: string;
  accent: string; accentDeep: string; accentInk: string;
  pink: string; pinkDeep: string;
  mint: string; mintDeep: string; mintInk: string;
  sky: string; skyDeep: string; butter: string; butterDeep: string; lavender: string;
  rose: string; roseDeep: string;
  blob1: string; blob2: string; blob3: string; blob4: string; dot: string;
  line: string; shadow: string;
}

export const light: Theme = {
  scheme: 'light',
  bg: '#fff5ec', bg2: '#ffffff', bg3: '#ffe6d9',
  ink: '#5b3f3a', ink2: '#9a7d76', ink3: '#c9b1aa',
  accent: '#ff9f86', accentDeep: '#ef7a60', accentInk: '#ffffff',
  pink: '#ffa3c0', pinkDeep: '#ee7fa1',
  mint: '#8fdcc0', mintDeep: '#5fc4a0', mintInk: '#164434',
  sky: '#a9d8ff', skyDeep: '#7db8e8', butter: '#ffe08a', butterDeep: '#e6c15a', lavender: '#d9ccff',
  rose: '#ff7d94', roseDeep: '#e75f78',
  blob1: '#ffd9c8', blob2: '#d6f3e8', blob3: '#e8dfff', blob4: '#fff0b8', dot: '#ffd6c6',
  line: '#ffe1d3', shadow: 'rgba(255,159,134,0.25)',
};

export const dark: Theme = {
  scheme: 'dark',
  bg: '#2b2640', bg2: '#383052', bg3: '#473d68',
  ink: '#fff3ea', ink2: '#c6bad8', ink3: '#8f83a8',
  accent: '#ffa48c', accentDeep: '#d9755c', accentInk: '#3a1f16',
  pink: '#ffa7c4', pinkDeep: '#d67797',
  mint: '#93e3c6', mintDeep: '#5eb99a', mintInk: '#123a2c',
  sky: '#9ccdf5', skyDeep: '#6f9fc9', butter: '#ffdf8e', butterDeep: '#cdb06a', lavender: '#c8b8ff',
  rose: '#ff8ba0', roseDeep: '#d0667b',
  blob1: 'rgba(255,164,140,0.22)', blob2: 'rgba(147,227,198,0.16)', blob3: 'rgba(200,184,255,0.2)', blob4: 'rgba(255,223,142,0.14)',
  dot: 'rgba(255,243,234,0.07)',
  line: 'rgba(255,243,234,0.14)', shadow: 'rgba(0,0,0,0.35)',
};

export const fonts = {
  display: 'Jua',
};

export const radius = { lg: 30, md: 22, sm: 18 };

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}
