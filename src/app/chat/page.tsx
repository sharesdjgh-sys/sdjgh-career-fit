"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { store } from "@/lib/storage";
import { HOLLAND_INFO } from "@/lib/types";
import type { ChatMessage, Recommendation, StudentProfile } from "@/lib/types";

const QUICK_QUESTIONS = [
  "비슷한 직업 더 알려줘",
  "이 직업의 하루 일과는 어때?",
  "필요한 자격증이 뭐야?",
  "지금 고등학생인데 뭘 준비하면 좋아?",
  "문과인데 IT 직업도 가능해?",
];

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
            "안녕하세요! 저는 진로나침반 AI 상담사예요 😊 추천받은 직업이든 진로 고민이든 무엇이든 편하게 물어보세요!",
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
        { role: "assistant", content: answer || "(응답이 비어 있어요. 다시 질문해주세요.)" },
      ];
      setMessages(finalMessages);
      store.setChat(finalMessages);
    } catch (e) {
      setMessages([
        ...history,
        {
          role: "assistant",
          content: e instanceof Error ? `⚠️ ${e.message}` : "⚠️ 오류가 발생했어요. 다시 시도해주세요.",
        },
      ]);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-6xl">
      {/* 사이드 패널 (데스크톱) */}
      <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-r border-slate-200 bg-white p-4 lg:flex">
        {profile ? (
          <div className="rounded-card border border-slate-200 p-4">
            <h2 className="text-sm font-bold">내 프로필</h2>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              {HOLLAND_INFO[profile.holland.primary].icon}{" "}
              <b className="text-ink">
                {HOLLAND_INFO[profile.holland.primary].label}({profile.holland.primary})
              </b>
              {profile.holland.secondary &&
                ` · ${HOLLAND_INFO[profile.holland.secondary].label}(${profile.holland.secondary})`}
              <br />
              고{profile.grade} · {profile.track}
              {profile.mbti && ` · ${profile.mbti}`}
            </p>
            {recs.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-bold text-ink-soft">추천 직업 Top 3</div>
                <ul className="mt-1 space-y-1">
                  {recs.slice(0, 3).map((r) => (
                    <li key={r.jobId}>
                      <Link
                        href={`/chat?job=${r.jobId}`}
                        className={`block rounded px-2 py-1 text-xs transition ${
                          jobId === r.jobId
                            ? "bg-primary-light font-bold text-primary-dark"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        {r.categoryIcon} {r.name} ({r.matching}%)
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-card border border-slate-200 p-4 text-xs leading-relaxed text-ink-soft">
            아직 프로필이 없어요.{" "}
            <Link href="/" className="font-medium text-primary hover:underline">
              진로 탐색을 먼저 시작
            </Link>
            하면 더 정확한 상담을 받을 수 있어요.
          </div>
        )}

        <div className="rounded-card border border-slate-200 p-4">
          <h2 className="text-sm font-bold">빠른 질문</h2>
          <div className="mt-2 flex flex-col gap-1.5">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setInput(q)}
                className="rounded-btn border border-slate-200 px-3 py-2 text-left text-xs text-ink-soft transition hover:border-primary/50 hover:text-primary"
              >
                💬 {q}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 채팅 영역 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute h-full w-full animate-ping rounded-full bg-secondary opacity-60" />
              <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
            </span>
            진로 상담 AI
            {currentJob && (
              <span className="ml-1 rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary-dark">
                {currentJob.name} 상담 중
              </span>
            )}
          </div>
          <Link href="/results" className="text-xs text-ink-soft hover:text-primary">
            ← 결과로 돌아가기
          </Link>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-surface p-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-white">
                  🧭
                </div>
              )}
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-card px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-white"
                    : "border border-slate-200 bg-white text-ink"
                }`}
              >
                {m.content ||
                  (streaming && i === messages.length - 1 ? (
                    <span className="inline-flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
                    </span>
                  ) : (
                    ""
                  ))}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form
          className="flex gap-2 border-t border-slate-200 bg-white p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="궁금한 점을 자유롭게 물어보세요..."
            maxLength={4000}
            className="flex-1 rounded-btn border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="rounded-btn bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-40"
          >
            {streaming ? "..." : "전송 ➤"}
          </button>
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
