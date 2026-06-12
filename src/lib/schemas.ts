import { z } from "zod";
import { APTITUDE_FACTORS, VALUE_KEYS } from "./types";

export const hollandCodeSchema = z.enum(["R", "I", "A", "S", "E", "C"]);

export const studentProfileSchema = z.object({
  source: z.enum(["photo", "quick"]),
  holland: z.object({
    primary: hollandCodeSchema,
    secondary: hollandCodeSchema.nullable(),
    scores: z.record(z.string(), z.number()).optional(),
  }),
  aptitudes: z.array(z.enum(APTITUDE_FACTORS)).max(6),
  values: z.array(z.enum(VALUE_KEYS)).max(5),
  interestCategories: z.array(z.string()).max(12),
  favoriteSubjects: z.array(z.string()).max(10),
  freeText: z.string().max(2000).optional(),
  mbti: z
    .string()
    .regex(/^[EI][SN][TF][JP]$/i)
    .optional(),
  grade: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  track: z.enum(["이과", "문과", "예체능", "미정"]),
  confidence: z.enum(["high", "medium", "low"]),
  warnings: z.array(z.string()).optional(),
});

export type StudentProfileInput = z.infer<typeof studentProfileSchema>;

/** Claude 재랭킹 응답 검증 */
export const rerankResultSchema = z.object({
  recommendations: z
    .array(
      z.object({
        jobId: z.string(),
        matching: z.number(),
        reason: z.string(),
      }),
    )
    .min(1)
    .max(12),
});

/** Claude 보고서(report) 응답 검증 */
export const reportResultSchema = z.object({
  profileSummary: z.string(),
  hollandExplanation: z.string(),
  topJobs: z.array(
    z.object({
      jobId: z.string(),
      name: z.string(),
      matching: z.number(),
      whyFit: z.string(),
      studyGuide: z.object({
        highSchoolSubjects: z.object({
          grade1: z.array(z.string()),
          grade2: z.array(z.string()),
          grade3: z.array(z.string()),
        }),
        majors: z.array(z.string()),
        certificates: z.array(z.string()),
        activities: z.array(z.string()),
      }),
    }),
  ),
  roadmap: z.object({
    grade1: z.string(),
    grade2: z.string(),
    grade3: z.string(),
  }),
  examStrategy: z.string(),
  closingAdvice: z.string(),
});

/** Claude 프로필 추출(analyze) 응답 검증 */
export const analyzeResultSchema = z.object({
  parse_ok: z.boolean(),
  holland_primary: hollandCodeSchema,
  holland_secondary: hollandCodeSchema.nullable(),
  holland_scores: z.record(z.string(), z.number().nullable()).optional(),
  aptitudes: z.array(z.enum(APTITUDE_FACTORS)).max(6),
  values: z.array(z.enum(VALUE_KEYS)).max(5),
  confidence: z.enum(["high", "medium", "low"]),
  warnings: z.array(z.string()),
});
