export interface Branch {
  id: string;
  bankId: string;
  bankShort: string;
  bankName: string;
  address: string;
  hours: string;
  lat: number;
  lng: number;
  color: string; // hex for marker
}

// Bank brand colors (approximate, for map markers)
export const BANK_COLORS: Record<string, string> = {
  bna: "#0E7C3A",       // green
  cpa: "#C9A84C",       // gold
  bdl: "#1E63B8",       // blue
  bea: "#B8252E",       // red
  agb: "#7A2D8F",       // purple
  sgialgerie: "#E4002B", // red
};

// Mock branches around Algiers center (~36.7538, 3.0588)
export const BRANCHES: Branch[] = [
  { id: "bna-1", bankId: "bna", bankShort: "BNA", bankName: "البنك الوطني الجزائري", address: "شارع العربي بن مهيدي، الجزائر الوسطى", hours: "الأحد - الخميس: 08:30 - 16:00", lat: 36.7755, lng: 3.0597, color: BANK_COLORS.bna },
  { id: "bna-2", bankId: "bna", bankShort: "BNA", bankName: "البنك الوطني الجزائري", address: "حي حيدرة، الجزائر", hours: "الأحد - الخميس: 08:30 - 16:00", lat: 36.7611, lng: 3.0356, color: BANK_COLORS.bna },
  { id: "cpa-1", bankId: "cpa", bankShort: "CPA", bankName: "القرض الشعبي الجزائري", address: "شارع ديدوش مراد، الجزائر", hours: "الأحد - الخميس: 08:00 - 15:30", lat: 36.7672, lng: 3.0532, color: BANK_COLORS.cpa },
  { id: "cpa-2", bankId: "cpa", bankShort: "CPA", bankName: "القرض الشعبي الجزائري", address: "باب الزوار، الجزائر", hours: "الأحد - الخميس: 08:00 - 15:30", lat: 36.7188, lng: 3.1864, color: BANK_COLORS.cpa },
  { id: "bdl-1", bankId: "bdl", bankShort: "BDL", bankName: "بنك التنمية المحلية", address: "حسين داي، الجزائر", hours: "الأحد - الخميس: 08:30 - 16:00", lat: 36.7411, lng: 3.0899, color: BANK_COLORS.bdl },
  { id: "bdl-2", bankId: "bdl", bankShort: "BDL", bankName: "بنك التنمية المحلية", address: "بئر مراد رايس، الجزائر", hours: "الأحد - الخميس: 08:30 - 16:00", lat: 36.7456, lng: 3.0359, color: BANK_COLORS.bdl },
  { id: "bea-1", bankId: "bea", bankShort: "BEA", bankName: "البنك الخارجي الجزائري", address: "ساحة أول ماي، الجزائر", hours: "الأحد - الخميس: 08:30 - 16:30", lat: 36.7589, lng: 3.0639, color: BANK_COLORS.bea },
  { id: "bea-2", bankId: "bea", bankShort: "BEA", bankName: "البنك الخارجي الجزائري", address: "القبة، الجزائر", hours: "الأحد - الخميس: 08:30 - 16:30", lat: 36.7283, lng: 3.0894, color: BANK_COLORS.bea },
  { id: "agb-1", bankId: "agb", bankShort: "AGB", bankName: "بنك الخليج الجزائر", address: "حي الأبيار، الجزائر", hours: "الأحد - الخميس: 08:30 - 16:00", lat: 36.7689, lng: 3.0411, color: BANK_COLORS.agb },
  { id: "sga-1", bankId: "sgialgerie", bankShort: "SGA", bankName: "سوسيتي جنرال الجزائر", address: "شارع حسيبة بن بوعلي، الجزائر", hours: "الأحد - الخميس: 08:00 - 16:00", lat: 36.7522, lng: 3.0728, color: BANK_COLORS.sgialgerie },
  { id: "sga-2", bankId: "sgialgerie", bankShort: "SGA", bankName: "سوسيتي جنرال الجزائر", address: "الدار البيضاء، الجزائر", hours: "الأحد - الخميس: 08:00 - 16:00", lat: 36.7172, lng: 3.1289, color: BANK_COLORS.sgialgerie },
];

// Algiers center default
export const ALGIERS_CENTER = { lat: 36.7538, lng: 3.0588 };

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
