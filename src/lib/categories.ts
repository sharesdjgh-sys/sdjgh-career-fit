import {
  Laptop,
  HeartPulse,
  BookOpen,
  Palette,
  Coins,
  Settings,
  Sprout,
  Users,
  Utensils,
  Microscope,
  Dumbbell,
} from "lucide-react";

type IconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

/** 11개 직업 분야(categoryName) → lucide 아이콘 매핑 (results·jobs 상세·탐색 페이지 공용) */
export const CATEGORY_ICONS: Record<string, IconComponent> = {
  "IT·디지털기술": Laptop,
  "의료·보건": HeartPulse,
  "교육": BookOpen,
  "예술·문화·미디어": Palette,
  "경제·금융·법률": Coins,
  "공학·제조·건설": Settings,
  "환경·에너지·농업": Sprout,
  "공공·사회·복지": Users,
  "서비스·유통·음식": Utensils,
  "연구·과학": Microscope,
  "스포츠·레저": Dumbbell,
};

/** 분야별 고유 색상 (accent: 아이콘·강조선, tint: 아이콘 배경) — 탐색 페이지 카드 구분용 */
export const CATEGORY_COLORS: Record<string, { accent: string; tint: string }> = {
  "IT·디지털기술": { accent: "#3B6EA5", tint: "#F5F9FC" },
  "예술·문화·미디어": { accent: "#8B5C9E", tint: "#FAF7FC" },
  "공학·제조·건설": { accent: "#5B6B82", tint: "#F7F8FA" },
  "서비스·유통·음식": { accent: "#CE6A3D", tint: "#FDF8F4" },
  "공공·사회·복지": { accent: "#3E8E7E", tint: "#F4FAF8" },
  "경제·금융·법률": { accent: "#B5882F", tint: "#FBF8F1" },
  "환경·에너지·농업": { accent: "#5A934A", tint: "#F6FAF4" },
  "의료·보건": { accent: "#C2506A", tint: "#FDF5F7" },
  "연구·과학": { accent: "#2F8FA6", tint: "#F3F9FB" },
  "스포츠·레저": { accent: "#D15B57", tint: "#FDF6F5" },
  "교육": { accent: "#6A5BB0", tint: "#F8F6FC" },
};

/** 분야 색상 조회 (미정의 시 브랜드 로즈로 폴백) */
export function categoryColor(name: string): { accent: string; tint: string } {
  return CATEGORY_COLORS[name] ?? { accent: "#D6456B", tint: "#FBF2F5" };
}

/** 직업 탐색 페이지 분야 표시 순서 (직업 수 내림차순) */
export const CATEGORY_ORDER: string[] = [
  "IT·디지털기술",
  "예술·문화·미디어",
  "공학·제조·건설",
  "서비스·유통·음식",
  "공공·사회·복지",
  "경제·금융·법률",
  "환경·에너지·농업",
  "의료·보건",
  "연구·과학",
  "스포츠·레저",
  "교육",
];
