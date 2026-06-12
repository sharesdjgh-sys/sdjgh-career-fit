"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { store } from "@/lib/storage";
import type { TrackChoice } from "@/lib/types";

interface UploadedImage {
  preview: string; // dataURL (미리보기용)
  data: string; // base64 (전송용)
}

const MAX_IMAGES = 3;
const MAX_EDGE = 1568; // Claude Vision 권장 최대 변
const MAX_BASE64 = 3_000_000; // Vercel body 한도 대비 여유

/** 업로드 이미지를 JPEG로 리사이즈·재인코딩 (HEIC 등 디코드 실패 시 null) */
async function resizeImage(file: File): Promise<UploadedImage | null> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return null;
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  const data = dataUrl.split(",")[1];
  if (!data || data.length > MAX_BASE64) return null;
  return { preview: dataUrl, data };
}

export default function PhotoInputPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragging, setDragging] = useState(false);
  const [mbti, setMbti] = useState("");
  const [grade, setGrade] = useState<1 | 2 | 3>(1);
  const [track, setTrack] = useState<TrackChoice>("미정");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState(false);

  const addFiles = async (files: FileList | File[]) => {
    setError(null);
    for (const file of Array.from(files)) {
      if (images.length >= MAX_IMAGES) break;
      if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) {
        setError("이미지 파일만 올릴 수 있어요.");
        continue;
      }
      const resized = await resizeImage(file);
      if (!resized) {
        setError(
          "이 사진을 읽을 수 없어요. 아이폰 HEIC 사진이라면 JPG로 변환해 다시 올려주세요.",
        );
        continue;
      }
      setImages((prev) => (prev.length < MAX_IMAGES ? [...prev, resized] : prev));
    }
  };

  const mbtiValid = !mbti.trim() || /^[EI][SN][TF][JP]$/i.test(mbti.trim());

  const submit = async () => {
    if (images.length === 0 || !mbtiValid) return;
    setLoading(true);
    setError(null);
    setFallback(false);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "photo",
          images: images.map((img) => ({ mediaType: "image/jpeg", data: img.data })),
          extra: {
            mbti: mbti.trim() || undefined,
            grade,
            track,
            note: note.trim() || undefined,
          },
        }),
      });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error ?? "결과지를 읽지 못했어요.");
        if (data.fallback === "quick") setFallback(true);
        setLoading(false);
        return;
      }

      const recRes = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: data.profile }),
      });
      const recData = await recRes.json();
      if (!recData.ok) throw new Error(recData.error ?? "추천에 실패했어요.");

      store.setProfile(data.profile);
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
      <h1 className="text-2xl font-bold">검사 결과지 사진으로 시작하기</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        커리어넷(career.go.kr) 진로심리검사 결과지를 촬영하거나 캡처해서 올려주세요.
        흥미검사·적성검사·가치관검사 결과지 모두 좋아요. AI가 사진에서 검사 결과를 읽어
        분석합니다.
      </p>

      {/* 업로드 영역 */}
      <div
        className={`mt-6 rounded-card border-2 border-dashed p-8 text-center transition ${
          dragging ? "border-primary bg-primary-light/40" : "border-slate-300 bg-white"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void addFiles(e.dataTransfer.files);
        }}
      >
        <div className="text-4xl">📷</div>
        <p className="mt-3 text-sm font-medium">
          결과지 사진을 여기에 끌어다 놓거나 버튼을 눌러주세요
        </p>
        <p className="mt-1 text-xs text-ink-soft">
          최대 {MAX_IMAGES}장 · 여러 장이면 흥미/적성/가치관 결과를 모두 분석해요
        </p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={images.length >= MAX_IMAGES}
          className="mt-4 rounded-btn bg-primary px-6 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-40"
        >
          사진 선택 / 촬영
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* 미리보기 */}
      {images.length > 0 && (
        <div className="mt-4 flex gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.preview}
                alt={`결과지 ${i + 1}`}
                className="h-28 w-28 rounded-card border border-slate-200 object-cover"
              />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, j) => j !== i))}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs text-white"
                aria-label="삭제"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 추가 정보 */}
      <section className="mt-8 rounded-card border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold">추가 정보 (더 정확한 추천에 사용돼요)</h2>
        <div className="mt-4 space-y-5">
          <div>
            <div className="mb-2 text-sm font-medium text-ink-soft">학년</div>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((g) => (
                <button key={g} type="button" className={chip(grade === g)} onClick={() => setGrade(g)}>
                  고{g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm font-medium text-ink-soft">계열 (선택)</div>
            <div className="flex flex-wrap gap-2">
              {(["문과", "이과", "예체능", "미정"] as const).map((t) => (
                <button key={t} type="button" className={chip(track === t)} onClick={() => setTrack(t)}>
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
            {!mbtiValid && (
              <p className="mt-1 text-xs text-red-500">올바른 MBTI 형식이 아니에요</p>
            )}
          </div>
          <div>
            <div className="mb-2 text-sm font-medium text-ink-soft">
              하고 싶은 말 (선택)
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="예: 사람들 앞에서 발표하는 건 좋아하는데 오래 앉아있는 건 힘들어요."
              className="w-full rounded-btn border border-slate-200 p-3 text-sm leading-relaxed focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </section>

      {error && (
        <div className="mt-4 rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          {fallback && (
            <Link
              href="/input/quick"
              className="mt-2 inline-block rounded-btn bg-secondary px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600"
            >
              ✏️ 간편 입력으로 진행하기
            </Link>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={images.length === 0 || !mbtiValid || loading}
        className="mt-6 w-full rounded-btn bg-primary py-3.5 text-base font-bold text-white shadow-md transition hover:bg-primary-dark disabled:opacity-40"
      >
        {loading ? "AI가 결과지를 분석하고 있어요... (최대 30초)" : "🔍 AI 분석 시작하기"}
      </button>

      <p className="mt-4 text-center text-sm text-ink-soft">
        결과지가 없나요?{" "}
        <Link href="/input/quick" className="font-medium text-primary hover:underline">
          간편 입력으로 시작
        </Link>
        해도 충분해요. 업로드한 사진은 분석 후 바로 폐기되며 서버에 저장되지 않아요.
      </p>
    </div>
  );
}
