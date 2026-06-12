import type {
  AptitudeFactor,
  IndicatorLevel,
  Job,
  Recommendation,
  StudentProfile,
  ValueKey,
} from "./types";
import { HOLLAND_INFO } from "./types";

/** '정보없음'은 중립(0.4) — 신직업이 데이터 공백 때문에 밀리지 않도록 페널티를 주지 않는다 */
const LEVEL_PTS: Record<IndicatorLevel, number> = {
  높음: 1,
  보통: 0.5,
  낮음: 0,
  정보없음: 0.4,
};

/** 가치관 → 직업 지표 매핑 (지표가 있는 가치만) */
const VALUE_TO_INDICATOR: Partial<
  Record<ValueKey, "jobStability" | "salaryLevel" | "growthPotential" | "wlbLevel">
> = {
  안정성: "jobStability",
  보수: "salaryLevel",
  발전: "growthPotential",
  워라밸: "wlbLevel",
};

/** 지표가 없는 가치관 → 친화 카테고리 (해당 분야면 가중치의 70% 부여) */
const VALUE_CATEGORY_AFFINITY: Partial<Record<ValueKey, string[]>> = {
  사회봉사: ["02_의료_보건", "03_교육", "08_공공_사회_복지"],
  창의성: ["04_예술_문화_미디어", "01_IT_디지털기술"],
  성취: ["10_연구_과학", "05_경제_금융_법률", "01_IT_디지털기술"],
  "사회적 인정": ["05_경제_금융_법률", "02_의료_보건", "03_교육"],
  자율성: ["04_예술_문화_미디어", "09_서비스_유통_음식"],
};

/** 관심 분야 인접 카테고리 (선택 분야와 가까운 분야에 절반 점수) */
const CATEGORY_ADJACENCY: Record<string, string[]> = {
  "01_IT_디지털기술": ["10_연구_과학", "06_공학_제조_건설"],
  "02_의료_보건": ["10_연구_과학", "08_공공_사회_복지"],
  "03_교육": ["08_공공_사회_복지", "04_예술_문화_미디어"],
  "04_예술_문화_미디어": ["01_IT_디지털기술", "09_서비스_유통_음식"],
  "05_경제_금융_법률": ["08_공공_사회_복지", "09_서비스_유통_음식"],
  "06_공학_제조_건설": ["01_IT_디지털기술", "07_환경_에너지_농업"],
  "07_환경_에너지_농업": ["06_공학_제조_건설", "10_연구_과학"],
  "08_공공_사회_복지": ["03_교육", "05_경제_금융_법률"],
  "09_서비스_유통_음식": ["11_스포츠_레저", "05_경제_금융_법률"],
  "10_연구_과학": ["01_IT_디지털기술", "02_의료_보건"],
  "11_스포츠_레저": ["09_서비스_유통_음식", "02_의료_보건"],
};

/** 간편입력 과목명 → 직업 데이터 고교 과목명 브리지 */
export const SUBJECT_BRIDGE: Record<string, string[]> = {
  수학: ["수학I", "수학II", "확률과통계", "미적분"],
  과학: ["물리학I", "물리학II", "화학I", "화학II", "생명과학I", "생명과학II", "지구과학I"],
  국어: ["국어"],
  영어: ["영어"],
  사회: ["사회", "경제", "정치와법", "생활과윤리", "심리학"],
  역사: ["사회"],
  미술: ["미술"],
  음악: ["음악"],
  체육: ["체육"],
  "정보·컴퓨터": ["정보"],
};

function intersect<T>(a: T[], b: T[]): T[] {
  const set = new Set(b);
  return a.filter((x) => set.has(x));
}

export interface ScoredJob {
  job: Job;
  score: number; // 0~100 원점수
  matchedAptitudes: AptitudeFactor[];
  hollandHit: "primary" | "secondary" | "none";
}

