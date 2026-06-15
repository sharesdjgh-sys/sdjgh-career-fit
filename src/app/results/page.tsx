"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { store } from "@/lib/storage";
import { HOLLAND_INFO } from "@/lib/types";
import type { IndicatorLevel, Recommendation, StudentProfile, HollandCode } from "@/lib/types";
import { CATEGORY_ICONS, categoryColor } from "@/lib/categories";
import {
  Compass,
  Camera,
  PenTool,
  MessageSquare,
  FileText,
  AlertTriangle,
  Trophy,
  ChevronRight,
  ChevronDown,
  Wrench,
  Microscope,
  Palette,
  HeartHandshake,
  Briefcase,
  ClipboardList,
  Laptop,
  HelpCircle,
} from "lucide-react";

const LEVEL_ORDER: Record<IndicatorLevel, number> = {
  높음: 3,
  보통: 2,
  정보없음: 1,
  낮음: 0,
};

type SortKey = "matching" | "salary" | "growth";

// Holland 유형 아이콘 매핑
const HOLLAND_ICONS: Record<HollandCode, React.ComponentType<{ className?: string }>> = {
  R: Wrench,
  I: Microscope,
  A: Palette,
  S: HeartHandshake,
  E: Briefcase,
  C: ClipboardList,
};

