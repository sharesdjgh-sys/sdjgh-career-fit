// 클라이언트 전용 — 학생 데이터는 브라우저에만 저장한다 (서버 무저장 원칙)
import type { CareerReport, ChatMessage, Recommendation, StudentProfile } from "./types";

const KEYS = {
  profile: "jinro.profile.v1",
  recommendations: "jinro.recommendations.v1",
  report: "jinro.report.v1",
  chat: "jinro.chat.v1",
} as const;

function read<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(storage: Storage, key: string, value: unknown) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패(용량 초과 등)는 치명적이지 않음 — 무시
  }
}

export const store = {
  getProfile: () => read<StudentProfile>(localStorage, KEYS.profile),
  setProfile: (p: StudentProfile) => write(localStorage, KEYS.profile, p),

  getRecommendations: () => read<Recommendation[]>(localStorage, KEYS.recommendations),
  setRecommendations: (r: Recommendation[]) => write(localStorage, KEYS.recommendations, r),

  getReport: () => read<CareerReport>(localStorage, KEYS.report),
  setReport: (r: CareerReport) => write(localStorage, KEYS.report, r),
  clearReport: () => localStorage.removeItem(KEYS.report),

  getChat: () => read<ChatMessage[]>(sessionStorage, KEYS.chat),
  setChat: (m: ChatMessage[]) => write(sessionStorage, KEYS.chat, m),

  clearAll: () => {
    for (const k of Object.values(KEYS)) {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    }
  },
};
