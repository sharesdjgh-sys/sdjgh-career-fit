"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { store } from "@/lib/storage";
import { HOLLAND_CODES, HOLLAND_INFO } from "@/lib/types";
import type { CareerReport, Recommendation, StudentProfile } from "@/lib/types";

export default function ReportPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [recs, setRecs] = useState<Recommendation[] | null>(null);
  const [report, setReport] = useState<CareerReport | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [schoolName, setSchoolName] = useState("");

  const generate = useCallback(
    async (p: StudentProfile, r: Recommendation[]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile: p,
            recommendations: r.map(({ jobId, name, matching, reason }) => ({
              jobId,
              name,
              matching,
              reason,
            })),
          }),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error ?? "보고서 생성에 실패했어요.");
        setReport(data.report);
        store.setReport(data.report);
      } catch (e) {
        setError(e instanceof Error ? e.message : "보고서 생성에 실패했어요.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const p = store.getProfile();
    const r = store.getRecommendations();
    const cached = store.getReport();
    setProfile(p);
    setRecs(r);
    if (cached) setReport(cached);
    setLoaded(true);
    if (!cached && p && r && r.length > 0) void generate(p, r);
  }, [generate]);

  if (!loaded) return null;

  if (!profile || !recs || recs.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="text-4xl">📄</div>
        <h1 className="mt-4 text-xl font-bold">보고서를 만들려면 먼저 진로 탐색이 필요해요</h1>
        <Link
          href="/"
          className="mt-6 inline-block rounded-btn bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
        >
          진로 탐색 시작하기
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary-light border-t-primary" />
        <h1 className="mt-6 text-xl font-bold">AI가 분석 보고서를 작성하고 있어요</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          추천 직업의 직업백과 자료를 바탕으로 학습 가이드와 로드맵을 만들고 있어요.
          <br />
          최대 1분 정도 걸릴 수 있어요. 잠시만 기다려주세요 ☕
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="text-4xl">😢</div>
        <h1 className="mt-4 text-xl font-bold">보고서 생성에 실패했어요</h1>
        <p className="mt-2 text-sm text-ink-soft">{error}</p>
        <button
          type="button"
          onClick={() => generate(profile, recs)}
          className="mt-6 rounded-btn bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
        >
          다시 시도하기
        </button>
      </div>
    );
  }

  const scores = profile.holland.scores;
  const date = new Date(report.generatedAt);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-10 print:px-0 print:py-0">
        {/* 보고서 헤더 */}
        <header className="border-b-2 border-primary pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-black text-primary">
              🧭 진로나침반
            </div>
            <span className="text-sm text-ink-soft">
              {date.getFullYear()}년 {date.getMonth() + 1}월 {date.getDate()}일
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-black">진로 탐색 결과 리포트</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-ink-soft">학교</span>
              <input
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="학교명 입력"
                className="w-44 border-b border-slate-300 bg-transparent px-1 py-0.5 focus:border-primary focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-ink-soft">이름</span>
              <input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="이름 입력"
                className="w-32 border-b border-slate-300 bg-transparent px-1 py-0.5 focus:border-primary focus:outline-none"
              />
            </label>
            <span className="flex items-center gap-2">
              <span className="text-ink-soft">학년</span>
              <span className="font-medium">고{profile.grade}</span>
            </span>
          </div>
        </header>

        {/* 1. 내 유형 요약 */}
        <section className="print-break-avoid mt-8">
          <h2 className="text-lg font-bold text-primary-dark">1. 나의 유형 분석</h2>
          <p className="mt-2 text-sm leading-relaxed">{report.profileSummary}</p>
          <div className="mt-4 rounded-card border border-slate-200 p-4">
            {scores && Object.keys(scores).length > 0 ? (
              <div className="space-y-2">
                {HOLLAND_CODES.filter((c) => scores[c] != null).map((c) => (
                  <div key={c} className="flex items-center gap-3 text-sm">
                    <span className="w-24 shrink-0 font-medium">
                      {HOLLAND_INFO[c].icon} {HOLLAND_INFO[c].label}({c})
                    </span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          c === profile.holland.primary || c === profile.holland.secondary
                            ? "bg-primary"
                            : "bg-slate-300"
                        }`}
                        style={{ width: `${Math.min(100, scores[c]!)}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-bold">{scores[c]}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {[profile.holland.primary, profile.holland.secondary]
                  .filter((c): c is NonNullable<typeof c> => c != null)
                  .map((c) => (
                    <div key={c} className="flex-1 rounded-btn bg-primary-light/60 p-3 text-sm">
                      <span className="font-bold text-primary-dark">
                        {HOLLAND_INFO[c].icon} {HOLLAND_INFO[c].label}({c})
                      </span>
                      <p className="mt-1 text-xs text-ink-soft">{HOLLAND_INFO[c].desc}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {report.hollandExplanation}
          </p>
        </section>

        {/* 2. 추천 직업 + 학습 가이드 */}
        <section className="mt-8">
          <h2 className="text-lg font-bold text-primary-dark">
            2. 추천 직업과 학습 가이드
          </h2>
          <div className="mt-3 space-y-5">
            {report.topJobs.map((j, i) => (
              <div
                key={j.jobId}
                className="print-break-avoid rounded-card border border-slate-200 p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold">
                    {["🥇", "🥈", "🥉", "4.", "5."][i]} {j.name}
                  </h3>
                  <span className="rounded-full bg-primary-light px-3 py-1 text-sm font-bold text-primary-dark">
                    매칭도 {j.matching}%
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{j.whyFit}</p>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-btn bg-surface p-3">
                    <div className="font-bold text-primary-dark">📚 학년별 추천 과목</div>
                    <ul className="mt-1.5 space-y-1 text-xs leading-relaxed">
                      <li>
                        <b>고1:</b> {j.studyGuide.highSchoolSubjects.grade1.join(", ") || "—"}
                      </li>
                      <li>
                        <b>고2:</b> {j.studyGuide.highSchoolSubjects.grade2.join(", ") || "—"}
                      </li>
                      <li>
                        <b>고3:</b> {j.studyGuide.highSchoolSubjects.grade3.join(", ") || "—"}
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-btn bg-surface p-3">
                    <div className="font-bold text-primary-dark">🎓 추천 전공</div>
                    <p className="mt-1.5 text-xs leading-relaxed">
                      {j.studyGuide.majors.join(", ") || "—"}
                    </p>
                    {j.studyGuide.certificates.length > 0 && (
                      <>
                        <div className="mt-2 font-bold text-primary-dark">📜 관련 자격증</div>
                        <p className="mt-1 text-xs leading-relaxed">
                          {j.studyGuide.certificates.join(", ")}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {j.studyGuide.activities.length > 0 && (
                  <div className="mt-3 rounded-btn bg-secondary-light/50 p-3 text-sm">
                    <div className="font-bold text-emerald-800">✨ 지금 해볼 수 있는 활동</div>
                    <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-xs leading-relaxed">
                      {j.studyGuide.activities.map((a, k) => (
                        <li key={k}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 3. 진로 로드맵 */}
        <section className="print-break-avoid mt-8">
          <h2 className="text-lg font-bold text-primary-dark">3. 고교 3년 로드맵</h2>
          <div className="mt-3 space-y-0">
            {([1, 2, 3] as const).map((g) => (
              <div key={g} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      g === profile.grade
                        ? "bg-primary text-white"
                        : "bg-primary-light text-primary-dark"
                    }`}
                  >
                    고{g}
                  </div>
                  {g < 3 && <div className="w-0.5 flex-1 bg-primary-light" />}
                </div>
                <p className="pb-5 pt-1.5 text-sm leading-relaxed">
                  {report.roadmap[`grade${g}` as const]}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 수능 전략 */}
        <section className="print-break-avoid mt-6 rounded-card border border-accent bg-accent-light/60 p-5">
          <h2 className="text-base font-bold text-amber-800">🎯 수능 선택과목 전략</h2>
          <p className="mt-2 text-sm leading-relaxed">{report.examStrategy}</p>
        </section>

        {/* 마무리 조언 */}
        <section className="print-break-avoid mt-6 rounded-card bg-primary-light/50 p-5">
          <p className="text-sm leading-relaxed">💙 {report.closingAdvice}</p>
        </section>

        {/* 교사 메모란 */}
        <section className="print-break-avoid mt-8">
          <h2 className="text-sm font-bold text-ink-soft">담임교사 / 진로상담 교사 메모</h2>
          <div className="mt-2 h-28 rounded-card border border-dashed border-slate-300" />
        </section>

        <footer className="mt-8 border-t border-slate-200 pt-4 text-center text-xs text-ink-soft">
          본 보고서는 직업백과 579개 직업 데이터와 AI 분석을 바탕으로 생성되었습니다. 최종
          진로 결정은 진로상담 교사와 상의해주세요.
        </footer>

        {/* 액션 버튼 (인쇄 시 숨김) */}
        <div className="print-hidden mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-btn bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
          >
            🖨️ 인쇄하기
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-btn bg-secondary px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-600"
            title="인쇄 대화상자에서 'PDF로 저장'을 선택하세요"
          >
            💾 PDF 저장
          </button>
          <button
            type="button"
            onClick={() => {
              store.clearReport();
              void generate(profile, recs);
            }}
            className="rounded-btn border border-slate-200 px-6 py-2.5 text-sm font-medium text-ink-soft hover:bg-slate-50"
          >
            🔄 보고서 다시 생성
          </button>
          <Link
            href="/results"
            className="rounded-btn border border-slate-200 px-6 py-2.5 text-sm font-medium text-ink-soft hover:bg-slate-50"
          >
            ← 추천 결과로
          </Link>
        </div>
        <p className="print-hidden mt-3 text-center text-xs text-ink-soft">
          💾 PDF 저장: 인쇄 창에서 대상을 &quot;PDF로 저장&quot;으로 선택하세요. 공용
          컴퓨터에서는 결과가 사라질 수 있으니 꼭 인쇄하거나 PDF로 저장해두세요.
        </p>
      </div>
    </div>
  );
}
