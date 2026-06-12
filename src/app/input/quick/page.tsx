"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  buildQuickProfile,
  INTEREST_OPTIONS,
  PERSONALITY_OPTIONS,
  SUBJECT_OPTIONS,
  VALUE_OPTIONS,
  type QuickAnswers,
} from "@/lib/quick-mapping";
import { store } from "@/lib/storage";
import type { HollandCode, TrackChoice, ValueKey } from "@/lib/types";
import {
  Laptop,
  HeartPulse,
  BookOpen,
  Palette,
  Tv,
  Coins,
  Settings,
  Sprout,
  Users,
  Utensils,
  Microscope,
  Dumbbell,
  ArrowLeft,
  ArrowRight,
  Search,
  Sparkles,
  HelpCircle,
  ChevronLeft
} from "lucide-react";

const TOTAL_STEPS = 6;

// 이모지 대신 사용할 Lucide 아이콘 매핑
const INTEREST_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "IT·기술": Laptop,
  "의료·보건": HeartPulse,
  "교육": BookOpen,
  "예술·디자인": Palette,
  "미디어·방송": Tv,
  "경제·경영": Coins,
  "공학·제조": Settings,
  "자연·환경": Sprout,
  "사회·복지": Users,
  "요리·서비스": Utensils,
  "과학·연구": Microscope,
  "스포츠·레저": Dumbbell,
};

