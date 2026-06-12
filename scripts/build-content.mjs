// jobs/**/*.md → data/content/{job_id}.md
// 직업백과 본문에서 말미 "AI 진로 추천 메타데이터" 섹션(YAML 블록)을 제거하고
// job_id 기준 파일로 저장한다. 직업 상세 페이지(SSG)와 AI 보고서/상담의 근거 자료로 사용.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const JOBS_DIR = path.join(ROOT, "jobs");
const OUT_DIR = path.join(ROOT, "data", "content");

mkdirSync(OUT_DIR, { recursive: true });

let count = 0;
const errors = [];
const seen = new Map(); // job_id → source file (중복 감지)

for (const category of readdirSync(JOBS_DIR)) {
  const catPath = path.join(JOBS_DIR, category);
  if (!statSync(catPath).isDirectory()) continue;

  for (const file of readdirSync(catPath)) {
    if (!file.endsWith(".md")) continue;
    const fullPath = path.join(catPath, file);
    const text = readFileSync(fullPath, "utf-8");

    const idMatch = text.match(/^job_id:\s*"?(\d+)"?/m);
    if (!idMatch) {
      errors.push(`job_id 없음: ${category}/${file}`);
      continue;
    }
    const jobId = idMatch[1];

    if (seen.has(jobId)) {
      errors.push(`job_id 중복 ${jobId}: ${category}/${file} ↔ ${seen.get(jobId)}`);
      continue;
    }
    seen.set(jobId, `${category}/${file}`);

    // 말미 메타데이터 섹션 제거 (--- 구분선 포함)
    const body = text
      .replace(/\n-{3,}\s*\n+## AI 진로 추천 메타데이터[\s\S]*$/, "")
      .replace(/\n## AI 진로 추천 메타데이터[\s\S]*$/, "")
      .trimEnd() + "\n";

    writeFileSync(path.join(OUT_DIR, `${jobId}.md`), body, "utf-8");
    count++;
  }
}

console.log(`생성: ${count}개 → ${OUT_DIR}`);
if (errors.length) {
  console.error(`오류 ${errors.length}건:`);
  for (const e of errors) console.error("  -", e);
  process.exitCode = 1;
}
