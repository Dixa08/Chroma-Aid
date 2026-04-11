/**
 * Advanced Color Engine for Chroma Aid
 * Utilizes HSL logic to provide accurate mathematical translations.
 */

// Helper to convert hex to RGB
export const hexToRgb = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return { r, g, b };
  };
  
// Helper to calculate luminance for WCAG contrast
export const getLuminance = (r, g, b) => {
  const a = [r, g, b].map(function (v) {
      v /= 255;
      return v <= 0.03928
          ? v / 12.92
          : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

// Returns WCAG contrast ratio (1 to 21)
export const getContrastRatio = (color1, color2) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

// Recommends black or white text depending on background
export const getAccessibleTextColor = (bgColor) => {
  const rgb = hexToRgb(bgColor);
  const lum = getLuminance(rgb.r, rgb.g, rgb.b);
  return lum > 0.179 ? '#000000' : '#FFFFFF';
};

// Convert HSL to Hex
export const hslToHex = (h, s, l) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Convert Hex to HSL
export const hexToHsl = (hex) => {
  let { r, g, b } = hexToRgb(hex);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; 
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

// Smart Color Engine Functions
export const getComplementary = (colorHex) => {
  const hsl = hexToHsl(colorHex);
  const complementaryH = (hsl.h + 180) % 360;
  return hslToHex(complementaryH, hsl.s, hsl.l);
};

export const getAnalogous = (colorHex) => {
  const hsl = hexToHsl(colorHex);
  return [
    hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
    colorHex,
    hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l)
  ];
};

// CVD simulation matrices based on SVG color matrix approximations
export const simulateCVD = (colorHex, type) => {
  const rgb = hexToRgb(colorHex);
  let r = rgb.r, g = rgb.g, b = rgb.b;
  let sr, sg, sb;
  
  switch(type) {
    case 'Protanopia': // Red blind
      sr = 0.567 * r + 0.433 * g + 0 * b;
      sg = 0.558 * r + 0.442 * g + 0 * b;
      sb = 0 * r + 0.242 * g + 0.758 * b;
      break;
    case 'Deuteranopia': // Green blind
      sr = 0.625 * r + 0.375 * g + 0 * b;
      sg = 0.7 * r + 0.3 * g + 0 * b;
      sb = 0 * r + 0.3 * g + 0.7 * b;
      break;
    case 'Tritanopia': // Blue blind
      sr = 0.95 * r + 0.05 * g + 0 * b;
      sg = 0 * r + 0.433 * g + 0.567 * b;
      sb = 0 * r + 0.475 * g + 0.525 * b;
      break;
    case 'Achromatopsia': // Monochromacy
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      sr = sg = sb = gray;
      break;
    default:
      return colorHex;
  }
  
  return `#${Math.min(255, Math.round(sr)).toString(16).padStart(2,'0')}${Math.min(255, Math.round(sg)).toString(16).padStart(2,'0')}${Math.min(255, Math.round(sb)).toString(16).padStart(2,'0')}`;
};
