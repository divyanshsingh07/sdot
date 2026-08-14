export function makeRefId() {
  return `SDOT-${Date.now().toString(36).toUpperCase()}`;
}
