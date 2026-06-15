"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, ChevronRight, Compass, Layers, X } from "lucide-react";
import { CATEGORY_ICONS, categoryColor } from "@/lib/categories";
import type { CollegeTrack, HollandCode, IndicatorLevel } from "@/lib/types";

export interface JobCard {
  id: string;
  name: string;
  categoryName: string;
  stdCategory: string;
  jobType: string;
  salaryLevel: IndicatorLevel;
  collegeTrack: CollegeTrack;
  holland: HollandCode[];
  tags: string[];
}

export interface CategorySummary {
  name: string;
  count: number;
  topStd: string[];
}

const ALL = "전체";

/** stdCategory 별로 묶어 직업 수 내림차순 정렬 */
function groupByStd(cards: JobCard[]): [string, JobCard[]][] {
  const map = new Map<string, JobCard[]>();
  for (const c of cards) {
    const list = map.get(c.stdCategory);
    if (list) list.push(c);
    else map.set(c.stdCategory, [c]);
  }
  return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
}

function JobCardItem({ card, showCategory }: { card: JobCard; showCategory?: boolean }) {
  const Icon = CATEGORY_ICONS[card.categoryName] ?? Compass;
  const { accent, tint } = categoryColor(card.categoryName);
  return (
    <Link
      href={`/jobs/${card.id}`}
      style={{ borderLeftColor: accent, borderLeftWidth: 4, backgroundColor: tint }}
      className="group flex h-full flex-col rounded-xl border border-line p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-lighter">
        <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
        <span>{showCategory ? card.categoryName : card.stdCategory}</span>
      </div>
      <h3 className="mt-1.5 text-lg font-bold text-ink">{card.name}</h3>

      <div className="mt-3 flex flex-1 flex-wrap content-start gap-1.5">
        <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
          {card.collegeTrack}
        </span>
        {card.salaryLevel === "높음" && (
          <span className="inline-flex items-center rounded-full bg-success-bg px-3 py-1 text-xs font-bold text-success">
            연봉 높음
          </span>
        )}
        {card.tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold text-ink-soft"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="truncate text-xs font-medium text-ink-lighter">{card.jobType}</span>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-600 transition group-hover:text-primary-700">
          자세히 보기
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

export default function JobsExplorer({
  cards,
  summaries,
  total,
}: {
  cards: JobCard[];
  summaries: CategorySummary[];
  total: number;
}) {
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  const scope = useMemo(
    () => (activeCategory === ALL ? cards : cards.filter((c) => c.categoryName === activeCategory)),
    [cards, activeCategory],
  );

  const matched = useMemo(() => {
    if (!q) return scope;
    return scope.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.stdCategory.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [scope, q]);

  const grouped = useMemo(
    () => (activeCategory !== ALL && !q ? groupByStd(scope) : []),
    [activeCategory, q, scope],
  );

  const tabs = [{ name: ALL, count: total }, ...summaries.map((s) => ({ name: s.name, count: s.count }))];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 pb-24">
      {/* 헤더 */}
      <header className="flex flex-col gap-3">
        <span className="text-xs font-bold tracking-[0.14em] text-primary-500 sm:text-[13px]">
          직업 탐색
        </span>
        <h1 className="font-serif text-3xl font-bold tracking-[-0.015em] text-ink sm:text-[40px]">
          어떤 직업들이 있을까요?
        </h1>
        <p className="max-w-2xl text-[15px] leading-[1.7] text-ink-soft">
          {total}개 직업을 11개 분야와 표준직업분류로 정리했어요. 분야를 골라 살펴보거나, 궁금한 직업을
          검색해 보세요.
        </p>
      </header>

      {/* 검색창 */}
      <div className="relative mt-8 max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-lighter" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="직업명, 키워드로 검색 (예: 디자이너, 데이터, 간호)"
          className="w-full rounded-full border border-line-strong bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-ink shadow-xs transition duration-200 placeholder:text-ink-lighter focus:border-primary-500 focus:outline-none focus:ring-[3px] focus:ring-primary-500/15"
        />
      </div>

      {/* 분야 탭 바 */}
      <div className="mt-5">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => {
            const active = activeCategory === t.name;
            const Icon = t.name === ALL ? Layers : CATEGORY_ICONS[t.name];
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => setActiveCategory(t.name)}
                className={
                  active
                    ? "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary-500/15 transition duration-200"
                    : "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-xs font-bold text-ink-soft transition duration-200 hover:border-primary-300 hover:text-primary-600"
                }
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {t.name}
                <span className={active ? "text-white/80" : "text-ink-lighter"}>{t.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 본문 */}
      <div className="mt-8">
        {q ? (
          /* 검색 결과 */
          matched.length > 0 ? (
            <>
              <p className="mb-4 text-sm font-medium text-ink-soft">
                <span className="font-bold text-ink">{matched.length}</span>개 직업
                {activeCategory !== ALL && <span className="text-ink-lighter"> · {activeCategory}</span>}
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {matched.map((c) => (
                  <JobCardItem key={c.id} card={c} showCategory />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-100 text-ink-lighter">
                <Search className="h-6 w-6" />
              </div>
              <p className="text-base font-bold text-ink">검색 결과가 없어요</p>
              <p className="text-sm text-ink-soft">다른 키워드로 다시 검색해 보세요.</p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-white px-4 py-2 text-xs font-bold text-ink-soft transition hover:border-primary-300 hover:text-primary-600"
              >
                <X className="h-3.5 w-3.5" />
                검색 지우기
              </button>
            </div>
          )
        ) : activeCategory === ALL ? (
          /* 전체 개요 — 분야 카드 그리드 */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {summaries.map((s) => {
              const Icon = CATEGORY_ICONS[s.name] ?? Compass;
              const { accent, tint } = categoryColor(s.name);
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setActiveCategory(s.name)}
                  style={{ borderLeftColor: accent, borderLeftWidth: 4, backgroundColor: tint }}
                  className="group flex flex-col items-start rounded-xl border border-line p-6 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex w-full items-center justify-between">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-white"
                      style={{ color: accent }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-serif text-2xl font-bold" style={{ color: accent }}>
                      {s.count}
                    </span>
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-ink">{s.name}</h2>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {s.topStd.map((std) => (
                      <span
                        key={std}
                        className="inline-flex items-center rounded-full border border-line bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-ink-soft"
                      >
                        {std}
                      </span>
                    ))}
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 transition group-hover:text-primary-700">
                    직업 보기
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          /* 분야 상세 — 표준분류 소그룹별 직업 카드 */
          <div className="flex flex-col gap-9">
            {grouped.map(([std, list]) => (
              <section key={std}>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
                  {std}
                  <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs font-bold text-ink-lighter">
                    {list.length}
                  </span>
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((c) => (
                    <JobCardItem key={c.id} card={c} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