export default function QuickInputPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 관심 분야는 라벨 기준으로 선택 관리
  const [interestLabels, setInterestLabels] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [personality, setPersonality] = useState<HollandCode | null>(null);
  const [values, setValues] = useState<ValueKey[]>([]);
  const [grade, setGrade] = useState<1 | 2 | 3>(1);
  const [track, setTrack] = useState<TrackChoice>("미정");
  const [mbti, setMbti] = useState("");
  const [freeText, setFreeText] = useState("");

  const toggle = <T,>(list: T[], item: T, max: number, set: (v: T[]) => void) => {
    if (list.includes(item)) set(list.filter((x) => x !== item));
    else if (list.length < max) set([...list, item]);
  };

  const genOrdinal = (idx: number) => {
    return `${idx + 1}순위`;
  };

  const canNext = () => {
    if (step === 0) return interestLabels.length > 0;
    if (step === 1) return subjects.length > 0;
    if (step === 2) return personality !== null;
    if (step === 3) return values.length > 0;
    if (step === 4) return !mbti.trim() || /^[EI][SN][TF][JP]$/i.test(mbti.trim());
    return true;
  };

  const submit = async () => {
    if (!personality) return;
    setLoading(true);
    setError(null);
    try {
      const interests = [
        ...new Set(
          interestLabels.map(
            (l) => INTEREST_OPTIONS.find((o) => o.label === l)!.category,
          ),
        ),
      ];
      const answers: QuickAnswers = {
        interests,
        subjects,
        personality,
        values,
        grade,
        track,
        mbti: mbti.trim() || undefined,
        freeText: freeText.trim() || undefined,
      };
      const base = buildQuickProfile(answers);

      // 자유 서술 AI 보정 (실패해도 결정적 프로필로 진행)
      let profile = base;
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "quick", profile: base }),
        });
        const data = await res.json();
        if (data.ok && data.profile) profile = data.profile;
      } catch {
        /* 보정 실패 무시 — 결정적 프로필로 진행 */
      }

      const recRes = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const recData = await recRes.json();
      if (!recData.ok) throw new Error(recData.error ?? "추천에 실패했어요.");

      store.setProfile(profile);
      store.setRecommendations(recData.recommendations);
      store.clearReport();
      router.push("/results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했어요. 다시 시도해주세요.");
      setLoading(false);
    }
  };

  const chip = (selected: boolean) =>
    `rounded-full border px-5 py-2.5 text-sm font-semibold tracking-tight transition duration-200 hover:scale-[1.02] active:scale-[0.98] ${
      selected
        ? "border-pink-500 bg-pink-500 text-white shadow-md shadow-pink-500/10"
        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
    }`;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-pink-500 transition mb-6">
        <ChevronLeft className="h-4 w-4" />
        메인으로 돌아가기
      </Link>

      {/* 진행 바 */}
      <div className="mb-3 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
        <span>간편 진로 설정</span>
        <span>
          단계 {step + 1} / {TOTAL_STEPS}
        </span>
      </div>
      <div className="mb-8 h-2.5 overflow-hidden rounded-full bg-slate-200/60 p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-300"
          style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <div className="double-bezel">
        <div className="double-bezel-inner p-6 shadow-sm sm:p-8">
          {step === 0 && (
            <section>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-500" />
                어떤 분야에 관심이 있나요?
              </h1>
              <p className="mt-1.5 text-sm text-slate-400">자신의 관심 분야를 골라주세요 (최대 4개)</p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {INTEREST_OPTIONS.map((o) => {
                  const IconComponent = INTEREST_ICONS[o.label] || HelpCircle;
                  const selected = interestLabels.includes(o.label);
                  return (
                    <button
                      key={o.label}
                      type="button"
                      className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold tracking-tight transition duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                        selected
                          ? "border-pink-500 bg-pink-500 text-white shadow-md shadow-pink-500/10"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                      onClick={() => toggle(interestLabels, o.label, 4, setInterestLabels)}
                    >
                      <IconComponent className={`h-4.5 w-4.5 ${selected ? "text-white" : "text-slate-500"}`} />
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === 1 && (
            <section>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-pink-500" />
                좋아하거나 자신 있는 과목은?
              </h1>
              <p className="mt-1.5 text-sm text-slate-400">다양하게 선택할 수 있습니다</p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {SUBJECT_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={chip(subjects.includes(s))}
                    onClick={() => toggle(subjects, s, 10, setSubjects)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                나의 행동 성향은 어디에 가깝나요?
              </h1>
              <p className="mt-1.5 text-sm text-slate-400">가장 가깝다고 느껴지는 항목을 하나 선택해 주세요</p>
              <div className="mt-6 flex flex-col gap-3">
                {PERSONALITY_OPTIONS.map((o) => (
                  <button
                    key={o.holland}
                    type="button"
                    className={`rounded-2xl border p-4.5 text-left text-sm font-bold tracking-tight transition duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                      personality === o.holland
                        ? "border-pink-500 bg-pink-50/60 text-pink-700 ring-2 ring-pink-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                    onClick={() => setPersonality(o.holland)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                직업을 가질 때 가장 중요하게 보는 가치는?
              </h1>
              <p className="mt-1.5 text-sm text-slate-400">중요한 순서대로 최대 2개를 선택해 주세요</p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {VALUE_OPTIONS.map((o) => {
                  const idx = values.indexOf(o.value);
                  return (
                    <button
                      key={o.value}
                      type="button"
                      className={chip(idx >= 0)}
                      onClick={() => toggle(values, o.value, 2, setValues)}
                    >
                      {idx >= 0 ? `${genOrdinal(idx)} · ` : ""}
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === 4 && (
            <section>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                학년과 소속 계열을 알려주세요
              </h1>
              <div className="mt-6 space-y-6">
                <div>
                  <div className="mb-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">학년</div>
                  <div className="flex gap-2">
                    {([1, 2, 3] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        className={chip(grade === g)}
                        onClick={() => setGrade(g)}
                      >
                        고등학교 {g}학년
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">계열선택</div>
                  <div className="flex flex-wrap gap-2">
                    {(["문과", "이과", "예체능", "미정"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={chip(track === t)}
                        onClick={() => setTrack(t)}
                      >
                        {t === "미정" ? "아직 정하지 못함" : t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">성격 유형 (MBTI · 선택)</div>
                  <input
                    type="text"
                    value={mbti}
                    onChange={(e) => setMbti(e.target.value.toUpperCase())}
                    placeholder="예: INFJ"
                    maxLength={4}
                    className="w-36 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-slate-700 transition focus:border-pink-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-pink-100"
                  />
                  {mbti.trim() !== "" && !/^[EI][SN][TF][JP]$/i.test(mbti.trim()) && (
                    <p className="mt-2 text-xs font-semibold text-red-500">올바른 MBTI 형식이 아닙니다</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {step === 5 && (
            <section>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                나에 대해 자유롭게 소개해 주세요
              </h1>
              <p className="mt-1.5 text-sm text-slate-400">
                자신의 강점이나 활동한 경험, 소질을 간단하게 입력하면 AI 추천이 훨씬 더 정교해집니다 (선택)
              </p>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                maxLength={2000}
                rows={6}
                placeholder="예: 코딩 공부를 가볍게 하고 있고 컴퓨터 관련 기사에 흥미가 많아요. 손재주가 좋아 조립하는 것을 잘하고 학교 수학 동아리 부장을 맡아 축제 부스를 기획해 보기도 했습니다."
                className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 transition focus:border-pink-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-pink-100 placeholder:text-slate-400"
              />
            </section>
          )}

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 p-4.5 text-sm font-semibold text-red-600">{error}</p>
          )}

          {/* 내비게이션 */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || loading}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 active:scale-95 disabled:invisible"
            >
              <ArrowLeft className="h-4 w-4" /> 이전
            </button>
            {step < TOTAL_STEPS - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="inline-flex items-center gap-1.5 rounded-full bg-pink-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-pink-500/10 transition hover:bg-pink-600 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
              >
                다음 <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/15 transition hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              >
                <Search className="h-4 w-4" />
                {loading ? "AI 분석 중..." : "AI 진로 결과 매칭"}
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-slate-400">
        공식 진로심리검사 결과지 사진이 있다면{" "}
        <Link href="/input/photo" className="font-bold text-pink-500 hover:underline inline-flex items-center gap-0.5">
          사진 업로드로 분석하기
        </Link>
        가 훨씬 정확합니다.
      </p>
    </div>
  );
}
