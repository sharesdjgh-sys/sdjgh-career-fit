# 🧭 진로나침반 — 고등학생 맞춤형 AI 진로 상담 서비스

진로심리검사 결과지 사진 또는 간편 입력을 기반으로, 직업백과 **579개 직업** 중 학생에게 맞는 직업을 추천하고
"이 직업을 가지려면 무엇을 공부해야 하는지"를 **AI 분석 보고서**로 제공하는 웹 서비스입니다.

> 서비스 기획서: [`plan.md`](./plan.md) · 화면 디자인 스펙: `Claude_Design_프롬프트.md`

## 주요 기능

| 기능 | 설명 |
|------|------|
| 📷 결과지 사진 분석 | 커리어넷 검사 결과지 사진 → Claude Vision으로 Holland·적성·가치관 추출 |
| ✏️ 간편·자유 입력 | 5문항 카드 + 자유 서술 → AI가 프로필 추정 (결과지 없이도 사용 가능) |
| 🎯 AI 직업 추천 | 룰 기반 매칭(Holland 40 + 적성 20 + 가치관 20 + 관심 10 + 계열·과목 10) → Claude 재랭킹 Top 10 |
| 📖 직업 상세 | 579개 직업 정적 페이지(SSG) — 지표·전공·고교과목·전망 |
| 🗺️ 전공·로드맵 | 추천 학과, 고1~3 학습 타임라인, 수능 선택과목 전략 |
| 💬 AI 상담 | 학생 프로필 + 직업백과 본문을 컨텍스트로 한 스트리밍 채팅 |
| 📄 AI 분석 보고서 | 직업별 학습 가이드·로드맵·수능 전략, A4 인쇄/PDF 대응 |

## 실행 방법

```bash
npm install

# (선택) Claude API 키 설정 — 없어도 룰 기반 추천으로 동작
cp .env.example .env.local   # ANTHROPIC_API_KEY 입력

npm run dev                  # http://localhost:3000
```

> API 키가 없으면: 간편 입력 → 룰 기반 추천 → 직업 상세/로드맵까지 동작합니다.
> 사진 분석·재랭킹·보고서·채팅은 키가 있어야 동작합니다.

## 데이터 갱신

```bash
# 직업백과 md(jobs/) 수정 후
node scripts/build-content.mjs        # data/content/{id}.md 재생성
python build_jobs_json.py             # data/jobs.json 재생성 (BASE 경로 확인)
npx tsx scripts/test-scoring.ts       # 매칭 엔진 상식 검증
```

## 아키텍처

- **Next.js (App Router) 단일 풀스택 앱** — 별도 백엔드/벡터DB/RDB 없음
- 데이터: `data/jobs.json`(매칭 인덱스) + `data/content/*.md`(직업 본문) 파일 기반, 서버 메모리 캐시
- AI: Claude API (`claude-sonnet-4-6`) — 구조화 출력 + 허용목록 검증 + 룰 기반 폴백
- 학생 데이터: **서버 무저장** — localStorage(프로필·추천·보고서) / sessionStorage(채팅)
- 배포: Vercel (`ANTHROPIC_API_KEY` 환경변수 필요)

## 프로젝트 구조

```
data/               # jobs.json + content/{id}.md (커밋 대상)
jobs/               # 원본 직업백과 md 579개 (gitignore)
scripts/            # 데이터 빌드·검증 스크립트
src/app/            # 8개 화면 + 4개 API 라우트
src/lib/            # 타입, 데이터 로더, 매칭 엔진, 프롬프트, 스키마
plan.md             # 서비스 기획서
```
