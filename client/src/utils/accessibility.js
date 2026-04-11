import { getContrastRatio } from './colorEngine';

export const getAccessibilityScore = (color1, color2) => {
  const ratio = getContrastRatio(color1, color2);
  let label = "Poor";
  let grade = "F";
  
  if (ratio >= 7) {
    label = "Excellent";
    grade = "AAA";
  } else if (ratio >= 4.5) {
    label = "Accessible";
    grade = "AA";
  } else if (ratio >= 3.0) {
    label = "Readable";
    grade = "AA Large"; // Accessible for large text only
  }

  return {
    ratio: ratio.toFixed(2),
    label,
    grade,
    isPass: ratio >= 4.5 
  };
};
