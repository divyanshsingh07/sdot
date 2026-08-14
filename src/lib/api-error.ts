export function publicApiError(
  error: unknown,
  fallback: string,
  logLabel: string,
) {
  if (process.env.NODE_ENV !== "production") {
    return error instanceof Error ? error.message : fallback;
  }

  console.error(`[${logLabel}]`, error);
  return fallback;
}
