import "server-only";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import type { Job, JobsFile } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

let fileCache: JobsFile | null = null;
let byId: Map<string, Job> | null = null;

export function loadJobs(): JobsFile {
  if (!fileCache) {
    const raw = readFileSync(path.join(DATA_DIR, "jobs.json"), "utf-8");
    fileCache = JSON.parse(raw) as JobsFile;
  }
  return fileCache;
}

export function getAllJobs(): Job[] {
  return loadJobs().jobs;
}

export function getJob(id: string): Job | undefined {
  if (!byId) {
    byId = new Map(loadJobs().jobs.map((j) => [j.id, j]));
  }
  return byId.get(id);
}

/** 직업백과 본문 md (YAML 메타데이터 제거본) — 상세 페이지·AI 근거용 */
export function getJobContent(id: string): string | null {
  if (!/^\d+$/.test(id)) return null;
  const p = path.join(DATA_DIR, "content", `${id}.md`);
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf-8");
}
