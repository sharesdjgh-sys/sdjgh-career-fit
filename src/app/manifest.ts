import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "진로나침반 — 고등학생 맞춤형 AI 진로 상담",
    short_name: "진로나침반",
    description:
      "진로심리검사 결과로 579개 직업 중 나에게 맞는 직업·전공·고교 선택과목을 추천받아 보세요.",
    lang: "ko",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF9F6",
    theme_color: "#D6456B",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
