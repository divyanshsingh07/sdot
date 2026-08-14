import {
  ANALYSIS_MIN_WORDS,
  FIELD_LIMITS,
  INTEREST_OPTIONS,
  TOOL_OPTIONS,
} from "@/lib/internship/constants";
import type {
  InternshipApplication,
  InternshipApplicationInput,
} from "@/lib/internship/types";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function wordCount(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function exceedsLimit(value: string, limit: number) {
  return value.trim().length > limit;
}

function isAllowedOption<T extends string>(
  values: string[],
  allowed: readonly T[],
) {
  return values.every((value) => allowed.includes(value as T));
}

export function validateInternshipInput(
  input: InternshipApplicationInput,
): string | null {
  if (input._hp?.trim()) return "Invalid submission.";

  if (!input.name.trim()) return "Full name is required.";
  if (exceedsLimit(input.name, FIELD_LIMITS.name)) {
    return "Full name is too long.";
  }

  if (!isEmail(input.email.trim())) return "A valid email is required.";
  if (exceedsLimit(input.email, FIELD_LIMITS.email)) {
    return "Email is too long.";
  }

  if (!input.phone.trim()) return "Phone is required.";
  if (exceedsLimit(input.phone, FIELD_LIMITS.phone)) {
    return "Phone number is too long.";
  }

  if (exceedsLimit(input.city, FIELD_LIMITS.city)) {
    return "City is too long.";
  }

  if (!input.education.trim()) return "Education is required.";
  if (exceedsLimit(input.education, FIELD_LIMITS.education)) {
    return "Education is too long.";
  }

  if (input.portfolio.trim() && !isHttpUrl(input.portfolio.trim())) {
    return "Portfolio must be a valid URL.";
  }
  if (exceedsLimit(input.portfolio, FIELD_LIMITS.portfolio)) {
    return "Portfolio URL is too long.";
  }

  if (!input.interests.length) return "Select at least one area of interest.";
  if (!isAllowedOption(input.interests, INTEREST_OPTIONS)) {
    return "Invalid area of interest selected.";
  }

  if (!input.why.trim()) return "Why SDOT is required.";
  if (exceedsLimit(input.why, FIELD_LIMITS.why)) {
    return "Why SDOT answer is too long.";
  }

  if (!input.analysis.trim()) return "Short assessment is required.";
  if (wordCount(input.analysis) < ANALYSIS_MIN_WORDS) {
    return `Short assessment should be at least ${ANALYSIS_MIN_WORDS} words.`;
  }
  if (exceedsLimit(input.analysis, FIELD_LIMITS.analysis)) {
    return "Short assessment is too long.";
  }

  if (input.tools.length && !isAllowedOption(input.tools, TOOL_OPTIONS)) {
    return "Invalid tool selected.";
  }

  const hours = Number(input.hoursPerWeek);
  if (!input.hoursPerWeek || hours < 1 || hours > 60) {
    return "Enter hours between 1 and 60.";
  }

  if (!input.startDate) return "Start date is required.";

  if (!isHttpUrl(input.videoLink.trim())) {
    return "Video link must be a valid URL.";
  }
  if (exceedsLimit(input.videoLink, FIELD_LIMITS.videoLink)) {
    return "Video link is too long.";
  }

  if (exceedsLimit(input.videoNote, FIELD_LIMITS.videoNote)) {
    return "Video note is too long.";
  }

  return null;
}

export function normalizeInternshipInput(
  input: InternshipApplicationInput,
  refId: string,
  submittedAt: string,
): InternshipApplication {
  return {
    refId,
    submittedAt,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    city: input.city.trim(),
    education: input.education.trim(),
    portfolio: input.portfolio.trim(),
    interests: input.interests,
    why: input.why.trim(),
    analysis: input.analysis.trim(),
    tools: input.tools,
    hoursPerWeek: input.hoursPerWeek,
    startDate: input.startDate,
    videoLink: input.videoLink.trim(),
    videoNote: input.videoNote.trim(),
  };
}
