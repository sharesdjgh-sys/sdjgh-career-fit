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

type IconComponent = React.ComponentType<{ className?: string }>;

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