/** 룰 기반 매칭 점수 (만점 100) — plan.md 5장 */
export function scoreJob(job: Job, p: StudentProfile): ScoredJob {
  let s = 0;

  // 1) Holland 일치 — 40점
  let hollandHit: ScoredJob["hollandHit"] = "none";
  if (job.hollandPrimary === p.holland.primary) {
    s += 25;
    hollandHit = "primary";
  } else if (job.hollandSecondary === p.holland.primary) {
    s += 15;
    hollandHit = "secondary";
  }
  if (p.holland.secondary) {
    if (job.hollandPrimary === p.holland.secondary) {
      s += 10;
      if (hollandHit === "none") hollandHit = "secondary";
    } else if (job.hollandSecondary === p.holland.secondary) {
      s += 8;
      if (hollandHit === "none") hollandHit = "secondary";
    }
  }

  // 2) 적성 요인 교집합 — 20점 (개당 5점)
  const matchedAptitudes = intersect(job.aptitudeFactors, p.aptitudes);
  s += Math.min(20, matchedAptitudes.length * 5);

  // 3) 가치관 — 20점 (상위 3개 가중 10/6/4)
  const weights = [10, 6, 4];
  p.values.slice(0, 3).forEach((v, i) => {
    const indicator = VALUE_TO_INDICATOR[v];
    if (indicator) {
      s += weights[i] * LEVEL_PTS[job[indicator]];
    } else {
      const affinity = VALUE_CATEGORY_AFFINITY[v];
      if (affinity?.includes(job.category)) s += weights[i] * 0.7;
    }
  });

  // 4) 관심 분야 — 10점 (일치 10, 인접 5)
  if (p.interestCategories.includes(job.category)) {
    s += 10;
  } else if (
    p.interestCategories.some((c) => CATEGORY_ADJACENCY[c]?.includes(job.category))
  ) {
    s += 5;
  }

  // 5) 계열 + 과목 — 10점
  if (p.track === "미정") s += 3;
  else if (p.track === job.collegeTrack) s += 5;
  const bridged = p.favoriteSubjects.flatMap((f) => SUBJECT_BRIDGE[f] ?? [f]);
  s += Math.min(5, intersect(job.highSchoolSubjects, bridged).length * 2.5);

  return { job, score: Math.min(100, Math.round(s * 10) / 10), matchedAptitudes, hollandHit };
}

/**
 * 전체 직업 점수화 → 상위 n개 후보 (카테고리당 최대 maxPerCategory 다양성 가드).
 * Claude 재랭킹의 입력이자, API 폴백 시 그대로 추천 결과가 된다.
 */
export function prefilterCandidates(
  jobs: Job[],
  p: StudentProfile,
  n = 30,
  maxPerCategory = 8,
): ScoredJob[] {
  const sorted = jobs.map((j) => scoreJob(j, p)).sort((a, b) => b.score - a.score);
  const picked: ScoredJob[] = [];
  const perCat = new Map<string, number>();

  for (const sj of sorted) {
    if (picked.length >= n) break;
    const c = perCat.get(sj.job.category) ?? 0;
    if (c >= maxPerCategory) continue;
    perCat.set(sj.job.category, c + 1);
    picked.push(sj);
  }
  // 다양성 가드 때문에 n개를 못 채우면 순위대로 보충
  if (picked.length < n) {
    const have = new Set(picked.map((x) => x.job.id));
    for (const sj of sorted) {
      if (picked.length >= n) break;
      if (!have.has(sj.job.id)) picked.push(sj);
    }
  }
  return picked;
}

/** 원점수(대략 30~90 분포) → 표시용 매칭도 60~97% */
export function toMatchingPercent(score: number): number {
  return Math.min(97, Math.max(60, Math.round(45 + score * 0.55)));
}

/** Claude 없이 만드는 한국어 추천 사유 (폴백·skipAi 경로) */
export function templateReason(sj: ScoredJob, p: StudentProfile): string {
  const parts: string[] = [];
  const h = HOLLAND_INFO[p.holland.primary];
  if (sj.hollandHit === "primary") {
    parts.push(`${h.label}(${p.holland.primary}) 성향과 잘 맞는 직업이에요`);
  } else if (sj.hollandHit === "secondary") {
    parts.push(`${h.label} 성향과 연결되는 직업이에요`);
  }
  if (sj.matchedAptitudes.length > 0) {
    parts.push(`강점인 ${sj.matchedAptitudes.slice(0, 2).join("·")}을(를) 활용할 수 있어요`);
  }
  if (p.interestCategories.includes(sj.job.category)) {
    parts.push(`관심 분야(${sj.job.categoryName})에 속해요`);
  }
  if (parts.length === 0) {
    parts.push(`${sj.job.categoryName} 분야에서 성장 가능성이 있는 직업이에요`);
  }
  return parts.join(", ") + ".";
}

export function toRecommendation(
  sj: ScoredJob,
  matching: number,
  reason: string,
): Recommendation {
  const j = sj.job;
  return {
    jobId: j.id,
    name: j.name,
    categoryName: j.categoryName,
    categoryIcon: j.categoryIcon,
    jobType: j.jobType,
    matching,
    reason,
    salaryLevel: j.salaryLevel,
    growthPotential: j.growthPotential,
    jobStability: j.jobStability,
    collegeTrack: j.collegeTrack,
    majors: j.majors,
    highSchoolSubjects: j.highSchoolSubjects,
    tags: j.tags,
  };
}
