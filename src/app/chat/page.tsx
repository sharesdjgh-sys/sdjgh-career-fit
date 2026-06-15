"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import Markdown from "@/components/Markdown";
import { store } from "@/lib/storage";
import { HOLLAND_INFO } from "@/lib/types";
import type { ChatMessage, Recommendation, StudentProfile, HollandCode } from "@/lib/types";
import {
  Send,
  ChevronLeft,
  User,
  Sparkles,
  HelpCircle,
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
  Dumbbell
} from "lucide-react";

const QUICK_QUESTIONS = [
  "비슷한 직업 더 알려줘",
  "이 직업의 하루 일과는 어때?",
  "필요한 자격증이 뭐야?",
  "지금 고등학생인데 뭘 준비하면 좋아?",
  "문과인데 IT 직업도 가능해?",
];

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

function ChatInner() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job") ?? undefined;

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentJob = jobId ? recs.find((r) => r.jobId === jobId) : undefined;

  useEffect(() => {
    setProfile(store.getProfile());
    setRecs(store.getRecommendations() ?? []);
    const saved = store.getChat();
    if (saved && saved.length > 0) {
      setMessages(saved);
    } else {
      setMessages([
        {
          role: "assistant",
          content:
            "안녕하세요! 저는 진로나침반 AI 상담사입니다. 추천받은 직업이나 진로 설계 고민 등 궁금한 점이 있다면 무엇이든 편하게 여쭤보세요.",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || streaming) return;
    setInput("");

    const history = [...messages, { role: "user" as const, content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          jobId,
          topJobs: recs.slice(0, 3).map((r) => r.name),
          // 첫 인사말(assistant 고정 문구)은 제외하고 최근 20개만 전송
          messages: history.filter((_, i) => !(i === 0 && history[0].role === "assistant")).slice(-20),
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "응답을 받지 못했어요.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: answer }]);
      }
      const finalMessages: ChatMessage[] = [
        ...history,
        { role: "assistant", content: answer || "(응답이 비어 있습니다. 다시 질문해 주세요.)" },
      ];
      setMessages(finalMessages);
      store.setChat(finalMessages);
    } catch (e) {
      setMessages([
        ...history,
        {
          role: "assistant",
          content: e instanceof Error ? `오류: ${e.message}` : "문제가 발생했습니다. 다시 시도해 주세요.",
        },
      ]);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-6xl bg-surface">
      {/* 사이드 패널 (데스크톱) */}
      <aside className="hidden w-80 shrink-0 flex-col gap-5 overflow-y-auto border-r border-line bg-white p-5 lg:flex">
        {profile ? (
          <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
              <User className="h-3.5 w-3.5" />
              나의 진로 프로필
            </h2>
            <div className="space-y-3.5">
              <div className="flex flex-wrap gap-1.5">
                {(() => {
                  const PIcon = HOLLAND_ICONS[profile.holland.primary] || HelpCircle;
                  const SIcon = profile.holland.secondary ? HOLLAND_ICONS[profile.holland.secondary] : null;
                  return (
                    <>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
                        <PIcon className="h-3.5 w-3.5" />
                        {HOLLAND_INFO[profile.holland.primary].label}
                      </span>
                      {profile.holland.secondary && SIcon && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-100 px-3 py-1 text-xs font-bold text-secondary-700">
                          <SIcon className="h-3.5 w-3.5" />
                          {HOLLAND_INFO[profile.holland.secondary].label}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
              <p className="text-xs font-medium leading-normal text-ink-lighter">
                고등학교 {profile.grade}학년 · {profile.track}
                {profile.mbti && ` · MBTI: ${profile.mbti}`}
              </p>

              {recs.length > 0 && (
                <div className="border-t border-line pt-3.5">
                  <div className="mb-2 text-xs font-semibold text-ink-soft">추천 직업 Top 3</div>
                  <ul className="space-y-1.5">
                    {recs.slice(0, 3).map((r) => {
                      const CatIcon = CATEGORY_ICONS[r.categoryName] || Laptop;
                      return (
                        <li key={r.jobId}>
                          <Link
                            href={`/chat?job=${r.jobId}`}
                            className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition duration-200 ${
                              jobId === r.jobId
                                ? "bg-primary-50 text-primary-700"
                                : "text-ink-soft hover:bg-surface-50 hover:text-ink"
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <CatIcon
                                className={`h-3.5 w-3.5 shrink-0 ${
                                  jobId === r.jobId ? "text-primary-600" : "text-ink-lighter"
                                }`}
                              />
                              <span className="truncate">{r.name}</span>
                            </span>
                            <span className="shrink-0 text-xs font-bold text-ink-lighter">{r.matching}%</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-line bg-surface-50 p-5 text-xs font-medium leading-relaxed text-ink-soft">
            아직 프로필이 없습니다.{" "}
            <Link href="/" className="font-bold text-primary-600 transition hover:text-primary-700">
              진로 설정을 먼저 진행
            </Link>
            하시면 맞춤화된 AI 상담을 받으실 수 있습니다.
          </div>
        )}

        <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
            <Sparkles className="h-3.5 w-3.5 text-primary-600" />
            자주 묻는 질문
          </h2>
          <div className="flex flex-col gap-2">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setInput(q)}
                className="rounded-full border border-line bg-white px-3.5 py-2 text-left text-xs font-semibold text-ink-soft transition duration-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 채팅 영역 */}
      <div className="flex min-w-0 flex-1 flex-col bg-surface">
        <div className="flex items-center justify-between border-b border-line bg-white px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-bold text-ink">
            <span className="h-2 w-2 rounded-full bg-success" />
            진로 탐색 AI 상담
            {currentJob && (
              <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
                {currentJob.name} 컨텍스트
              </span>
            )}
          </div>
          <Link
            href="/results"
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-ink-lighter transition duration-200 hover:text-primary-600"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            결과로 돌아가기
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full">
                    <Image
                      src="/chatbot.png"
                      alt="AI 상담사"
                      width={1184}
                      height={983}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "whitespace-pre-wrap bg-primary-500 text-white"
                      : "border border-line bg-white text-ink shadow-xs"
                  }`}
                >
                  {m.content ? (
                    m.role === "assistant" ? (
                      <Markdown>{m.content}</Markdown>
                    ) : (
                      m.content
                    )
                  ) :
                    (streaming && i === messages.length - 1 ? (
                      <span className="inline-flex gap-1.5 py-1">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-ink-lighter" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-ink-lighter [animation-delay:200ms]" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-ink-lighter [animation-delay:400ms]" />
                      </span>
                    ) : (
                      ""
                    ))}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        <form
          className="border-t border-line bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <div className="mx-auto flex w-full max-w-3xl gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="궁금한 직업이나 학습 방법에 대해 자유롭게 물어보세요..."
              maxLength={4000}
              className="w-full flex-1 rounded-lg border border-line-strong bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-lighter shadow-xs transition duration-200 focus:border-primary-500 focus:outline-none focus:ring-[3px] focus:ring-primary-500/15"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              aria-label="질문 보내기"
              className="inline-flex items-center justify-center rounded-full bg-primary-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/15 transition duration-200 hover:bg-primary-600 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatInner />
    </Suspense>
  );
}
