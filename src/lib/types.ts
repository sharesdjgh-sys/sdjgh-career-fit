export type HollandCode = "R" | "I" | "A" | "S" | "E" | "C";

export const HOLLAND_CODES: HollandCode[] = ["R", "I", "A", "S", "E", "C"];

export const HOLLAND_INFO: Record<HollandCode, { label: string; icon: string; desc: string }> = {
  R: { label: "현실형", icon: "🔧", desc: "기계·도구·자연을 다루는 실제적 활동 선호" },
  I: { label: "탐구형", icon: "🔬", desc: "분석·연구·관찰 등 지적 탐구 활동 선호" },
  A: { label: "예술형", icon: "🎨", desc: "창의적 표현, 자유로운 환경 선호" },
  S: { label: "사회형", icon: "🤝", desc: "사람과의 교류, 봉사·교육 활동 선호" },
  E: { label: "기업형", icon: "💼", desc: "리더십·설득·경영 활동 선호" },
  C: { label: "관습형", icon: "📋", desc: "체계적·정확한 데이터·사무 활동 선호" },
};

export const APTITUDE_FACTORS = [
  "언어력",
  "수리력",
  "추리력",
  "공간지각력",
  "사무지각력",
  "색채지각력",
  "협응능력",
  "집중력",
  "문제해결력",
  "기계능력",
] as const;
export type AptitudeFactor = (typeof APTITUDE_FACTORS)[number];

export const VALUE_KEYS = [
  "안정성",
  "보수",
  "성취",
  "사회적 인정",
  "사회봉사",
  "자율성",
  "발전",
  "창의성",
  "워라밸",
] as const;
export type ValueKey = (typeof VALUE_KEYS)[number];

export type CollegeTrack = "이과" | "문과" | "예체능";
export type TrackChoice = CollegeTrack | "미정";
export type IndicatorLevel = "높음" | "보통" | "낮음" | "정보없음";

/** data/jobs.json 의 직업 레코드 */
export interface Job {
  id: string;
  name: string;
  category: string; // "01_IT_디지털기술"
  categoryName: string; // "IT·디지털기술"
  categoryIcon: string;
  jobType: string;
  stdCategory: string;
  salary: number | null; // 만원 단위
  salaryLevel: IndicatorLevel;
  growthPotential: IndicatorLevel;
  jobStability: IndicatorLevel;
  wlbLevel: IndicatorLevel;
  satisfaction: number | null;
  tags: string[];
  abilities: string[];
  relatedJobs: string[];
  sourceUrl: string;
  holland: HollandCode[];
  hollandPrimary: HollandCode;
  hollandSecondary: HollandCode | "";
  collegeTrack: CollegeTrack;
  majors: string[];
  highSchoolSubjects: string[];
  aptitudeFactors: AptitudeFactor[];
}

export interface JobsFile {
  version: string;
  generated: string;
  total: number;
  stats: {
    hollandDistribution: Record<string, number>;
    trackDistribution: Record<string, number>;
    categoryDistribution: Record<string, number>;
  };
  hollandDescription: Record<HollandCode, string>;
  aptitudeFactors: string[];
  jobs: Job[];
}

/** 두 입력 경로(사진/간편)가 공통으로 만들어내는 학생 프로필 */
export interface StudentProfile {
  source: "photo" | "quick";
  holland: {
    primary: HollandCode;
    secondary: HollandCode | null;
    scores?: Partial<Record<HollandCode, number>>; // 0~100 (사진 경로)
  };
  aptitudes: AptitudeFactor[]; // 상위 3~4개
  values: ValueKey[]; // 우선순위순
  interestCategories: string[]; // jobs.json category 키
  favoriteSubjects: string[];
  freeText?: string;
  mbti?: string;
  grade: 1 | 2 | 3;
  track: TrackChoice;
  confidence: "high" | "medium" | "low";
  warnings?: string[];
}

/** 추천 결과 한 건 (화면 4 카드 + localStorage 보관용) */
export interface Recommendation {
  jobId: string;
  name: string;
  categoryName: string;
  categoryIcon: string;
  jobType: string;
  matching: number; // 60~99
  reason: string;
  salaryLevel: IndicatorLevel;
  growthPotential: IndicatorLevel;
  jobStability: IndicatorLevel;
  collegeTrack: CollegeTrack;
  majors: string[];
  highSchoolSubjects: string[];
  tags: string[];
}

export interface RecommendResponse {
  ok: boolean;
  source: "ai" | "rule"; // ai = Claude 재랭킹, rule = 결정적 폴백
  recommendations: Recommendation[];
  error?: string;
}

/** AI 분석 보고서 (화면 8) */
export interface CareerReport {
  generatedAt: string;
  profileSummary: string;
  hollandExplanation: string;
  topJobs: Array<{
    jobId: string;
    name: string;
    matching: number;
    whyFit: string;
    studyGuide: {
      highSchoolSubjects: { grade1: string[]; grade2: string[]; grade3: string[] };
      majors: string[];
      certificates: string[];
      activities: string[];
    };
  }>;
  roadmap: { grade1: string; grade2: string; grade3: string };
  examStrategy: string;
  closingAdvice: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
