export const INTEREST_OPTIONS = [
  "Political Analysis",
  "Elections & Data",
  "Content Design",
  "Video / Multimedia",
  "Research",
  "Writing",
] as const;

export const TOOL_OPTIONS = [
  "Canva",
  "Figma",
  "Adobe Suite",
  "CapCut / Premiere",
  "None yet",
] as const;

export const FIELD_LIMITS = {
  name: 120,
  email: 254,
  phone: 40,
  city: 100,
  education: 200,
  portfolio: 500,
  why: 2000,
  analysis: 1500,
  videoLink: 500,
  videoNote: 1000,
  hoursPerWeek: 3,
} as const;

export const ANALYSIS_MIN_WORDS = 40;

export type InterestOption = (typeof INTEREST_OPTIONS)[number];
export type ToolOption = (typeof TOOL_OPTIONS)[number];
