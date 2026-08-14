"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { CircleCheckIcon } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
  ANALYSIS_MIN_WORDS,
  INTEREST_OPTIONS,
  TOOL_OPTIONS,
} from "@/lib/internship/constants";

const INTERESTS = INTEREST_OPTIONS;
const TOOLS = TOOL_OPTIONS;

const SECTIONS = [
  { id: "profile", num: "01", label: "Profile", compact: "Profile" },
  { id: "assessment", num: "02", label: "Assessment", compact: "Assess" },
  { id: "video", num: "03", label: "Video briefing", compact: "Video" },
] as const;

const DOSSIER_PAD = "px-5 min-[560px]:px-7";
const DOSSIER_BLEED = "-mx-5 min-[560px]:-mx-7";
const SCROLL_MT = "scroll-mt-[calc(3.25rem+env(safe-area-inset-top))] min-[560px]:scroll-mt-14";

const fieldLabelClass =
  "w-full max-w-full flex-wrap font-mono text-[11px] font-medium leading-snug tracking-[0.06em] text-muted-foreground uppercase";

const videoControlClass =
  "border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/45";

const fieldRowClass =
  "grid grid-cols-1 gap-5 min-[560px]:grid-cols-2 min-[560px]:gap-4";

type FormState = {
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
};

const emptyForm: FormState = {
  name: "",
  email: "",
  phone: "",
  city: "",
  education: "",
  portfolio: "",
  interests: [],
  why: "",
  analysis: "",
  tools: [],
  hoursPerWeek: "",
  startDate: "",
  videoLink: "",
  videoNote: "",
};

