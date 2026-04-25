export function isSafeUrl(url: string): boolean {
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const { protocol } = new URL(url, base);
    return protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:';
  } catch {
    return false;
  }
}
