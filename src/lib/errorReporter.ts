
function isBenignError(error: any, source?: string): boolean {
  const message = String(error?.message || error || '');
  const stack = String(error?.stack || '');
  const src = String(source || '');

  if (
    message.includes('WebSocket closed without opened') ||
    message.includes('failed to connect to websocket') ||
    message.includes('ResizeObserver loop') ||
    stack.includes('@vite/client') ||
    src.includes('@vite/client')
  ) {
    return true;
  }
  return false;
}

export async function reportError(error: Error | any, userId?: string) {
  try {
    if (!error || isBenignError(error)) {
      return;
    }

    const errorData = {
      message: error.message || String(error),
      stack: error.stack || '',
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: userId || 'Anonymous'
    };

    await fetch('/api/report-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData)
    });
  } catch {
    // Fail silently to avoid infinite error loops
  }
}

export function setupErrorHandling(userId?: string) {
  window.onerror = (message, source, lineno, colno, error) => {
    if (isBenignError(error || message, source)) {
      return true;
    }
    reportError(error || { message }, userId);
    return false; // Let default browser handling continue
  };

  window.onunhandledrejection = (event) => {
    if (isBenignError(event?.reason)) {
      event.preventDefault();
      return;
    }
    reportError(event.reason, userId);
  };
}

if (typeof window !== 'undefined') {
  setupErrorHandling();
}
