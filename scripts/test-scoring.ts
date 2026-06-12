// 매칭 엔진 상식 검증 — npx tsx scripts/test-scoring.ts
// 합성 프로필 3종으로 상위 추천의 분야 구성이 직관과 맞는지,
// '정보없음' 직업이 부당하게 묻히지 않는지 확인한다.
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  prefilterCandidates,
  toMatchingPercent,
  templateReason,
} from "../src/lib/scoring";
import type { JobsFile, StudentProfile } from "../src/lib/types";

const data = JSON.parse(
  readFileSync(path.join(process.cwd(), "data", "jobs.json"), "utf-8"),
) as JobsFile;

const profiles: Array<{ name: string; expectCats: string[]; p: StudentProfile }> = [
  {
    name: "이과·탐구형 (I·R, 수리력, IT 관심)",
    expectCats: ["01_IT_디지털기술", "06_공학_제조_건설", "10_연구_과학"],
    p: {
      source: "quick",
      holland: { primary: "I", secondary: "R" },
      aptitudes: ["수리력", "추리력", "문제해결력"],
      values: ["발전", "보수", "성취"],
      interestCategories: ["01_IT_디지털기술"],
      favoriteSubjects: ["수학", "과학", "정보·컴퓨터"],
      grade: 2,
      track: "이과",
      confidence: "high",
    },
  },
  {
    name: "문과·사회형 (S·A, 사회봉사, 교육 관심)",
    expectCats: ["03_교육", "08_공공_사회_복지", "02_의료_보건"],
    p: {
      source: "quick",
      holland: { primary: "S", secondary: "A" },
      aptitudes: ["언어력", "집중력", "문제해결력"],
      values: ["사회봉사", "안정성", "워라밸"],
      interestCategories: ["03_교육", "08_공공_사회_복지"],
      favoriteSubjects: ["국어", "사회"],
      grade: 1,
      track: "문과",
      confidence: "high",
    },
  },
  {
    name: "예체능·예술형 (A·E, 창의성, 미디어 관심)",
    expectCats: ["04_예술_문화_미디어"],
    p: {
      source: "quick",
      holland: { primary: "A", secondary: "E" },
      aptitudes: ["색채지각력", "협응능력", "언어력"],
      values: ["창의성", "자율성", "성취"],
      interestCategories: ["04_예술_문화_미디어"],
      favoriteSubjects: ["미술", "음악"],
      grade: 3,
      track: "예체능",
      confidence: "high",
    },
  },
];

let failures = 0;

for (const { name, expectCats, p } of profiles) {
  const top = prefilterCandidates(data.jobs, p, 10);
  console.log(`\n=== ${name} ===`);
  for (const sj of top) {
    console.log(
      `  ${toMatchingPercent(sj.score)}% [${sj.score}] ${sj.job.categoryName} | ${sj.job.name}`,
    );
  }
  console.log(`  예시 사유: ${templateReason(top[0], p)}`);

  // 상위 10개 중 기대 분야 비율 ≥ 50%
  const hit = top.filter((sj) => expectCats.includes(sj.job.category)).length;
  if (hit < 5) {
    console.error(`  ✗ 기대 분야 비율 미달: ${hit}/10`);
    failures++;
  } else {
    console.log(`  ✓ 기대 분야 ${hit}/10`);
  }
  // 다양성: 상위 10개가 한 분야로만 쏠리지 않는지
  const cats = new Set(top.map((sj) => sj.job.category));
  if (cats.size < 2) {
    console.error(`  ✗ 분야 다양성 부족 (${cats.size}종)`);
    failures++;
  }
}

// '정보없음' 직업이 전부 하위로 밀리지 않는지: 탐구형 프로필 상위 30 안에 포함 여부
const p = profiles[0].p;
const top30 = prefilterCandidates(data.jobs, p, 30);
const unknownCount = top30.filter((sj) => sj.job.salaryLevel === "정보없음").length;
console.log(`\n'정보없음' 연봉 직업 상위 30 내 포함: ${unknownCount}개`);
if (unknownCount === 0) {
  console.error("✗ 정보없음 직업이 전부 배제됨 — 중립 처리 확인 필요");
  failures++;
}

if (failures > 0) {
  console.error(`\n실패 ${failures}건`);
  process.exit(1);
}
console.log("\n모든 검증 통과 ✓");
