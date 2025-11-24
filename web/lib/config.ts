// Centralized config helpers

export function getApiBase(): string {
  let base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base && typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    base = (window as any).__API_BASE_URL__; // runtime injected fallback
  }
  if (!base) {
    if (typeof window !== 'undefined') {
      console.error('Missing NEXT_PUBLIC_API_BASE_URL environment variable');
    }
    return '';
  }
  // Remove trailing slashes for consistency
  return base.replace(/\/+$/, '');
}
