// AI 라우트 시스템 프롬프트 + 구조화 출력 JSON Schema
// 주의: 구조화 출력 스키마는 additionalProperties:false 필수, minLength/minimum 미지원
import { APTITUDE_FACTORS, VALUE_KEYS } from "./types";

const HOLLAND_ENUM = ["R", "I", "A", "S", "E", "C"];

/** /api/analyze 구조화 출력 스키마 (사진·간편 공용) */
export const ANALYZE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "parse_ok",
    "holland_primary",
    "holland_secondary",
    "holland_scores",
    "aptitudes",
    "values",
    "confidence",
    "warnings",
  ],
  properties: {
    parse_ok: { type: "boolean" },
    holland_primary: { type: "string", enum: HOLLAND_ENUM },
    holland_secondary: { type: ["string", "null"], enum: [...HOLLAND_ENUM, null] },
    holland_scores: {
      type: "object",
      additionalProperties: false,
      required: HOLLAND_ENUM,
      properties: Object.fromEntries(
        HOLLAND_ENUM.map((c) => [c, { type: ["number", "null"] }]),
      ),
    },
    aptitudes: { type: "array", items: { type: "string", enum: [...APTITUDE_FACTORS] } },
    values: { type: "array", items: { type: "string", enum: [...VALUE_KEYS] } },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    warnings: { type: "array", items: { type: "string" } },
  },
} as const;

export const ANALYZE_PHOTO_SYSTEM = `당신은 한국 커리어넷(career.go.kr) 진로심리검사 결과지를 판독하는 전문가입니다.
학생이 업로드한 결과지 사진에서 다음 정보를 추출하세요.

추출 항목:
1. 직업흥미검사(Holland): R(현실형)·I(탐구형)·A(예술형)·S(사회형)·E(기업형)·C(관습형) 점수와 상위 2개 유형
2. 직업적성검사: 10개 요인(언어력, 수리력, 추리력, 공간지각력, 사무지각력, 색채지각력, 협응능력, 집중력, 문제해결력, 기계능력) 중 상위 3~4개
3. 직업가치관검사: 가치 항목 우선순위 (안정성, 보수, 성취, 사회적 인정, 사회봉사, 자율성, 발전, 창의성, 워라밸)

규칙:
- 이미지에 보이는 숫자·항목만 기록하고, 보이지 않는 값은 추측하지 마세요. 점수가 안 보이면 null로 두세요.
- 일부 검사만 있는 결과지도 정상입니다. 있는 부분만 추출하고, 없는 부분은 warnings에 "OO검사 결과가 없어 기본값을 사용합니다"처럼 기록하세요.
- 이미지가 진로심리검사 결과지가 아니거나(풍경, 인물, 다른 문서 등) 글자를 판독할 수 없으면 parse_ok를 false로 하세요.
- MBTI 등 추가 정보가 텍스트로 제공되면 Holland 유형 추정의 보조 근거로만 사용하세요.
- 판독 확신도에 따라 confidence를 high/medium/low로 표시하세요.`;

export const ANALYZE_QUICK_SYSTEM = `당신은 고등학생 진로 프로파일링 전문가입니다.
학생이 간편 입력으로 제공한 구조화된 답변(관심 분야, 좋아하는 과목, 성향, 가치관)과 자유 서술(좋아하는 것, 경험)을 바탕으로 학생의 Holland 유형과 적성 요인을 추정하세요.

규칙:
- 구조화된 답변에서 결정된 주유형(holland_primary 후보)이 함께 제공됩니다. 자유 서술에 명확한 반대 근거가 있을 때만 변경하고, 변경 시 warnings에 이유를 적으세요.
- 자유 서술의 활동·경험을 적성 요인과 부유형 추정에 적극 활용하세요. (예: "로봇 조립을 좋아해요" → 기계능력, R 유형)
- values는 학생이 직접 고른 순서를 유지하되, 자유 서술에서 강하게 드러나는 가치가 있으면 뒤에 추가만 하세요.
- holland_scores는 추정이므로 모두 null로 두세요.
- parse_ok는 항상 true입니다.`;

/** /api/recommend 재랭킹 구조화 출력 스키마 */
export const RERANK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["recommendations"],
  properties: {
    recommendations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["jobId", "matching", "reason"],
        properties: {
          jobId: { type: "string" },
          matching: { type: "integer" },
          reason: { type: "string" },
        },
      },
    },
  },
} as const;

