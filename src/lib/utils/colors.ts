export const isColorBright = (color: string): boolean => {
  const hex = color.replace("#", "");

  if (hex.length !== 6 && hex.length !== 3)
    return false;

  let r_hex: string, g_hex: string, b_hex: string;

  if (hex.length === 3) {
    r_hex = hex[0] + hex[0];
    g_hex = hex[1] + hex[1];
    b_hex = hex[2] + hex[2];
  }
  else {
    r_hex = hex.substring(0, 2);
    g_hex = hex.substring(2, 4);
    b_hex = hex.substring(4, 6);
  }

  const r = Number.parseInt(r_hex, 16);
  const g = Number.parseInt(g_hex, 16);
  const b = Number.parseInt(b_hex, 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b))
    return false;

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5;
};

export const getTextColorForBackground = (
  bgColor: string,
  textColor?: string,
): string => {
  const bright = isColorBright(bgColor);

  if (textColor)
    return `#${textColor}`;

  return bright ? "#000000" : "#FFFFFF";
};
