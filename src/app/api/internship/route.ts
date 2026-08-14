import { NextResponse } from "next/server";
import { publicApiError } from "@/lib/api-error";
import { makeRefId } from "@/lib/internship/ref-id";
import { appendToNotion, isNotionConfigured } from "@/lib/internship/notion";
import type { InternshipApplicationInput } from "@/lib/internship/types";
import {
  normalizeInternshipInput,
  validateInternshipInput,
} from "@/lib/internship/validate";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`internship:${ip}`, 5, 60 * 60 * 1000);

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      },
    );
  }

  if (!isNotionConfigured()) {
    return NextResponse.json(
      { error: "Intake is not connected yet. Configure Notion." },
      { status: 503 },
    );
  }

  let body: InternshipApplicationInput;
  try {
    body = (await request.json()) as InternshipApplicationInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validationError = validateInternshipInput(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const refId = makeRefId();
  const submittedAt = new Date().toISOString();
  const application = normalizeInternshipInput(body, refId, submittedAt);

  try {
    await appendToNotion(application);

    return NextResponse.json({ refId, submittedAt });
  } catch (error) {
    return NextResponse.json(
      {
        error: publicApiError(
          error,
          "Could not file the application. Please try again in a few minutes.",
          "internship",
        ),
      },
      { status: 502 },
    );
  }
}
