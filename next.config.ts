import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 서버리스 번들에 data/ 파일 포함 (fs 동적 읽기는 자동 트레이싱되지 않음)
  outputFileTracingIncludes: {
    "/api/analyze": ["./data/jobs.json"],
    "/api/recommend": ["./data/jobs.json"],
    "/api/report": ["./data/jobs.json", "./data/content/**"],
    "/api/chat": ["./data/jobs.json", "./data/content/**"],
    "/jobs/[id]": ["./data/jobs.json", "./data/content/**"],
    "/majors": ["./data/jobs.json"],
  },
};

export default nextConfig;
