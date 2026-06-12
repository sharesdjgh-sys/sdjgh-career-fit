"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { store } from "@/lib/storage";
import { HOLLAND_INFO } from "@/lib/types";
import type { IndicatorLevel, Recommendation, StudentProfile } from "@/lib/types";

const LEVEL_ORDER: Record<IndicatorLevel, number> = {
  높음: 3,
  보통: 2,
  정보없음: 1,
  낮음: 0,
};

type SortKey = "matching" | "salary" | "growth";

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
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="text-4xl">🧭</div>
        <h1 className="mt-4 text-xl font-bold">아직 추천 결과가 없어요</h1>
        <p className="mt-2 text-sm text-ink-soft">
          검사 결과지 사진이나 간편 입력으로 진로 탐색을 시작해보세요.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/input/photo"
            className="rounded-btn bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
          >
            📷 결과지 사진으로 시작
          </Link>
          <Link
            href="/input/quick"
            className="rounded-btn bg-secondary px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-600"
          >
            ✏️ 간편 입력으로 시작
          </Link>
        </div>
      </div>
    );
  }

  const h = profile.holland;
  const pInfo = HOLLAND_INFO[h.primary];
  const sInfo = h.secondary ? HOLLAND_INFO[h.secondary] : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-28">
      {/* 프로필 요약 카드 */}
      <section className="rounded-card border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold sm:text-xl">
              나의 Holland 유형: {pInfo.icon} {pInfo.label}({h.primary})
              {sInfo && (
                <span className="text-ink-soft">
                  {" "}
                  · {sInfo.icon} {sInfo.label}({h.secondary})
                </span>
              )}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">{pInfo.desc}</p>
            {profile.aptitudes.length > 0 && (
              <p className="mt-1 text-sm text-ink-soft">
                강점 적성: <span className="font-medium text-ink">{profile.aptitudes.join(" · ")}</span>
              </p>
            )}
          </div>
          <Link
            href={profile.source === "photo" ? "/input/photo" : "/input/quick"}
            className="rounded-btn border border-slate-200 px-4 py-2 text-sm font-medium text-ink-soft hover:bg-slate-50"
          >
            다시 입력하기
          </Link>
        </div>
        {profile.warnings && profile.warnings.length > 0 && (
          <div className="mt-3 rounded-btn bg-accent-light p-3 text-xs text-amber-800">
            {profile.warnings.map((w, i) => (
              <p key={i}>⚠️ {w}</p>
            ))}
          </div>
        )}
      </section>

      {/* 필터 바 */}
      <section className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                filter === c
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 bg-white text-ink-soft hover:border-primary/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-btn border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-soft focus:outline-none"
        >
          <option value="matching">매칭도순</option>
          <option value="salary">연봉순</option>
          <option value="growth">발전가능성순</option>
        </select>
      </section>

      {/* 직업 카드 그리드 */}
      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        {visible.map((r, i) => (
          <div
            key={r.jobId}
            className={`flex flex-col rounded-card border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              r.matching >= 90 ? "border-primary/60" : "border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="text-xs font-medium text-ink-soft">
                {r.categoryIcon} {r.categoryName}
              </div>
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                  r.matching >= 90
                    ? "bg-primary text-white"
                    : r.matching >= 80
                      ? "bg-primary-light text-primary-dark"
                      : "bg-slate-100 text-ink-soft"
                }`}
              >
                {r.matching}%
              </div>
            </div>
            <h2 className="mt-1 text-lg font-bold">
              {i < 3 && sort === "matching" && filter === "전체" && (
                <span className="mr-1">{["🥇", "🥈", "🥉"][i]}</span>
              )}
              {r.name}
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium">
                {r.collegeTrack}
              </span>
              {r.salaryLevel === "높음" && (
                <span className="rounded bg-accent-light px-2 py-0.5 text-xs font-medium text-amber-700">
                  연봉높음
                </span>
              )}
              {r.growthPotential === "높음" && (
                <span className="rounded bg-secondary-light px-2 py-0.5 text-xs font-medium text-emerald-700">
                  발전가능성높음
                </span>
              )}
              {r.jobStability === "높음" && (
                <span className="rounded bg-primary-light px-2 py-0.5 text-xs font-medium text-primary-dark">
                  고용안정
                </span>
              )}
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{r.reason}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-ink-soft">{r.jobType}</span>
              <Link
                href={`/jobs/${r.jobId}`}
                className="rounded-btn bg-primary-light px-4 py-2 text-sm font-bold text-primary-dark transition hover:bg-primary hover:text-white"
              >
                자세히 보기 →
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* 하단 고정 액션 바 */}
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 py-3 backdrop-blur print-hidden">
        <div className="mx-auto flex max-w-5xl justify-center gap-3 px-4">
          <Link
            href="/chat"
            className="flex-1 rounded-btn border border-primary px-5 py-2.5 text-center text-sm font-bold text-primary transition hover:bg-primary-light sm:flex-none"
          >
            💬 AI 상담사에게 물어보기
          </Link>
          <Link
            href="/report"
            className="flex-1 rounded-btn bg-primary px-5 py-2.5 text-center text-sm font-bold text-white transition hover:bg-primary-dark sm:flex-none"
          >
            📄 AI 분석 보고서 만들기
          </Link>
        </div>
      </div>
    </div>
  );
}
