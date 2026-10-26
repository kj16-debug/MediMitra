import type { AnalyzeRequest, DemoPatient, Status, TriageResult } from './types';

const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function formatErrorDetail(detail: unknown): string {
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail
      .map((err) => {
        if (typeof err === 'string') return err;
        if (err && typeof err === 'object') {
          const loc = Array.isArray((err as any).loc)
            ? (err as any).loc.filter((l: unknown) => l !== 'body').join('.')
            : '';
          const msg = (err as any).msg || 'Invalid input';
          return loc ? `${loc}: ${msg}` : msg;
        }
        return String(err);
      })
      .filter(Boolean)
      .join('; ');
  }
  if (detail && typeof detail === 'object') {
    try {
      return JSON.stringify(detail);
    } catch {
      return 'Invalid request data.';
    }
  }
  return 'Something went wrong. Please try again.';
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(base + path, init);
  } catch (netErr) {
    throw new Error('Network error. Backend service is currently unreachable.');
  }

  let body: any = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      body = await response.json();
    } catch {
      body = null;
    }
  } else {
    try {
      const text = await response.text();
      body = text.trim() ? { detail: text.trim() } : null;
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    let message = 'Something went wrong. Please try again.';
    if (response.status === 413) {
      message = 'Case text is too long';
    } else if (response.status === 429) {
      message = 'Too many requests, please wait a minute and try again';
    } else if (body && body.detail !== undefined) {
      message = formatErrorDetail(body.detail);
    } else if (response.statusText) {
      message = `${response.status} ${response.statusText}`;
    }
    throw new Error(message || 'Request failed.');
  }

  return body as T;
}

export const api = {
  status: () => fetchJson<Status>('/api/status'),
  demos: () => fetchJson<DemoPatient[]>('/api/demo-patients'),
  analyze: (request: AnalyzeRequest) =>
    fetchJson<TriageResult>('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    }),
  escalate: (request: AnalyzeRequest, local_result: TriageResult) =>
    fetchJson<TriageResult>('/api/escalate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request, local_result }),
    }),
};
