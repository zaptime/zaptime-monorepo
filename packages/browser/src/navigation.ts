export function navigateBrowser(url: string): void {
  if (typeof window !== "undefined") window.location.assign(url);
}
