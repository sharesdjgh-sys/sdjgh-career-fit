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

const TOTAL_STEPS = 6;

export default function QuickInputPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 관심 분야는 라벨 기준으로 선택 관리 (서로 다른 라벨이 같은 카테고리를 가리킬 수 있음)
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
    `rounded-btn border px-4 py-2.5 text-sm font-medium transition ${
      selected
        ? "border-primary bg-primary text-white"
        : "border-slate-200 bg-white text-ink hover:border-primary/50"
    }`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* 진행 바 */}
      <div className="mb-2 flex items-center justify-between text-sm text-ink-soft">
        <span>간편 입력</span>
        <span>
          {step + 1} / {TOTAL_STEPS}
        </span>
      </div>
      <div className="mb-8 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-300"
          style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <div className="rounded-card border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {step === 0 && (
          <section>
            <h1 className="text-xl font-bold">어떤 분야에 관심이 있나요?</h1>
            <p className="mt-1 text-sm text-ink-soft">여러 개 골라도 좋아요 (최대 4개)</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((o) => (
                <button
                  key={o.label}
                  type="button"
                  className={chip(interestLabels.includes(o.label))}
                  onClick={() => toggle(interestLabels, o.label, 4, setInterestLabels)}
                >
                  {o.icon} {o.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 1 && (
          <section>
            <h1 className="text-xl font-bold">좋아하는 과목은 무엇인가요?</h1>
            <p className="mt-1 text-sm text-ink-soft">여러 개 선택할 수 있어요</p>
            <div className="mt-5 flex flex-wrap gap-2">
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
            <h1 className="text-xl font-bold">나는 어떤 성향인가요?</h1>
            <p className="mt-1 text-sm text-ink-soft">가장 가까운 것 하나를 골라주세요</p>
            <div className="mt-5 flex flex-col gap-2">
              {PERSONALITY_OPTIONS.map((o) => (
                <button
                  key={o.holland}
                  type="button"
                  className={`rounded-btn border px-4 py-3 text-left text-sm font-medium transition ${
                    personality === o.holland
                      ? "border-primary bg-primary-light text-primary-dark"
                      : "border-slate-200 bg-white hover:border-primary/50"
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
            <h1 className="text-xl font-bold">직업에서 중요하게 생각하는 것은?</h1>
            <p className="mt-1 text-sm text-ink-soft">최대 2개 — 고른 순서대로 더 중요해요</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {VALUE_OPTIONS.map((o) => {
                const idx = values.indexOf(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    className={chip(idx >= 0)}
                    onClick={() => toggle(values, o.value, 2, setValues)}
                  >
                    {idx >= 0 ? `${idx + 1}순위 · ` : ""}
                    {o.label}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 4 && (
          <section>
            <h1 className="text-xl font-bold">학년과 계열을 알려주세요</h1>
            <div className="mt-5 space-y-5">
              <div>
                <div className="mb-2 text-sm font-medium text-ink-soft">학년</div>
                <div className="flex gap-2">
                  {([1, 2, 3] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={chip(grade === g)}
                      onClick={() => setGrade(g)}
                    >
                      고{g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium text-ink-soft">계열 (선택)</div>
                <div className="flex flex-wrap gap-2">
                  {(["문과", "이과", "예체능", "미정"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={chip(track === t)}
                      onClick={() => setTrack(t)}
                    >
                      {t === "미정" ? "아직 모름" : t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium text-ink-soft">MBTI (선택)</div>
                <input
                  type="text"
                  value={mbti}
                  onChange={(e) => setMbti(e.target.value.toUpperCase())}
                  placeholder="예: ENFP"
                  maxLength={4}
                  className="w-32 rounded-btn border border-slate-200 px-3 py-2 text-sm uppercase focus:border-primary focus:outline-none"
                />
                {mbti.trim() !== "" && !/^[EI][SN][TF][JP]$/i.test(mbti.trim()) && (
                  <p className="mt-1 text-xs text-red-500">올바른 MBTI 형식이 아니에요</p>
                )}
              </div>
            </div>
          </section>
        )}

        {step === 5 && (
          <section>
            <h1 className="text-xl font-bold">나에 대해 자유롭게 알려주세요</h1>
            <p className="mt-1 text-sm text-ink-soft">
              좋아하는 것, 해본 활동이나 경험, 관심 있는 것을 적어주면 AI가 더 정확하게
              추천해요 (선택)
            </p>
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              maxLength={2000}
              rows={6}
              placeholder="예: 레고 조립이랑 로봇 만들기를 좋아해요. 학교에서 과학 동아리 활동을 하고 있고, 유튜브로 우주 다큐를 자주 봐요."
              className="mt-4 w-full rounded-btn border border-slate-200 p-3 text-sm leading-relaxed focus:border-primary focus:outline-none"
            />
          </section>
        )}

        {error && (
          <p className="mt-4 rounded-btn bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}

        {/* 내비게이션 */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || loading}
            className="rounded-btn border border-slate-200 px-5 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-slate-50 disabled:invisible"
          >
            ← 이전
          </button>
          {step < TOTAL_STEPS - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="rounded-btn bg-primary px-6 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-40"
            >
              다음 →
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="rounded-btn bg-secondary px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-60"
            >
              {loading ? "AI가 분석 중이에요..." : "결과 보기 🔍"}
            </button>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-ink-soft">
        커리어넷 검사 결과지가 있다면{" "}
        <Link href="/input/photo" className="font-medium text-primary hover:underline">
          사진으로 더 정확하게 분석
        </Link>
        할 수 있어요
      </p>
    </div>
  );
}
