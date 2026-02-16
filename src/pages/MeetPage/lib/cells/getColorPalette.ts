export function getColorPalette(maxClicks: number): string[] {
  return Array.from({ length: maxClicks + 1 }, (_, i) => `rgba(96, 138, 221, ${i / maxClicks})`);
}
