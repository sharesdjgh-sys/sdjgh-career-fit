"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { store } from "@/lib/storage";
import { HOLLAND_INFO } from "@/lib/types";
import type { IndicatorLevel, Recommendation, StudentProfile, HollandCode } from "@/lib/types";
import {
  Compass,
  Camera,
  PenTool,
  MessageSquare,
  FileText,
  AlertTriangle,
  Trophy,
  ChevronRight,
  Wrench,
  Microscope,
  Palette,
  HeartHandshake,
  Briefcase,
  ClipboardList,
  Laptop,
  HeartPulse,
  BookOpen,
  Coins,
  Settings,
  Sprout,
  Users,
  Utensils,
  Dumbbell,
  HelpCircle,
  TrendingUp,
  Building2,
  Scale
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

// 카테고리명 아이콘 매핑
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "IT·디지털기술": Laptop,
  "의료·보건": HeartPulse,
  "교육": BookOpen,
  "예술·문화·미디어": Palette,
  "경제·금융·법률": Coins,
  "공학·제조·건설": Settings,
  "환경·에너지·농업": Sprout,
  "공공·사회·복지": Users,
  "서비스·유통·음식": Utensils,
  "연구·과학": Microscope,
  "스포츠·레저": Dumbbell,
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
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
          <Compass className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-xl font-extrabold text-slate-900">아직 추천 결과가 없습니다</h1>
        <p className="mt-2 text-sm text-slate-400">
          검사 결과지 사진을 분석하거나 간편 입력으로 진로 매칭 탐색을 시작해 보세요.
        </p>
        <div className="mt-8 flex justify-center gap-3.5">
          <Link
            href="/input/photo"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 px-6 py-3 text-sm font-bold text-white shadow-md shadow-pink-500/10 transition duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Camera className="h-4.5 w-4.5" />
            사진 분석
          </Link>
          <Link
            href="/input/quick"
            className="flex items-center gap-2 rounded-full bg-white border border-pink-200 px-6 py-3 text-sm font-bold text-pink-600 shadow-sm transition duration-200 hover:scale-[1.02] hover:bg-pink-50/20 active:scale-[0.98]"
          >
            <PenTool className="h-4.5 w-4.5" />
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
    <div className="mx-auto max-w-5xl px-6 py-8 pb-32">
      {/* 프로필 요약 카드 (Double-Bezel 아키텍처) */}
      <section className="double-bezel">
        <div className="double-bezel-inner p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
              나의 Holland 유형:
              <span className="inline-flex items-center gap-1 text-pink-600 bg-pink-50 border border-pink-100/60 rounded-full px-3 py-0.5 text-sm font-bold">
                <PrimaryIcon className="h-3.5 w-3.5" />
                {pInfo.label}({h.primary})
              </span>
              {sInfo && h.secondary && SecondaryIcon && (
                <span className="inline-flex items-center gap-1 text-violet-600 bg-violet-50 border border-violet-100/60 rounded-full px-3 py-0.5 text-sm font-bold">
                  <SecondaryIcon className="h-3.5 w-3.5" />
                  {sInfo.label}({h.secondary})
                </span>
              )}
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-500">{pInfo.desc}</p>
            {profile.aptitudes.length > 0 && (
              <p className="mt-2 text-xs font-semibold text-slate-400">
                강점 적성: <span className="text-slate-700 font-bold">{profile.aptitudes.join(" · ")}</span>
              </p>
            )}
          </div>
          <Link
            href={profile.source === "photo" ? "/input/photo" : "/input/quick"}
            className="self-start md:self-center shrink-0 rounded-full border border-pink-100 bg-white px-5 py-2.5 text-xs font-bold text-pink-600 shadow-sm transition hover:bg-pink-50/30 hover:text-pink-700"
          >
            정보 다시 입력
          </Link>
        </div>
      </section>

      {profile.warnings && profile.warnings.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/50 p-4.5 text-xs font-semibold text-amber-800 flex items-start gap-2">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-amber-600" />
          <div className="space-y-1">
            {profile.warnings.map((w, i) => (
              <p key={i}>{w}</p>
            ))}
          </div>
        </div>
      )}

      {/* 필터 바 */}
      <section className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={`rounded-full px-4 py-2 text-xs font-bold tracking-tight transition duration-200 ${
                filter === c
                  ? "bg-pink-500 text-white shadow-md shadow-pink-500/10"
                  : "border border-pink-100/60 bg-white text-slate-500 hover:border-pink-300 hover:text-slate-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="self-end sm:self-auto rounded-xl border border-pink-100/60 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm focus:outline-none focus:ring-4 focus:ring-pink-100"
        >
          <option value="matching">매칭도 높은 순</option>
          <option value="salary">평균 연봉 높은 순</option>
          <option value="growth">발전가능성 높은 순</option>
        </select>
      </section>

      {/* 직업 카드 그리드 (Double-Bezel Card 기법 적용) */}
      <section className="mt-6 grid gap-6 sm:grid-cols-2">
        {visible.map((r, i) => {
          const CategoryIcon = CATEGORY_ICONS[r.categoryName] || Laptop;
          const matchHigh = r.matching >= 90;
          return (
            <div
              key={r.jobId}
              className="double-bezel transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/40"
            >
              <div className="double-bezel-inner p-6 h-full flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <CategoryIcon className="h-4 w-4" />
                    <span>{r.categoryName}</span>
                  </div>
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xs font-extrabold shadow-sm ${
                      matchHigh
                        ? "bg-pink-500 text-white shadow-pink-500/10"
                        : r.matching >= 80
                          ? "bg-pink-50 text-pink-700 border border-pink-100"
                          : "bg-slate-50 text-slate-500 border border-slate-100"
                    }`}
                  >
                    {r.matching}%
                  </div>
                </div>

                <h2 className="mt-3 text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  {i < 3 && sort === "matching" && filter === "전체" && (
                    <Trophy
                      className={`h-5 w-5 ${
                        i === 0
                          ? "text-amber-500"
                          : i === 1
                            ? "text-slate-400"
                            : "text-amber-700"
                      }`}
                    />
                  )}
                  {r.name}
                </h2>

                <div className="mt-3 flex flex-wrap gap-1">
                  <span className="rounded-full bg-violet-50 border border-violet-100 px-3 py-1 text-[10px] font-bold text-violet-700">
                    {r.collegeTrack}
                  </span>
                  {r.salaryLevel === "높음" && (
                    <span className="rounded-full bg-rose-50 border border-rose-100 px-3 py-1 text-[10px] font-bold text-rose-700">
                      연봉높음
                    </span>
                  )}
                  {r.growthPotential === "높음" && (
                    <span className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-700">
                      발전가능성높음
                    </span>
                  )}
                  {r.jobStability === "높음" && (
                    <span className="rounded-full bg-pink-50 border border-pink-100 px-3 py-1 text-[10px] font-bold text-pink-700">
                      고용안정
                    </span>
                  )}
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-500">{r.reason}</p>
                
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-semibold text-slate-400">{r.jobType}</span>
                  <Link
                    href={`/jobs/${r.jobId}`}
                    className="flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200/50 px-4 py-2 text-xs font-bold text-slate-700 transition duration-200 hover:bg-pink-500 hover:text-white hover:border-pink-500 active:scale-95"
                  >
                    자세히 보기
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 하단 고정 액션 바 */}
      <div className="fixed inset-x-0 bottom-6 z-40 print-hidden pointer-events-none">
        <div className="mx-auto flex max-w-lg justify-center gap-3 px-6 pointer-events-auto">
          <Link
            href="/chat"
            className="flex-1 rounded-full border border-pink-100 bg-white/95 backdrop-blur px-5 py-3.5 text-center text-xs font-bold text-slate-700 shadow-lg shadow-pink-200/5 transition duration-200 hover:scale-[1.02] hover:bg-pink-50/20 active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <MessageSquare className="h-4 w-4 text-pink-500" />
            AI 상담사 질문
          </Link>
          <Link
            href="/report"
            className="flex-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-3.5 text-center text-xs font-bold text-white shadow-lg shadow-pink-500/20 transition duration-200 hover:scale-[1.02] hover:opacity-95 active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <FileText className="h-4 w-4" />
            AI 분석 보고서 생성
          </Link>
        </div>
      </div>
    </div>
  );
}
