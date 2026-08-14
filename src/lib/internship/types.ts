export type InternshipApplication = {
  refId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  education: string;
  portfolio: string;
  interests: string[];
  why: string;
  analysis: string;
  tools: string[];
  hoursPerWeek: string;
  startDate: string;
  videoLink: string;
  videoNote: string;
  submittedAt: string;
};

export type InternshipApplicationInput = Omit<
  InternshipApplication,
  "refId" | "submittedAt"
> & {
  /** Honeypot — must stay empty; bots fill this field. */
  _hp?: string;
};
