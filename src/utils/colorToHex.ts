// @ts-ignore
import Color from 'color';

export function colorToHex(color: string) {
  const parsed = new Color(color);
  if (!parsed) {
    return '#111827';
  }

  return parsed.hex();
}
