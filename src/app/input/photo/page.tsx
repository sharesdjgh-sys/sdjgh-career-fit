"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { store } from "@/lib/storage";
import type { TrackChoice } from "@/lib/types";
import { Camera, X, AlertTriangle, PenTool, Search, HelpCircle, ChevronLeft } from "lucide-react";

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
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">결과지 사진으로 시작하기</h1>
      <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
        커리어넷(career.go.kr) 진로심리검사 결과지를 촬영하거나 캡처해서 올려주세요.
        흥미·적성·가치관검사 결과지 모두 좋습니다. AI가 사진에서 필요한 데이터를 자동으로 추출합니다.
      </p>

      {/* 업로드 영역 */}
      <div
        className={`mt-8 rounded-3xl border-2 border-dashed p-10 text-center transition duration-300 ${
          dragging ? "border-pink-500 bg-pink-50/40" : "border-slate-200 bg-white hover:border-pink-400/40"
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
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
          <Camera className="h-7 w-7" />
        </div>
        <p className="mt-4 text-sm font-bold text-slate-800">
          결과지 사진을 여기에 끌어다 놓거나 아래 버튼을 누르세요
        </p>
        <p className="mt-1 text-xs text-slate-400">
          최대 {MAX_IMAGES}장 · 여러 장 업로드 시 다양한 검사 결과가 함께 분석됩니다
        </p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={images.length >= MAX_IMAGES}
          className="mt-5 rounded-full bg-pink-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-pink-500/10 transition duration-200 hover:bg-pink-600 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
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
        <div className="mt-6 flex flex-wrap gap-4">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.preview}
                alt={`결과지 ${i + 1}`}
                className="h-28 w-28 rounded-2xl border border-slate-200 object-cover shadow-sm transition group-hover:opacity-95"
              />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, j) => j !== i))}
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white shadow-md transition hover:bg-slate-800 hover:scale-105"
                aria-label="삭제"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 추가 정보 (더블베젤 아키텍처 적용) */}
      <section className="double-bezel mt-8">
        <div className="double-bezel-inner p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">추가 정보 입력</h2>
          <p className="text-xs text-slate-400 mt-1">학생의 현재 상태와 의견을 반영하여 추천 정확도를 높입니다.</p>
          
          <div className="mt-6 space-y-6">
            <div>
              <div className="mb-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">학년</div>
              <div className="flex gap-2">
                {([1, 2, 3] as const).map((g) => (
                  <button key={g} type="button" className={chip(grade === g)} onClick={() => setGrade(g)}>
                    고등학교 {g}학년
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">희망 계열</div>
              <div className="flex flex-wrap gap-2">
                {(["문과", "이과", "예체능", "미정"] as const).map((t) => (
                  <button key={t} type="button" className={chip(track === t)} onClick={() => setTrack(t)}>
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
              {!mbtiValid && (
                <p className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> 올바른 MBTI 형식이 아니에요
                </p>
              )}
            </div>

            <div>
              <div className="mb-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                나의 특성이나 하고 싶은 말 (선택)
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="예: 기계 조립이나 수학 계산을 좋아하고, 다인원 협업보다는 혼자 집중해서 분석하는 것을 잘해요."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 transition focus:border-pink-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-pink-100 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50/50 p-5 text-sm text-red-700">
          <div className="flex gap-2 font-bold items-center">
            <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
            <span>분석 중 문제가 생겼습니다</span>
          </div>
          <p className="mt-1.5 text-xs text-red-600 leading-relaxed">{error}</p>
          {fallback && (
            <Link
              href="/input/quick"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <PenTool className="h-3.5 w-3.5" />
              간편 입력으로 계속하기
            </Link>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={images.length === 0 || !mbtiValid || loading}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 py-4 text-base font-bold text-white shadow-lg shadow-pink-500/15 transition duration-200 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
      >
        <Search className="h-5 w-5" />
        {loading ? "AI가 결과지를 정밀 분석하는 중... (최대 30초)" : "AI 진로 매칭 분석 시작하기"}
      </button>

      <p className="mt-5 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 leading-relaxed">
        <HelpCircle className="h-4 w-4 shrink-0" />
        결과지가 없다면{" "}
        <Link href="/input/quick" className="font-bold text-pink-500 hover:underline">
          간편 입력으로 시작
        </Link>
        할 수 있습니다. 업로드 사진은 즉시 영구 삭제됩니다.
      </p>
    </div>
  );
}