function wordCount(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

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

function invalidMark(isInvalid: boolean) {
  return isInvalid || undefined;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function SectionHead({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="mb-1.5 flex items-baseline gap-3">
        <p className="font-mono text-xs font-semibold tracking-[0.06em] text-destructive">
          {num}
        </p>
        <h2 className="font-heading text-lg font-bold tracking-tight min-[560px]:text-[19px]">
          {title}
        </h2>
      </div>
      <p className="text-[13.5px] leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

function StampHeader() {
  return (
    <header
      className={cn(
        "relative overflow-hidden bg-primary py-8 text-primary-foreground min-[560px]:pt-[38px] min-[560px]:pb-[30px]",
        DOSSIER_BLEED,
        DOSSIER_PAD,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.035)_0_2px,transparent_2px_14px)]"
      />
      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-3 font-mono text-[10px] tracking-[0.14em] text-primary-foreground/60 uppercase min-[560px]:mb-[22px] min-[560px]:items-center min-[560px]:text-[11px]">
          <p className="min-w-0 pt-1 min-[560px]:pt-0">Mata Labs / SDOT</p>
          <Badge
            variant="outline"
            className="h-auto shrink-0 rounded-sm border-accent/70 px-2 py-1 font-mono text-[9px] leading-none tracking-[0.14em] text-accent uppercase min-[560px]:text-[11px]"
          >
            For applicant use
          </Badge>
        </div>
        <Image
          src="/brand/sdot-logo-header.png"
          alt="SDOT"
          width={560}
          height={246}
          priority
          className="mb-3 h-7 w-auto min-[560px]:mb-4 min-[560px]:h-9"
        />
        <h1 className="font-heading text-[clamp(1.65rem,7vw,2.375rem)] font-extrabold leading-[1.08] tracking-tight">
          Internship <span className="text-accent">Intake</span> Dossier
        </h1>
        <p className="mt-2.5 max-w-[52ch] text-[13.5px] leading-[1.55] text-primary-foreground/80 min-[560px]:text-[14.5px]">
          SDOT is an independent political intelligence platform. This intake
          collects your profile, a short assessment, and a video briefing —
          three sections, about 12 minutes.
        </p>
      </div>
    </header>
  );
}

function SectionNav({ activeSection }: { activeSection: string }) {
  return (
    <nav
      aria-label="Intake sections"
      className={cn(
        "sticky top-0 z-20 bg-navy-deep pt-[env(safe-area-inset-top)]",
        DOSSIER_BLEED,
      )}
    >
      <ul className="grid grid-cols-3">
        {SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <li key={section.id} className="min-w-0">
              <a
                href={`#${section.id}`}
                aria-current={isActive ? "true" : undefined}
                aria-label={`${section.num} ${section.label}`}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 border-b-[3px] px-1 py-2.5 text-center font-mono tracking-[0.08em] uppercase min-[560px]:min-h-11 min-[560px]:flex-row min-[560px]:gap-1.5 min-[560px]:px-2.5",
                  isActive
                    ? "border-accent text-primary-foreground"
                    : "border-transparent text-primary-foreground/45 hover:text-primary-foreground/80",
                )}
              >
                <span className="text-[10px] font-semibold text-accent min-[560px]:text-[11px]">
                  {section.num}
                </span>
                <span className="hidden text-accent min-[560px]:inline">·</span>
                <span className="max-w-full text-balance text-[9px] leading-tight min-[360px]:text-[10px] min-[560px]:text-[11px] min-[560px]:whitespace-nowrap">
                  <span className="min-[560px]:hidden">{section.compact}</span>
                  <span className="hidden min-[560px]:inline">{section.label}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function InternshipIntake() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [filing, setFiling] = useState(false);
  const [refId, setRefId] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [honeypot, setHoneypot] = useState("");

  const analysisWords = wordCount(form.analysis);
  const analysisTooShort =
    analysisWords > 0 && analysisWords < ANALYSIS_MIN_WORDS;

  const invalid = useMemo(() => {
    const hours = Number(form.hoursPerWeek);
    return {
      name: !form.name.trim(),
      email: !isEmail(form.email.trim()),
      phone: !form.phone.trim(),
      education: !form.education.trim(),
      portfolio: Boolean(form.portfolio.trim()) && !isHttpUrl(form.portfolio.trim()),
      interests: form.interests.length === 0,
      why: !form.why.trim(),
      analysis:
        !form.analysis.trim() || wordCount(form.analysis) < ANALYSIS_MIN_WORDS,
      hoursPerWeek: !form.hoursPerWeek || hours < 1 || hours > 60,
      startDate: !form.startDate,
      videoLink: !isHttpUrl(form.videoLink.trim()),
    };
  }, [form]);

  useEffect(() => {
    const nodes = SECTIONS.map((section) =>
      document.getElementById(section.id),
    ).filter((node): node is HTMLElement => Boolean(node));

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const nextId = visible[0]?.target.id;
        if (nextId) setActiveSection(nextId);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.6] },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [submitted]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowErrors(true);

    if (Object.values(invalid).some(Boolean)) {
      toast.error("Please complete the required fields before filing.");
      const firstInvalid = document.querySelector("[data-invalid=true]");
      firstInvalid?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "center",
      });
      return;
    }

    setFiling(true);

    try {
      const response = await fetch("/api/internship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, _hp: honeypot }),
      });

      const data = (await response.json()) as {
        refId?: string;
        error?: string;
      };

      if (!response.ok) {
        toast.error(data.error || "Could not file the application — please try again.");
        return;
      }

      setRefId(data.refId || "");
      setSubmitted(true);
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    } catch {
      toast.error("Could not file the application — please try again.");
    } finally {
      setFiling(false);
    }
  }

  return (
    <div className="min-h-svh overflow-x-clip bg-background">
      <a
        href="#intake-form"
        className="bg-card text-foreground focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-3 focus:py-2 focus:text-sm sr-only"
      >
        Skip to intake form
      </a>

      <div
        className={cn(
          "mx-auto w-full max-w-[760px] pb-[calc(5rem+env(safe-area-inset-bottom))]",
          DOSSIER_PAD,
        )}
      >
        <StampHeader />

        {submitted ? (
          <main className="py-8">
            <Alert className="border-l-accent px-5 py-6 border-l-4 min-[560px]:px-6">
              <CircleCheckIcon />
              <AlertTitle className="font-heading text-lg">
                Application filed.
              </AlertTitle>
              <AlertDescription>
                <p className="font-mono text-xs tracking-wider text-destructive">
                  REF {refId}
                </p>
                <p>
                  Your dossier is logged. SDOT reviews applications on a rolling
                  basis — if shortlisted, you will hear back by email.
                </p>
              </AlertDescription>
            </Alert>
          </main>
        ) : (
          <>
            <SectionNav activeSection={activeSection} />

            <main>
              <form id="intake-form" onSubmit={onSubmit} noValidate>
                <input
                  type="text"
                  name="_hp"
                  value={honeypot}
                  onChange={(event) => setHoneypot(event.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
                />
                <section
                  id="profile"
                  className={cn(SCROLL_MT, "pt-8 pb-2 min-[560px]:pt-[34px]")}
                >
                  <SectionHead num="01" title="Candidate Profile">
                    Basic details so we can log and route your file.
                  </SectionHead>

                  <FieldGroup>
                    <div className={fieldRowClass}>
                      <Field
                        className="min-w-0"
                        data-invalid={invalidMark(showErrors && invalid.name)}
                      >
                        <FieldLabel htmlFor="name" className={fieldLabelClass}>
                          Full name <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id="name"
                          name="name"
                          autoComplete="name"
                          required
                          aria-required
                          aria-invalid={showErrors && invalid.name}
                          value={form.name}
                          onChange={(event) => update("name", event.target.value)}
                        />
                        {showErrors && invalid.name ? (
                          <FieldError>Enter your full name.</FieldError>
                        ) : null}
                      </Field>
                      <Field
                        className="min-w-0"
                        data-invalid={invalidMark(showErrors && invalid.email)}
                      >
                        <FieldLabel htmlFor="email" className={fieldLabelClass}>
                          Email <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          aria-required
                          aria-invalid={showErrors && invalid.email}
                          value={form.email}
                          onChange={(event) =>
                            update("email", event.target.value)
                          }
                        />
                        {showErrors && invalid.email ? (
                          <FieldError>Enter a valid email.</FieldError>
                        ) : null}
                      </Field>
                    </div>

                    <div className={fieldRowClass}>
                      <Field
                        className="min-w-0"
                        data-invalid={invalidMark(showErrors && invalid.phone)}
                      >
                        <FieldLabel htmlFor="phone" className={fieldLabelClass}>
                          Phone <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          required
                          aria-required
                          aria-invalid={showErrors && invalid.phone}
                          value={form.phone}
                          onChange={(event) =>
                            update("phone", event.target.value)
                          }
                        />
                        {showErrors && invalid.phone ? (
                          <FieldError>Enter a phone number.</FieldError>
                        ) : null}
                      </Field>
                      <Field className="min-w-0">
                        <FieldLabel htmlFor="city" className={fieldLabelClass}>
                          City
                        </FieldLabel>
                        <Input
                          id="city"
                          name="city"
                          autoComplete="address-level2"
                          placeholder="e.g. Hyderabad"
                          value={form.city}
                          onChange={(event) => update("city", event.target.value)}
                        />
                      </Field>
                    </div>

                    <Field
                      data-invalid={invalidMark(showErrors && invalid.education)}
                    >
                      <FieldLabel htmlFor="education" className={fieldLabelClass}>
                        Current education / program{" "}
                        <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        id="education"
                        name="education"
                        required
                        aria-required
                        placeholder="Institution, degree, year"
                        aria-invalid={showErrors && invalid.education}
                        value={form.education}
                        onChange={(event) =>
                          update("education", event.target.value)
                        }
                      />
                      {showErrors && invalid.education ? (
                        <FieldError>Enter your current program.</FieldError>
                      ) : null}
                    </Field>

                    <Field
                      data-invalid={invalidMark(showErrors && invalid.portfolio)}
                    >
                      <FieldLabel htmlFor="portfolio" className={fieldLabelClass}>
                        Portfolio, Instagram, or writing sample link
                      </FieldLabel>
                      <Input
                        id="portfolio"
                        name="portfolio"
                        type="url"
                        placeholder="https://"
                        aria-invalid={showErrors && invalid.portfolio}
                        value={form.portfolio}
                        onChange={(event) =>
                          update("portfolio", event.target.value)
                        }
                      />
                      <FieldDescription>
                        Anything that shows how you write, design, or think — a
                        blog, a page, a carousel you made.
                      </FieldDescription>
                      {showErrors && invalid.portfolio ? (
                        <FieldError>Enter a valid https link.</FieldError>
                      ) : null}
                    </Field>
                  </FieldGroup>
                </section>

                <Separator />

                <section
                  id="assessment"
                  className={cn(SCROLL_MT, "pt-8 pb-2 min-[560px]:pt-[34px]")}
                >
                  <SectionHead num="02" title="Assessment">
                    Tells us where you would fit and how you think about the work.
                  </SectionHead>

                  <FieldGroup>
                    <Field
                      data-invalid={invalidMark(showErrors && invalid.interests)}
                    >
                      <FieldSet>
                        <FieldLegend variant="label" className={fieldLabelClass}>
                          Areas of interest{" "}
                          <span className="text-destructive">*</span>
                        </FieldLegend>
                        <ToggleGroup
                          type="multiple"
                          variant="chip"
                          spacing={2}
                          value={form.interests}
                          onValueChange={(value) => update("interests", value)}
                          className="flex w-full max-w-full flex-wrap justify-start"
                          aria-required
                          aria-invalid={showErrors && invalid.interests}
                        >
                          {INTERESTS.map((interest) => (
                            <ToggleGroupItem key={interest} value={interest}>
                              {interest}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                        {showErrors && invalid.interests ? (
                          <FieldError>
                            Select at least one area of interest.
                          </FieldError>
                        ) : null}
                      </FieldSet>
                    </Field>

                    <Field data-invalid={invalidMark(showErrors && invalid.why)}>
                      <FieldLabel htmlFor="why" className={fieldLabelClass}>
                        Why SDOT? <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Textarea
                        id="why"
                        name="why"
                        required
                        aria-required
                        placeholder="What draws you to independent political intelligence work — briefly."
                        aria-invalid={showErrors && invalid.why}
                        value={form.why}
                        onChange={(event) => update("why", event.target.value)}
                      />
                      {showErrors && invalid.why ? (
                        <FieldError>Tell us why you want to join SDOT.</FieldError>
                      ) : null}
                    </Field>

                    <Field
                      data-invalid={invalidMark(showErrors && invalid.analysis)}
                    >
                      <FieldLabel htmlFor="analysis" className={fieldLabelClass}>
                        Short assessment — analyze a recent political development
                        in about 100 words{" "}
                        <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Textarea
                        id="analysis"
                        name="analysis"
                        required
                        aria-required
                        className="min-h-28"
                        placeholder="Pick any recent state or national political development and give your read on it."
                        aria-invalid={showErrors && invalid.analysis}
                        aria-describedby="analysis-count"
                        value={form.analysis}
                        onChange={(event) =>
                          update("analysis", event.target.value)
                        }
                      />
                      <FieldDescription
                        id="analysis-count"
                        className={cn(analysisTooShort && "text-destructive")}
                      >
                        {analysisWords} words
                        {analysisTooShort
                          ? ` — at least ${ANALYSIS_MIN_WORDS} words (aim for around 100).`
                          : " · around 100 words."}
                      </FieldDescription>
                      {showErrors && invalid.analysis ? (
                        <FieldError>
                          Write a short political assessment (at least{" "}
                          {ANALYSIS_MIN_WORDS} words).
                        </FieldError>
                      ) : null}
                    </Field>

                    <FieldSet>
                      <FieldLegend variant="label" className={fieldLabelClass}>
                        Tools you have worked with
                      </FieldLegend>
                      <ToggleGroup
                        type="multiple"
                        variant="chip"
                        spacing={2}
                        value={form.tools}
                        onValueChange={(value) => update("tools", value)}
                        className="flex w-full max-w-full flex-wrap justify-start"
                      >
                        {TOOLS.map((tool) => (
                          <ToggleGroupItem key={tool} value={tool}>
                            {tool}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </FieldSet>

                    <div className={fieldRowClass}>
                      <Field
                        className="min-w-0"
                        data-invalid={invalidMark(
                          showErrors && invalid.hoursPerWeek,
                        )}
                      >
                        <FieldLabel htmlFor="hours" className={fieldLabelClass}>
                          Availability (hours/week){" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id="hours"
                          name="hoursPerWeek"
                          type="number"
                          min={1}
                          max={60}
                          inputMode="numeric"
                          required
                          aria-required
                          aria-invalid={showErrors && invalid.hoursPerWeek}
                          value={form.hoursPerWeek}
                          onChange={(event) =>
                            update("hoursPerWeek", event.target.value)
                          }
                        />
                        {showErrors && invalid.hoursPerWeek ? (
                          <FieldError>Enter hours between 1 and 60.</FieldError>
                        ) : null}
                      </Field>
                      <Field
                        className="min-w-0"
                        data-invalid={invalidMark(showErrors && invalid.startDate)}
                      >
                        <FieldLabel htmlFor="start" className={fieldLabelClass}>
                          Earliest start date{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          id="start"
                          name="startDate"
                          type="date"
                          required
                          aria-required
                          aria-invalid={showErrors && invalid.startDate}
                          value={form.startDate}
                          onChange={(event) =>
                            update("startDate", event.target.value)
                          }
                        />
                        {showErrors && invalid.startDate ? (
                          <FieldError>Choose a start date.</FieldError>
                        ) : null}
                      </Field>
                    </div>
                  </FieldGroup>
                </section>

                <Separator />

                <section
                  id="video"
                  className={cn(SCROLL_MT, "pt-8 pb-2 min-[560px]:pt-[34px]")}
                >
                  <SectionHead num="03" title="Video Briefing">
                    A 60–90 second self-recorded video, hosted and linked — not
                    uploaded here.
                  </SectionHead>

                  <div className="rounded-md bg-navy-deep p-4 text-primary-foreground min-[560px]:p-[22px]">
                    <ul className="mb-5 flex flex-col gap-2 text-[13px] leading-[1.7] text-primary-foreground/85">
                      <li className="relative pl-[18px] before:absolute before:left-0 before:text-accent before:content-['▸']">
                        Record 60–90 seconds: who you are, one political story you
                        have been following, and why SDOT.
                      </li>
                      <li className="relative pl-[18px] before:absolute before:left-0 before:text-accent before:content-['▸']">
                        Upload it to Google Drive (anyone with the link) or as an
                        unlisted YouTube / Loom video.
                      </li>
                      <li className="relative pl-[18px] before:absolute before:left-0 before:text-accent before:content-['▸']">
                        Paste the link below — links only, no raw file.
                      </li>
                    </ul>
                    <FieldGroup>
                      <Field
                        data-invalid={invalidMark(showErrors && invalid.videoLink)}
                      >
                        <FieldLabel
                          htmlFor="video"
                          className={cn(
                            fieldLabelClass,
                            "text-primary-foreground/55",
                          )}
                        >
                          Video link <span className="text-accent">*</span>
                        </FieldLabel>
                        <Input
                          id="video"
                          name="videoLink"
                          type="url"
                          inputMode="url"
                          required
                          aria-required
                          placeholder="https://drive.google.com/... or https://youtu.be/..."
                          className={cn(videoControlClass, "min-[560px]:placeholder:text-sm")}
                          aria-invalid={showErrors && invalid.videoLink}
                          value={form.videoLink}
                          onChange={(event) =>
                            update("videoLink", event.target.value)
                          }
                        />
                        {showErrors && invalid.videoLink ? (
                          <FieldError>
                            Paste a Drive, YouTube, or Loom link.
                          </FieldError>
                        ) : null}
                      </Field>
                      <Field>
                        <FieldLabel
                          htmlFor="videonote"
                          className={cn(
                            fieldLabelClass,
                            "text-primary-foreground/55",
                          )}
                        >
                          Anything else about the video
                        </FieldLabel>
                        <Textarea
                          id="videonote"
                          name="videoNote"
                          placeholder="Optional — timestamp of a specific point, context, etc."
                          className={videoControlClass}
                          value={form.videoNote}
                          onChange={(event) =>
                            update("videoNote", event.target.value)
                          }
                        />
                      </Field>
                    </FieldGroup>
                  </div>
                </section>

                <div className="flex flex-col gap-3 pt-7 min-[560px]:flex-row min-[560px]:items-center min-[560px]:gap-4">
                  <Button
                    type="submit"
                    variant="destructive"
                    size="lg"
                    disabled={filing}
                    className="w-full font-bold tracking-wide min-[560px]:w-auto"
                  >
                    {filing ? <Spinner data-icon="inline-start" /> : null}
                    {filing ? "Filing…" : "File Application"}
                  </Button>
                  <p className="font-mono text-xs text-muted-foreground">
                    Rolling review · reply by email if shortlisted
                  </p>
                </div>
              </form>
            </main>
          </>
        )}
      </div>
    </div>
  );
}
