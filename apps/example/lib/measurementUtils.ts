export type MeasurementItem = {
  id: string;
  value: number;
  label: string;
  isMainMarker: boolean; // For height: 4, 5, 6, 7 ft markers. For weight: every 10kg
};

export function generateHeightItems(): MeasurementItem[] {
  const items: MeasurementItem[] = [];
  const minFeet = 4;
  const maxFeet = 7;
  
  for (let feet = minFeet; feet <= maxFeet; feet++) {
    for (let inch = 0; inch < 12; inch++) {
      const totalInches = feet * 12 + inch;
      const isMainMarker = inch === 0; // Main marker at the start of each foot
      items.push({
        id: `height-${totalInches}`,
        value: totalInches,
        label: inch === 0 ? `${feet}'` : `${inch}"`,
        isMainMarker,
      });
    }
  }
  return items;
}

export function generateWeightItems(): MeasurementItem[] {
  const items: MeasurementItem[] = [];
  const minKg = 30;
  const maxKg = 150;
  
  for (let kg = minKg; kg <= maxKg; kg++) {
    const isMainMarker = kg % 10 === 0; // Main marker every 10kg
    items.push({
      id: `weight-${kg}`,
      value: kg,
      label: isMainMarker ? `${kg}` : "",
      isMainMarker,
    });
  }
  return items;
}

export function generateDayItems(month: number, year: number): MeasurementItem[] {
  const items: MeasurementItem[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    items.push({
      id: `day-${day}`,
      value: day,
      label: "",
      isMainMarker: false,
    });
  }
  return items;
}

export function formatHeight(inches: number): string {
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}' ${remainingInches}"`;
}

export function formatDate(year: number, month: number, day: number): string {
  const date = new Date(year, month, day);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export function calculateBMI(weightKg: number, heightInches: number): number {
  const heightMeters = heightInches * 0.0254;
  return weightKg / (heightMeters ** 2);
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function convertKgToLbs(kg: number): number {
  return kg * 2.20462;
}

