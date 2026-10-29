/**
 * Centralized fetch with timeout utility for Supabase SSR and API requests.
 * Prevents requests from stalling indefinitely when DNS or cloud connections are slow.
 */

export const DEFAULT_SUPABASE_TIMEOUT_MS = 6000;

export function createFetchWithTimeout(timeoutMs = DEFAULT_SUPABASE_TIMEOUT_MS) {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    // If caller provided a custom abort signal, propagate it
    if (init?.signal) {
      if (init.signal.aborted) {
        controller.abort();
      } else {
        init.signal.addEventListener('abort', () => controller.abort(), { once: true });
      }
    }

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timer);
    }
  };
}
