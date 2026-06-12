// 간편 입력(화면 3) 답변 → 결정적 StudentProfile 매핑.
// Claude API 없이도 동작하는 추천의 기반이며, /api/analyze(quick)가 이를 보정한다.
import type {
  AptitudeFactor,
  HollandCode,
  StudentProfile,
  TrackChoice,
  ValueKey,
} from "./types";

/** 화면 3 카드 1 — 관심 분야 선택지 → jobs.json 카테고리 키 */
export const INTEREST_OPTIONS: Array<{ label: string; icon: string; category: string }> = [
  { label: "IT·기술", icon: "💻", category: "01_IT_디지털기술" },
  { label: "의료·보건", icon: "🏥", category: "02_의료_보건" },
  { label: "교육", icon: "📚", category: "03_교육" },
  { label: "예술·디자인", icon: "🎨", category: "04_예술_문화_미디어" },
  { label: "미디어·방송", icon: "📺", category: "04_예술_문화_미디어" },
  { label: "경제·경영", icon: "💰", category: "05_경제_금융_법률" },
  { label: "공학·제조", icon: "⚙️", category: "06_공학_제조_건설" },
  { label: "자연·환경", icon: "🌱", category: "07_환경_에너지_농업" },
  { label: "사회·복지", icon: "🤝", category: "08_공공_사회_복지" },
  { label: "요리·서비스", icon: "🛎️", category: "09_서비스_유통_음식" },
  { label: "과학·연구", icon: "🔬", category: "10_연구_과학" },
  { label: "스포츠·레저", icon: "⚽", category: "11_스포츠_레저" },
];

export const SUBJECT_OPTIONS = [
  "수학",
  "과학",
  "국어",
  "영어",
  "사회",
  "역사",
  "미술",
  "음악",
  "체육",
  "정보·컴퓨터",
] as const;

/** 카드 3 — 성향 → Holland 주유형 */
export const PERSONALITY_OPTIONS: Array<{ label: string; holland: HollandCode }> = [
  { label: "혼자 집중해서 연구하고 분석하는 게 좋아요", holland: "I" },
  { label: "사람들과 함께 어울려 일하는 게 좋아요", holland: "S" },
  { label: "무언가를 만들고 창작하는 게 좋아요", holland: "A" },
  { label: "체계적으로 정리하고 꼼꼼하게 처리하는 게 좋아요", holland: "C" },
  { label: "사람들을 이끌고 설득하는 게 좋아요", holland: "E" },
  { label: "몸을 움직이고 손으로 다루는 활동이 좋아요", holland: "R" },
];

/** 카드 4 — 중요 가치 → 가치관 키 */
export const VALUE_OPTIONS: Array<{ label: string; value: ValueKey }> = [
  { label: "높은 연봉", value: "보수" },
  { label: "안정적인 직장", value: "안정성" },
  { label: "사회적 기여", value: "사회봉사" },
  { label: "창의적인 일", value: "창의성" },
  { label: "성장 가능성", value: "발전" },
  { label: "워라밸", value: "워라밸" },
];

/** 과목 → 적성 요인 추정 */
const SUBJECT_APTITUDE: Record<string, AptitudeFactor[]> = {
  수학: ["수리력", "추리력"],
  과학: ["추리력", "문제해결력"],
  국어: ["언어력"],
  영어: ["언어력"],
  사회: ["언어력", "추리력"],
  역사: ["언어력", "집중력"],
  미술: ["색채지각력", "공간지각력"],
  음악: ["협응능력", "집중력"],
  체육: ["협응능력", "기계능력"],
  "정보·컴퓨터": ["문제해결력", "수리력"],
};

/** 성향(Holland) → 보조 적성 요인 (build_jobs_json.py APTITUDE_MAP과 동일) */
const HOLLAND_APTITUDE: Record<HollandCode, AptitudeFactor[]> = {
  I: ["추리력", "문제해결력", "수리력", "언어력"],
  R: ["기계능력", "협응능력", "공간지각력", "집중력"],
  A: ["색채지각력", "언어력", "협응능력", "공간지각력"],
  S: ["언어력", "추리력", "집중력", "문제해결력"],
  E: ["언어력", "추리력", "문제해결력", "수리력"],
  C: ["사무지각력", "집중력", "수리력", "언어력"],
};

/** 카테고리 기본 Holland 코드 (부유형 추정용) */
const CATEGORY_HOLLAND: Record<string, HollandCode[]> = {
  "01_IT_디지털기술": ["I", "R"],
  "02_의료_보건": ["S", "I"],
  "03_교육": ["S", "A"],
  "04_예술_문화_미디어": ["A", "E"],
  "05_경제_금융_법률": ["E", "C"],
  "06_공학_제조_건설": ["R", "I"],
  "07_환경_에너지_농업": ["R", "I"],
  "08_공공_사회_복지": ["S", "C"],
  "09_서비스_유통_음식": ["E", "S"],
  "10_연구_과학": ["I", "R"],
  "11_스포츠_레저": ["R", "S"],
};

export interface QuickAnswers {
  interests: string[]; // 카테고리 키
  subjects: string[];
  personality: HollandCode;
  values: ValueKey[];
  grade: 1 | 2 | 3;
  track: TrackChoice;
  freeText?: string;
  mbti?: string;
}

/** 간편 입력 → 결정적 프로필 (API 없이도 추천 가능) */
export function buildQuickProfile(a: QuickAnswers): StudentProfile {
  // 부유형: 선택한 관심 분야의 대표 코드 중 주유형과 다른 첫 번째
  let secondary: HollandCode | null = null;
  for (const cat of a.interests) {
    for (const code of CATEGORY_HOLLAND[cat] ?? []) {
      if (code !== a.personality) {
        secondary = code;
        break;
      }
    }
    if (secondary) break;
  }

  // 적성: 좋아하는 과목 기반 + 성향 보조, 중복 제거 상위 4개
  const aptitudes: AptitudeFactor[] = [];
  for (const s of a.subjects) {
    for (const f of SUBJECT_APTITUDE[s] ?? []) {
      if (!aptitudes.includes(f)) aptitudes.push(f);
    }
  }
  for (const f of HOLLAND_APTITUDE[a.personality]) {
    if (aptitudes.length >= 4) break;
    if (!aptitudes.includes(f)) aptitudes.push(f);
  }

  return {
    source: "quick",
    holland: { primary: a.personality, secondary },
    aptitudes: aptitudes.slice(0, 4),
    values: a.values,
    interestCategories: [...new Set(a.interests)],
    favoriteSubjects: a.subjects,
    freeText: a.freeText?.trim() || undefined,
    mbti: a.mbti?.trim().toUpperCase() || undefined,
    grade: a.grade,
    track: a.track,
    confidence: "medium",
  };
}
