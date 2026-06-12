"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Markdown from "@/components/Markdown";
import { store } from "@/lib/storage";
import { HOLLAND_CODES, HOLLAND_INFO } from "@/lib/types";
import type { CareerReport, Recommendation, StudentProfile, HollandCode } from "@/lib/types";
import {
  Printer,
  Save,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Award,
  BookOpen,
  GraduationCap,
  Sparkles,
  Activity,
  FileText,
  Compass,
  Briefcase,
  CheckCircle,
  HelpCircle,
  Wrench,
  Microscope,
  Palette,
  HeartHandshake,
  ClipboardList,
  Loader2,
  User,
  Target
} from "lucide-react";

// Holland 유형 아이콘 매핑
const HOLLAND_ICONS: Record<HollandCode, React.ComponentType<{ className?: string }>> = {
  R: Wrench,
  I: Microscope,
  A: Palette,
  S: HeartHandshake,
  E: Briefcase,
  C: ClipboardList,
};

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
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
          <FileText className="h-6 w-6" strokeWidth={2} />
        </div>
        <h1 className="mt-5 text-lg font-bold text-ink">보고서를 만들 데이터가 아직 없어요</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">먼저 진로 탐색 분석을 완료해 주세요.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/15 transition duration-200 hover:bg-primary-600 active:scale-[0.98]"
          >
            진로 탐색 시작하기
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <h1 className="text-lg font-bold text-ink">AI 심층 진로 보고서 작성 중</h1>
        <p className="text-center text-sm leading-relaxed text-ink-soft">
          학생의 프로필과 직업백과 데이터베이스를 교차 분석하여<br />학년별 학습 경로와 맞춤 로드맵을 작성하고 있습니다.<br />잠시만 기다려 주세요.
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-error-bg text-error">
          <AlertTriangle className="h-6 w-6" strokeWidth={2} />
        </div>
        <h1 className="mt-5 text-lg font-bold text-ink">보고서 작성에 실패했습니다</h1>
        <p className="mt-2 text-sm font-semibold text-error">{error}</p>
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => generate(profile, recs)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/15 transition duration-200 hover:bg-primary-600 active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            다시 요청하기
          </button>
        </div>
      </div>
    );
  }

  const scores = profile.holland.scores;
  const date = new Date(report.generatedAt);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12 print:px-0 print:py-0">
        {/* 보고서 헤더 */}
        <header className="border-b-2 border-ink pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-ink">
              <Compass className="h-4.5 w-4.5 text-primary-500" strokeWidth={2.2} />
              진로나침반 AI 리포트
            </div>
            <span className="text-xs font-medium text-ink-lighter">
              발행일: {date.getFullYear()}년 {date.getMonth() + 1}월 {date.getDate()}일
            </span>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl">진로 심층 분석 보고서</h1>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-xs font-semibold text-ink-soft">소속 학교</span>
              <input
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="학교명 입력"
                className="w-44 border-b border-line-strong bg-transparent px-1 py-0.5 font-bold text-ink placeholder:text-ink-lighter transition duration-200 focus:border-primary-500 focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-xs font-semibold text-ink-soft">학생 이름</span>
              <input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="이름 입력"
                className="w-32 border-b border-line-strong bg-transparent px-1 py-0.5 font-bold text-ink placeholder:text-ink-lighter transition duration-200 focus:border-primary-500 focus:outline-none"
              />
            </label>
            <span className="flex items-center gap-2">
              <span className="text-xs font-semibold text-ink-soft">대상 학년</span>
              <span className="font-bold text-ink">고등학교 {profile.grade}학년</span>
            </span>
          </div>
        </header>

        {/* 1. 내 유형 요약 */}
        <section className="print-break-avoid mt-10">
          <h2 className="flex items-center gap-1.5 text-lg font-bold text-ink">
            <User className="h-5 w-5 text-primary-500" strokeWidth={2} />
            1. 학생 성향 및 Holland 유형 분석
          </h2>
          <Markdown className="mt-3 text-sm leading-relaxed text-ink-soft">{report.profileSummary}</Markdown>

          <div className="mt-5 rounded-xl border border-line bg-white p-5 shadow-sm">
            {scores && Object.keys(scores).length > 0 ? (
              <div className="space-y-3">
                {HOLLAND_CODES.filter((c) => scores[c] != null).map((c) => {
                  const Icon = HOLLAND_ICONS[c] || HelpCircle;
                  const isCore = c === profile.holland.primary || c === profile.holland.secondary;
                  return (
                    <div key={c} className="flex items-center gap-3 text-xs">
                      <span className="flex w-24 shrink-0 items-center gap-1 font-semibold text-ink-soft">
                        <Icon className={`h-3.5 w-3.5 ${isCore ? "text-primary-500" : "text-ink-lighter"}`} />
                        {HOLLAND_INFO[c].label}({c})
                      </span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-100">
                        <div
                          className={`h-full rounded-full ${isCore ? "bg-primary-500" : "bg-line-strong"}`}
                          style={{ width: `${Math.min(100, scores[c]!)}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-bold text-ink">{scores[c]}점</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {[profile.holland.primary, profile.holland.secondary]
                  .filter((c): c is NonNullable<typeof c> => c != null)
                  .map((c) => {
                    const Icon = HOLLAND_ICONS[c] || HelpCircle;
                    return (
                      <div key={c} className="flex-1 rounded-xl border border-line bg-white p-4 shadow-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
                          <Icon className="h-3.5 w-3.5" />
                          {HOLLAND_INFO[c].label}({c})
                        </span>
                        <p className="mt-2.5 text-xs leading-relaxed text-ink-soft">{HOLLAND_INFO[c].desc}</p>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
          <Markdown className="mt-4 text-xs leading-relaxed text-ink-lighter">
            {report.hollandExplanation}
          </Markdown>
        </section>

        {/* 2. 추천 직업 + 학습 가이드 */}
        <section className="mt-10">
          <h2 className="flex items-center gap-1.5 text-lg font-bold text-ink">
            <Award className="h-5 w-5 text-primary-500" strokeWidth={2} />
            2. 추천 직업과 교과 학습 가이드
          </h2>
          <div className="mt-4 space-y-6">
            {report.topJobs.map((j, i) => (
              <div
                key={j.jobId}
                className="print-break-avoid rounded-xl border border-line bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <h3 className="flex items-center gap-2 text-base font-bold text-ink">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    {j.name}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
                    매칭율 {j.matching}%
                  </span>
                </div>
                <Markdown className="mt-3.5 text-sm leading-relaxed text-ink-soft">{j.whyFit}</Markdown>

                <div className="mt-5 grid gap-4 text-xs sm:grid-cols-2">
                  <div className="rounded-lg border border-line bg-surface-50 p-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                      <BookOpen className="h-4 w-4 text-secondary-600" strokeWidth={2} />
                      학년별 지향 선택과목
                    </div>
                    <ul className="mt-3 space-y-2 text-ink-soft">
                      <li className="flex gap-1.5">
                        <b className="shrink-0 font-semibold text-ink-lighter">1학년:</b> {j.studyGuide.highSchoolSubjects.grade1.join(", ") || "공통 과목"}
                      </li>
                      <li className="flex gap-1.5">
                        <b className="shrink-0 font-semibold text-ink-lighter">2학년:</b> {j.studyGuide.highSchoolSubjects.grade2.join(", ") || "일반 선택"}
                      </li>
                      <li className="flex gap-1.5">
                        <b className="shrink-0 font-semibold text-ink-lighter">3학년:</b> {j.studyGuide.highSchoolSubjects.grade3.join(", ") || "진로/전문 선택"}
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-col justify-between rounded-lg border border-line bg-surface-50 p-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                        <GraduationCap className="h-4 w-4 text-secondary-600" strokeWidth={2} />
                        추천 대학 전공
                      </div>
                      <p className="mt-2 font-semibold text-ink-soft">
                        {j.studyGuide.majors.join(", ") || "진출 전공 정보 없음"}
                      </p>
                    </div>
                    {j.studyGuide.certificates.length > 0 && (
                      <div className="mt-2.5 border-t border-line pt-2.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-ink-lighter">추천 자격증</div>
                        <p className="mt-1 text-[11px] text-ink-soft">
                          {j.studyGuide.certificates.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {j.studyGuide.activities.length > 0 && (
                  <div className="mt-4 rounded-lg border border-line bg-surface-50 p-4 text-xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                      <CheckCircle className="h-4 w-4 text-secondary-600" strokeWidth={2} />
                      권장되는 교내외 활동
                    </div>
                    <ul className="mt-2.5 list-disc space-y-1 pl-4.5 text-ink-soft">
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
        <section className="print-break-avoid mt-10">
          <h2 className="flex items-center gap-1.5 text-lg font-bold text-ink">
            <Activity className="h-5 w-5 text-primary-500" strokeWidth={2} />
            3. 고등학교 3개년 학업 로드맵
          </h2>
          <div className="mt-5 space-y-0 pl-1">
            {([1, 2, 3] as const).map((g) => (
              <div key={g} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      g === profile.grade
                        ? "bg-primary-500 text-white"
                        : "border border-line bg-surface-100 text-ink-lighter"
                    }`}
                  >
                    고{g}
                  </div>
                  {g < 3 && <div className="my-1 w-0.5 flex-1 bg-line" />}
                </div>
                <Markdown className="pb-6 pt-1 text-sm leading-relaxed text-ink-soft">
                  {report.roadmap[`grade${g}` as const]}
                </Markdown>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 수능 전략 */}
        <section className="print-break-avoid mt-6 rounded-xl border border-line bg-surface-50 p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <Target className="h-4.5 w-4.5 text-primary-600" strokeWidth={2} />
            수능 시험 전략
          </h2>
          <Markdown className="mt-2.5 text-xs leading-relaxed text-ink-soft">{report.examStrategy}</Markdown>
        </section>

        {/* 마무리 조언 */}
        <section className="print-break-avoid mt-4 rounded-xl bg-primary-50 p-5">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary-500" />
            <Markdown className="text-xs leading-relaxed text-ink-soft">{report.closingAdvice}</Markdown>
          </div>
        </section>

        {/* 교사 메모란 */}
        <section className="print-break-avoid mt-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-lighter">교사 평가 및 상담 기록란</h2>
          <div className="mt-2.5 h-32 rounded-xl border border-dashed border-line-strong bg-surface-50" />
        </section>

        <footer className="mt-12 border-t border-line pt-6 text-center text-[10px] font-medium leading-normal text-ink-lighter">
          본 리포트는 진로나침반 AI 엔진에 의해 직업백과 579개 전문 정보 기반으로 생성되었습니다.<br />
          최종 진로 및 과목 결정 시에는 담임교사 혹은 진로 진학 상담교사와의 심층 면담을 권장합니다.
        </footer>

        {/* 액션 버튼 (인쇄 시 숨김) */}
        <div className="print-hidden mt-12 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/15 transition duration-200 hover:bg-primary-600 active:scale-[0.98]"
          >
            <Printer className="h-4 w-4" />
            리포트 인쇄
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-6 py-3 text-sm font-bold text-ink shadow-xs transition duration-200 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 active:scale-[0.98]"
            title="인쇄 대화상자에서 'PDF로 저장'을 선택하세요"
          >
            <Save className="h-4 w-4" />
            PDF로 저장
          </button>
          <button
            type="button"
            onClick={() => {
              store.clearReport();
              void generate(profile, recs);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-6 py-3 text-sm font-bold text-ink shadow-xs transition duration-200 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            리포트 다시 생성
          </button>
          <Link
            href="/results"
            className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-primary-600 transition duration-200 hover:bg-primary-50 hover:text-primary-700"
          >
            <ChevronLeft className="h-4 w-4" />
            결과로 돌아가기
          </Link>
        </div>
        <p className="print-hidden mt-4 text-center text-xs font-medium text-ink-lighter">
          PDF 저장 가이드: 인쇄 설정 창의 대상 프린터에서 &quot;PDF로 저장&quot;을 선택해 주세요.
        </p>
      </div>
    </div>
  );
}