export default function ResultsPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [recs, setRecs] = useState<Recommendation[] | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<string>("전체");
  const [sort, setSort] = useState<SortKey>("matching");

  useEffect(() => {
    setProfile(store.getProfile());
    setRecs(store.getRecommendations());
    setLoaded(true);
  }, []);

  const categories = useMemo(
    () => ["전체", ...new Set((recs ?? []).map((r) => r.categoryName))],
    [recs],
  );

  const visible = useMemo(() => {
    let list = recs ?? [];
    if (filter !== "전체") list = list.filter((r) => r.categoryName === filter);
    if (sort === "salary") {
      list = [...list].sort((a, b) => LEVEL_ORDER[b.salaryLevel] - LEVEL_ORDER[a.salaryLevel]);
    } else if (sort === "growth") {
      list = [...list].sort(
        (a, b) => LEVEL_ORDER[b.growthPotential] - LEVEL_ORDER[a.growthPotential],
      );
    } else {
      list = [...list].sort((a, b) => b.matching - a.matching);
    }
    return list;
  }, [recs, filter, sort]);

  if (!loaded) return null;

  if (!profile || !recs || recs.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
          <Compass className="h-6 w-6" strokeWidth={2} />
        </div>
        <h2 className="mt-5 text-lg font-bold text-ink">아직 추천 결과가 없어요</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          검사 결과지 사진을 분석하거나 간편 입력으로 진로 매칭 탐색을 시작해 보세요.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/input/photo"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/15 transition duration-200 hover:bg-primary-600 active:scale-[0.98]"
          >
            <Camera className="h-4 w-4" />
            사진 분석
          </Link>
          <Link
            href="/input/quick"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-6 py-3 text-sm font-bold text-ink shadow-xs transition duration-200 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 active:scale-[0.98]"
          >
            <PenTool className="h-4 w-4" />
            간편 입력
          </Link>
        </div>
      </div>
    );
  }

  const h = profile.holland;
  const pInfo = HOLLAND_INFO[h.primary];
  const sInfo = h.secondary ? HOLLAND_INFO[h.secondary] : null;

  const PrimaryIcon = HOLLAND_ICONS[h.primary] || HelpCircle;
  const SecondaryIcon = h.secondary ? HOLLAND_ICONS[h.secondary] : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 pb-32">
      {/* 프로필 요약 카드 */}
      <section className="flex flex-col justify-between gap-6 rounded-xl border border-line bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div className="flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight text-ink">
            나의 Holland 유형
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
              <PrimaryIcon className="h-3.5 w-3.5" />
              {pInfo.label}({h.primary})
            </span>
            {sInfo && h.secondary && SecondaryIcon && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-100 px-3 py-1 text-xs font-bold text-secondary-700">
                <SecondaryIcon className="h-3.5 w-3.5" />
                {sInfo.label}({h.secondary})
              </span>
            )}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{pInfo.desc}</p>
          {profile.aptitudes.length > 0 && (
            <p className="mt-2 text-xs font-medium text-ink-lighter">
              강점 적성: <span className="font-semibold text-ink">{profile.aptitudes.join(" · ")}</span>
            </p>
          )}
        </div>
        <Link
          href={profile.source === "photo" ? "/input/photo" : "/input/quick"}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-line-strong bg-white px-5 py-2.5 text-xs font-bold text-ink shadow-xs transition duration-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 active:scale-[0.98] md:self-center"
        >
          정보 다시 입력
        </Link>
      </section>

      {profile.warnings && profile.warnings.length > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-warning-bg p-4 text-xs font-semibold text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <div className="space-y-1">
            {profile.warnings.map((w, i) => (
              <p key={i}>{w}</p>
            ))}
          </div>
        </div>
      )}

      {/* 필터 바 */}
      <section className="mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={
                filter === c
                  ? "rounded-full bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary-500/15 transition duration-200"
                  : "rounded-full border border-line bg-white px-4 py-2 text-xs font-bold text-ink-soft transition duration-200 hover:border-primary-300 hover:text-primary-600"
              }
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative self-end sm:self-auto">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="appearance-none rounded-lg border border-line-strong bg-white px-4 py-2.5 pr-10 text-xs font-semibold text-ink shadow-xs transition duration-200 focus:border-primary-500 focus:outline-none focus:ring-[3px] focus:ring-primary-500/15"
          >
            <option value="matching">매칭도 높은 순</option>
            <option value="salary">평균 연봉 높은 순</option>
            <option value="growth">발전가능성 높은 순</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-lighter" />
        </div>
      </section>

      {/* 직업 카드 그리드 */}
      <section className="mt-6 grid gap-5 sm:grid-cols-2">
        {visible.map((r, i) => {
          const CategoryIcon = CATEGORY_ICONS[r.categoryName] || Laptop;
          const matchHigh = r.matching >= 90;
          const { accent, tint } = categoryColor(r.categoryName);
          return (
            <div
              key={r.jobId}
              style={{ borderLeftColor: accent, borderLeftWidth: 4, backgroundColor: tint }}
              className="flex h-full flex-col rounded-xl border border-line p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-lighter">
                    <CategoryIcon className="h-3.5 w-3.5" style={{ color: accent }} />
                    <span>{r.categoryName}</span>
                  </div>
                  <h2 className="mt-1 flex items-center gap-1.5 text-lg font-bold text-ink">
                    {i < 3 && sort === "matching" && filter === "전체" && (
                      <Trophy className="h-4 w-4 shrink-0 text-primary-500" />
                    )}
                    {r.name}
                  </h2>
                </div>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                    matchHigh
                      ? "bg-primary-500 text-white"
                      : "bg-primary-100 text-primary-600"
                  }`}
                >
                  {r.matching}%
                </div>
              </div>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{r.reason}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
                  {r.collegeTrack}
                </span>
                {r.salaryLevel === "높음" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1 text-xs font-bold text-success">
                    연봉 높음
                  </span>
                )}
                {r.growthPotential === "높음" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-info-bg px-3 py-1 text-xs font-bold text-info">
                    발전가능성 높음
                  </span>
                )}
                {r.jobStability === "높음" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-50 px-3 py-1 text-xs font-semibold text-ink-soft">
                    고용 안정
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                <span className="text-xs font-medium text-ink-lighter">{r.jobType}</span>
                <Link
                  href={`/jobs/${r.jobId}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 transition hover:text-primary-700"
                >
                  자세히 보기
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </section>

      {/* 하단 고정 액션 바 */}
      <div className="print-hidden pointer-events-none fixed inset-x-0 bottom-6 z-40">
        <div className="pointer-events-auto mx-auto flex max-w-lg justify-center gap-3 px-6">
          <Link
            href="/chat"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-5 py-3 text-sm font-bold text-ink shadow-md transition duration-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 active:scale-[0.98]"
          >
            <MessageSquare className="h-4 w-4 text-primary-500" />
            AI 상담사 질문
          </Link>
          <Link
            href="/report"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/15 transition duration-200 hover:bg-primary-600 active:scale-[0.98]"
          >
            <FileText className="h-4 w-4" />
            AI 분석 보고서 생성
          </Link>
        </div>
      </div>
    </div>
  );
}
