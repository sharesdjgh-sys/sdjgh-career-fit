import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkGfm from "remark-gfm";
import MatchBadge from "@/components/MatchBadge";
import { getAllJobs, getJob, getJobContent } from "@/lib/jobs";
import { HOLLAND_INFO } from "@/lib/types";
import type { HollandCode } from "@/lib/types";
import {
  Coins,
  TrendingUp,
  Building2,
  Scale,
  Star,
  GraduationCap,
  BookOpen,
  ArrowRight,
  MessageSquare,
  ChevronLeft,
  Wrench,
  Microscope,
  Palette,
  HeartHandshake,
  Briefcase,
  ClipboardList,
  Laptop,
  HeartPulse,
  Users,
  Utensils,
  Dumbbell,
  Link as LinkIcon,
  Settings,
  Sprout,
  HelpCircle
} from "lucide-react";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllJobs().map((j) => ({ id: j.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = getJob(id);
  return { title: job ? `${job.name} — 진로나침반` : "진로나침반" };
}

/** 기본정보/핵심지표 테이블은 상단 카드로 대체하므로 '하는 일'부터 렌더링 */
function bodyFrom(content: string): string {
  const idx = content.indexOf("## 하는 일");
  return idx >= 0 ? content.slice(idx) : content;
}

const INDICATOR_CARDS = [
  { key: "salaryLevel", label: "평균연봉", icon: Coins },
  { key: "growthPotential", label: "발전가능성", icon: TrendingUp },
  { key: "jobStability", label: "고용안정성", icon: Building2 },
  { key: "wlbLevel", label: "일·가정 균형", icon: Scale },
] as const;

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

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = getJob(id);
  if (!job) notFound();

  const content = getJobContent(id);
  const nameToId = new Map(getAllJobs().map((j) => [j.name, j.id]));

  const salaryText =
    job.salary != null ? `${job.salary.toLocaleString()}만원` : job.salaryLevel;

  const CategoryIcon = CATEGORY_ICONS[job.categoryName] || Laptop;

  return (
    <div className="bg-surface pb-32">
      {/* 히어로 — 앱에서 유일하게 허용되는 그라디언트 */}
      <section className="bg-gradient-to-tr from-primary-50 to-secondary-50 px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-ink-soft shadow-sm">
              <CategoryIcon className="h-3.5 w-3.5 text-primary-600" />
              {job.categoryName}
            </span>
            <span className="inline-flex items-center rounded-full bg-white px-3.5 py-1 text-xs font-bold text-ink-soft shadow-sm">
              {job.collegeTrack}
            </span>
            <MatchBadge jobId={job.id} />
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {job.name}
          </h1>
          <p className="mt-2 text-sm font-medium text-ink-soft">{job.jobType}</p>
          {job.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {job.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-line bg-white px-3 py-0.5 text-xs font-medium text-ink-lighter"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6">
        {/* 핵심 지표 카드 */}
        <section className="relative z-10 -mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {INDICATOR_CARDS.map((c) => {
            const IconComponent = c.icon;
            return (
              <div
                key={c.key}
                className="flex flex-col items-center justify-center rounded-xl border border-line bg-white p-5 text-center shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="mt-3 text-xs font-semibold text-ink-lighter">{c.label}</div>
                <div className="mt-1 text-base font-bold text-ink">
                  {c.key === "salaryLevel" ? salaryText : job[c.key]}
                </div>
              </div>
            );
          })}
        </section>

        {job.satisfaction != null && (
          <div className="mt-4 rounded-xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-ink">
                <Star className="h-4 w-4 fill-primary-500 text-primary-500" />
                직업 만족도
              </span>
              <span className="font-extrabold text-primary-600">{job.satisfaction}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-100">
              <div
                className="h-full rounded-full bg-primary-500"
                style={{ width: `${job.satisfaction}%` }}
              />
            </div>
          </div>
        )}

        {/* Holland 유형 */}
        <section className="mt-8 rounded-xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink">성향 매칭 (Holland 유형)</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {job.holland.map((code) => {
              const info = HOLLAND_INFO[code];
              const Icon = HOLLAND_ICONS[code] || HelpCircle;
              return (
                <div
                  key={code}
                  className="rounded-lg border border-line bg-surface-50 p-4 text-sm"
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
                    <Icon className="h-3.5 w-3.5" />
                    {info.label}({code})
                  </span>
                  <p className="mt-3 text-xs leading-relaxed text-ink-soft">{info.desc}</p>
                </div>
              );
            })}
          </div>
          {job.aptitudeFactors.length > 0 && (
            <p className="mt-5 text-xs font-medium text-ink-lighter">
              관련 핵심 적성 요인:{" "}
              <span className="ml-1 font-semibold text-ink">{job.aptitudeFactors.join(" · ")}</span>
            </p>
          )}
        </section>

        {/* 추천 전공 */}
        <section className="mt-6 rounded-xl border border-line bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
            <GraduationCap className="h-5 w-5 text-primary-600" />
            추천 전공 및 학과
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {job.majors.map((m) => (
              <span
                key={m}
                className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700"
              >
                {m}
              </span>
            ))}
          </div>
        </section>

        {/* 고교 추천 과목 */}
        <section className="mt-6 rounded-xl border border-line bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
            <BookOpen className="h-5 w-5 text-secondary-600" />
            고교 추천 선택 과목
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {job.highSchoolSubjects.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-full border border-line bg-surface-50 px-3 py-1 text-xs font-semibold text-ink-soft"
              >
                {s}
              </span>
            ))}
          </div>
          <Link
            href={`/majors?job=${job.id}`}
            className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 transition duration-200 hover:text-primary-700"
          >
            고등학교 3개년 학년별 로드맵 가이드 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* 직업백과 본문 */}
        {content && (
          <section className="job-content mt-6 rounded-xl border border-line bg-white p-6 shadow-sm sm:p-8">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkCjkFriendly]}>{bodyFrom(content)}</ReactMarkdown>
          </section>
        )}

        {/* 관련 직업 */}
        {job.relatedJobs.length > 0 && (
          <section className="mt-6 rounded-xl border border-line bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
              <LinkIcon className="h-4 w-4 text-ink-lighter" />
              관련 직업 정보
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.relatedJobs.map((name) => {
                const relId = nameToId.get(name);
                return relId ? (
                  <Link
                    key={name}
                    href={`/jobs/${relId}`}
                    className="rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-primary-600 transition duration-200 hover:bg-primary-50 hover:text-primary-700"
                  >
                    {name}
                  </Link>
                ) : (
                  <span
                    key={name}
                    className="rounded-full border border-line bg-surface-50 px-4 py-2 text-xs font-semibold text-ink-lighter"
                  >
                    {name}
                  </span>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* 하단 고정 액션 바 */}
      <div className="print-hidden pointer-events-none fixed inset-x-0 bottom-6 z-40">
        <div className="pointer-events-auto mx-auto flex max-w-xl justify-center gap-3 px-6">
          <Link
            href="/results"
            className="inline-flex items-center justify-center gap-1 rounded-full border border-line-strong bg-white px-5 py-3 text-sm font-bold text-ink-soft shadow-md transition duration-200 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 active:scale-[0.98]"
          >
            <ChevronLeft className="h-4 w-4" />
            목록으로
          </Link>
          <Link
            href={`/chat?job=${job.id}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-line-strong bg-white px-5 py-3 text-sm font-bold text-ink shadow-md transition duration-200 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 active:scale-[0.98]"
          >
            <MessageSquare className="h-4 w-4" />
            이 직업 상담하기
          </Link>
          <Link
            href={`/majors?job=${job.id}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/15 transition duration-200 hover:bg-primary-600 active:scale-[0.98]"
          >
            전공 추천 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