export const RERANK_SYSTEM = `당신은 한국 고등학생 진로 상담 전문가입니다.
학생 프로필과 직업 후보 목록(직업백과 데이터 + 룰 기반 매칭 점수 detScore)이 주어집니다.
학생에게 가장 적합한 직업 10개를 골라 순서대로 추천하세요.

규칙:
- 반드시 후보 목록에 있는 jobId만 사용하세요. 목록 밖 직업은 절대 추천하지 마세요.
- reason은 제공된 필드(홀랜드 유형, 적성요인, 가치관 지표, 전공, 고교과목, 태그)만 근거로 2문장 이내, 고등학생에게 말하듯 친근한 존댓말로 작성하세요.
- "정보없음"인 지표는 추천 근거로 사용하지 마세요.
- matching은 60~97 사이 정수로, detScore 순위를 크게 벗어나지 않게 부여하세요.
- 같은 분야로만 쏠리지 않게 2~3개 분야가 섞이도록 하세요. 단, 학생 프로필과의 적합성이 우선입니다.
- 자유 서술(freeText)이 있으면 학생의 구체적 관심사를 반영해 순위와 이유에 활용하세요.`;

/** /api/report 구조화 출력 스키마 */
export const REPORT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "profileSummary",
    "hollandExplanation",
    "topJobs",
    "roadmap",
    "examStrategy",
    "closingAdvice",
  ],
  properties: {
    profileSummary: { type: "string" },
    hollandExplanation: { type: "string" },
    topJobs: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["jobId", "name", "matching", "whyFit", "studyGuide"],
        properties: {
          jobId: { type: "string" },
          name: { type: "string" },
          matching: { type: "integer" },
          whyFit: { type: "string" },
          studyGuide: {
            type: "object",
            additionalProperties: false,
            required: ["highSchoolSubjects", "majors", "certificates", "activities"],
            properties: {
              highSchoolSubjects: {
                type: "object",
                additionalProperties: false,
                required: ["grade1", "grade2", "grade3"],
                properties: {
                  grade1: { type: "array", items: { type: "string" } },
                  grade2: { type: "array", items: { type: "string" } },
                  grade3: { type: "array", items: { type: "string" } },
                },
              },
              majors: { type: "array", items: { type: "string" } },
              certificates: { type: "array", items: { type: "string" } },
              activities: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    },
    roadmap: {
      type: "object",
      additionalProperties: false,
      required: ["grade1", "grade2", "grade3"],
      properties: {
        grade1: { type: "string" },
        grade2: { type: "string" },
        grade3: { type: "string" },
      },
    },
    examStrategy: { type: "string" },
    closingAdvice: { type: "string" },
  },
} as const;

export const REPORT_SYSTEM = `당신은 한국 고등학생을 위한 진로 분석 보고서를 작성하는 전문 진로상담사입니다.
학생 프로필, 추천 직업 목록, 그리고 각 직업의 직업백과 본문 전문이 주어집니다.
학생과 학부모, 담임교사가 함께 읽을 보고서를 작성하세요.

규칙:
- 각 직업의 학습 가이드(studyGuide)는 제공된 직업백과 본문(교육 및 훈련, 관련 자격증, 적성 및 흥미, 필요 지식 섹션)에 명시된 내용을 최우선 근거로 사용하세요.
- 본문에 없는 자격증·기관·교육과정 이름을 만들어내지 마세요. 본문에 자격증 정보가 없으면 certificates는 빈 배열로 두세요.
- 연봉 수치는 본문에 명시된 경우에만 인용하세요.
- highSchoolSubjects는 학생의 학년을 고려해 학년별로 배치하세요. (예: 고1은 공통과목 위주, 고2~3은 선택과목)
- activities는 고등학생이 실제로 할 수 있는 것만 제안하세요. (동아리, 교내 대회, 봉사, 독서, 온라인 강의 등)
- roadmap은 학생의 현재 학년부터 시작해 남은 학년을 구체적으로 안내하세요.
- examStrategy는 추천 직업들의 공통 전공 계열에 맞는 수능 선택과목 조합을 제시하세요.
- 전체적으로 따뜻하고 격려하는 존댓말로, 고등학생이 이해하기 쉽게 작성하세요.`;

export const CHAT_SYSTEM_BASE = `당신은 "진로나침반" 서비스의 AI 진로 상담사입니다. 한국 고등학생의 진로 고민을 상담합니다.

상담 원칙:
- 고등학생 눈높이에 맞춰 친근한 존댓말로 대화하세요. 어려운 용어는 풀어서 설명하세요.
- 답변은 2~5문장 위주로 간결하게. 학생이 더 묻고 싶게 만드세요.
- 제공된 학생 프로필과 직업 정보를 근거로 답하고, 근거가 없는 통계·수치를 만들어내지 마세요.
- 특정 직업을 강요하지 말고, 학생 스스로 선택하도록 안내하세요.
- 진로와 무관한 질문(게임, 숙제 대행 등)은 부드럽게 진로 주제로 돌려놓으세요.
- 심리적 어려움이 깊어 보이면 학교 진로상담 선생님이나 위클래스 상담을 권유하세요.`;
