"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { store } from "@/lib/storage";
import { HOLLAND_CODES, HOLLAND_INFO } from "@/lib/types";
import type { CareerReport, Recommendation, StudentProfile, HollandCode } from "@/lib/types";
import {
  Printer,
  Save,
  RefreshCw,
  ChevronLeft,
  AlertTriangle,
  Award,
  BookOpen,
  GraduationCap,
  Sparkles,
  Activity,
  FileText,
  Search,
  Compass,
  Briefcase,
  CheckCircle,
  HelpCircle,
  Wrench,
  Microscope,
  Palette,
  HeartHandshake,
  ClipboardList,
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
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
          <FileText className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-xl font-extrabold text-slate-900">보고서를 만들기 위한 데이터가 부족합니다</h1>
        <p className="mt-2 text-sm text-slate-400">먼저 진로 탐색 분석을 완료해 주세요.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-450 px-6 py-3 text-sm font-bold text-white shadow-md shadow-pink-500/10 transition duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          진로 탐색 시작하기
          <ChevronLeft className="h-4 w-4 rotate-180" />
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-pink-500" />
        <h1 className="mt-6 text-xl font-extrabold text-slate-900">AI 심층 진로 보고서 작성 중</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 font-medium">
          학생의 프로필과 직업백과 데이터베이스를 교차 분석하여<br />학년별 학습 경로와 맞춤 로드맵을 작성하고 있습니다.<br />잠시만 기다려 주세요.
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-xl font-extrabold text-slate-900">보고서 작성에 실패했습니다</h1>
        <p className="mt-2 text-sm text-red-600 font-semibold">{error}</p>
        <button
          type="button"
          onClick={() => generate(profile, recs)}
          className="mt-6 rounded-full bg-pink-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-pink-500/10 transition hover:bg-pink-600 hover:scale-102 active:scale-98"
        >
          다시 요청하기
        </button>
      </div>
    );
  }

  const scores = profile.holland.scores;
  const date = new Date(report.generatedAt);

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-12 print:px-0 print:py-0">
        {/* 보고서 헤더 */}
        <header className="border-b-2 border-slate-900 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-slate-800">
              <Compass className="h-4.5 w-4.5 text-pink-500" />
              진로나침반 AI 리포트
            </div>
            <span className="text-xs font-semibold text-slate-400">
              발행일: {date.getFullYear()}년 {date.getMonth() + 1}월 {date.getDate()}일
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">진로 심층 분석 보고서</h1>
          
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <label className="flex items-center gap-2">
              <span className="font-bold text-slate-400">소속 학교</span>
              <input
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="학교명 입력"
                className="w-44 border-b border-slate-200 bg-transparent px-1 py-0.5 font-bold text-slate-800 placeholder:text-slate-300 focus:border-slate-900 focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="font-bold text-slate-400">학생 이름</span>
              <input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="이름 입력"
                className="w-32 border-b border-slate-200 bg-transparent px-1 py-0.5 font-bold text-slate-800 placeholder:text-slate-300 focus:border-slate-900 focus:outline-none"
              />
            </label>
            <span className="flex items-center gap-2">
              <span className="font-bold text-slate-400">대상 학년</span>
              <span className="font-extrabold text-slate-800">고등학교 {profile.grade}학년</span>
            </span>
          </div>
        </header>

        {/* 1. 내 유형 요약 */}
        <section className="print-break-avoid mt-10">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <User className="h-5.5 w-5.5 text-pink-500" />
            1. 학생 성향 및 Holland 유형 분석
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 font-medium">{report.profileSummary}</p>
          
          <div className="mt-5 rounded-2xl border border-pink-100/30 bg-pink-50/10 p-5">
            {scores && Object.keys(scores).length > 0 ? (
              <div className="space-y-3">
                {HOLLAND_CODES.filter((c) => scores[c] != null).map((c) => {
                  const Icon = HOLLAND_ICONS[c] || HelpCircle;
                  const isCore = c === profile.holland.primary || c === profile.holland.secondary;
                  return (
                    <div key={c} className="flex items-center gap-3 text-xs">
                      <span className="w-24 shrink-0 font-bold text-slate-600 flex items-center gap-1">
                        <Icon className={`h-3.5 w-3.5 ${isCore ? "text-pink-500" : "text-slate-400"}`} />
                        {HOLLAND_INFO[c].label}({c})
                      </span>
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200/50 p-0.5">
                        <div
                          className={`h-full rounded-full ${isCore ? "bg-pink-500" : "bg-slate-300"}`}
                          style={{ width: `${Math.min(100, scores[c]!)}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-extrabold text-slate-700">{scores[c]}점</span>
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
                      <div key={c} className="flex-1 rounded-2xl bg-white border border-pink-100/40 p-4 shadow-sm">
                        <span className="font-extrabold text-pink-700 bg-pink-50 border border-pink-100/50 rounded-full px-3 py-1 inline-flex items-center gap-1.5 text-xs">
                          <Icon className="h-3.5 w-3.5" />
                          {HOLLAND_INFO[c].label}({c})
                        </span>
                        <p className="mt-2.5 text-xs leading-relaxed text-slate-500 font-semibold">{HOLLAND_INFO[c].desc}</p>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-400 font-semibold">
            {report.hollandExplanation}
          </p>
        </section>

        {/* 2. 추천 직업 + 학습 가이드 */}
        <section className="mt-10">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Award className="h-5.5 w-5.5 text-blue-600" />
            2. 추천 직업과 교과 학습 가이드
          </h2>
          <div className="mt-4 space-y-6">
            {report.topJobs.map((j, i) => (
              <div
                key={j.jobId}
                className="print-break-avoid rounded-2xl border border-slate-200/80 p-5 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    {j.name}
                  </h3>
                  <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-0.5 text-xs font-bold text-blue-700">
                    매칭율 {j.matching}%
                  </span>
                </div>
                <p className="mt-3.5 text-xs leading-relaxed text-slate-500 font-semibold">{j.whyFit}</p>

                <div className="mt-5 grid gap-4 text-xs sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                    <div className="font-extrabold text-blue-700 flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      학년별 지향 선택과목
                    </div>
                    <ul className="mt-3 space-y-2 text-slate-600 font-semibold">
                      <li className="flex gap-1.5">
                        <b className="text-slate-400 shrink-0">1학년:</b> {j.studyGuide.highSchoolSubjects.grade1.join(", ") || "공통 과목"}
                      </li>
                      <li className="flex gap-1.5">
                        <b className="text-slate-400 shrink-0">2학년:</b> {j.studyGuide.highSchoolSubjects.grade2.join(", ") || "일반 선택"}
                      </li>
                      <li className="flex gap-1.5">
                        <b className="text-slate-400 shrink-0">3학년:</b> {j.studyGuide.highSchoolSubjects.grade3.join(", ") || "진로/전문 선택"}
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 flex flex-col justify-between">
                    <div>
                      <div className="font-extrabold text-indigo-700 flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        추천 대학 전공
                      </div>
                      <p className="mt-2 text-slate-600 font-bold">
                        {j.studyGuide.majors.join(", ") || "진출 전공 정보 없음"}
                      </p>
                    </div>
                    {j.studyGuide.certificates.length > 0 && (
                      <div className="border-t border-slate-200/60 pt-2.5 mt-2.5">
                        <div className="font-extrabold text-slate-500 text-[10px] uppercase tracking-wider">추천 자격증</div>
                        <p className="mt-1 text-[11px] text-slate-600 font-semibold">
                          {j.studyGuide.certificates.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {j.studyGuide.activities.length > 0 && (
                  <div className="mt-4 rounded-xl bg-emerald-50/50 border border-emerald-100 p-4 text-xs">
                    <div className="font-extrabold text-emerald-800 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      권장되는 교내외 활동
                    </div>
                    <ul className="mt-2.5 list-disc space-y-1 pl-4.5 text-slate-600 font-semibold">
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
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Activity className="h-5.5 w-5.5 text-pink-500" />
            3. 고등학교 3개년 학업 로드맵
          </h2>
          <div className="mt-5 space-y-0 pl-1">
            {([1, 2, 3] as const).map((g) => (
              <div key={g} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      g === profile.grade
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    고{g}
                  </div>
                  {g < 3 && <div className="w-0.5 flex-1 bg-slate-200 my-1" />}
                </div>
                <p className="pb-6 pt-1 text-sm leading-relaxed text-slate-600 font-semibold">
                  {report.roadmap[`grade${g}` as const]}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 수능 전략 */}
        <section className="print-break-avoid mt-6 rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
          <h2 className="text-sm font-extrabold text-amber-800 flex items-center gap-1.5">
            <Target className="h-4.5 w-4.5 text-amber-600" />
            수능 시험 전략
          </h2>
          <p className="mt-2.5 text-xs leading-relaxed text-slate-600 font-semibold">{report.examStrategy}</p>
        </section>

        {/* 마무리 조언 */}
        <section className="print-break-avoid mt-4 rounded-2xl bg-pink-50/20 border border-pink-100 p-5">
          <p className="text-xs leading-relaxed text-slate-600 font-semibold">
            <Sparkles className="h-4.5 w-4.5 text-pink-500 inline mr-1.5 align-text-bottom" />
            {report.closingAdvice}
          </p>
        </section>

        {/* 교사 메모란 */}
        <section className="print-break-avoid mt-10">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">교사 평가 및 상담 기록란</h2>
          <div className="mt-2.5 h-32 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30" />
        </section>

        <footer className="mt-12 border-t border-slate-100 pt-6 text-center text-[10px] font-semibold text-slate-400 leading-normal">
          본 리포트는 진로나침반 AI 엔진에 의해 직업백과 579개 전문 정보 기반으로 생성되었습니다.<br />
          최종 진로 및 과목 결정 시에는 담임교사 혹은 진로 진학 상담교사와의 심층 면담을 권장합니다.
        </footer>

        {/* 액션 버튼 (인쇄 시 숨김) */}
        <div className="print-hidden mt-12 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-full bg-slate-900 px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Printer className="h-4 w-4" />
            리포트 인쇄
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-full bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
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
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-6 py-3 text-xs font-bold text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-800 hover:scale-[1.02] active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            리포트 다시 생성
          </button>
          <Link
            href="/results"
            className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-6 py-3 text-xs font-bold text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-800 hover:scale-[1.02] active:scale-[0.98]"
          >
            <ChevronLeft className="h-4 w-4" />
            결과로 돌아가기
          </Link>
        </div>
        <p className="print-hidden mt-4 text-center text-[10px] font-semibold text-slate-400">
          💡 PDF 저장 가이드: 인쇄 설정 창의 대상 프린터에서 &quot;PDF로 저장&quot;을 선택해 주세요.
        </p>
      </div>
    </div>
  );
}
