import type { BoardFull, CardDetail, Workspace } from './types';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://arid-kanban-api.info1703.workers.dev/v1';
// Auth routes are outside /v1 prefix
const AUTH_BASE = API.replace(/\/v1$/, '');

// ── Session helpers ──
export const session = {
  getToken: () => (typeof window !== 'undefined' ? localStorage.getItem('arid_token') : null),
  setToken: (t: string) => localStorage.setItem('arid_token', t),
  clear: () => localStorage.removeItem('arid_token'),
};

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = session.getToken();

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as any).error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Auth ──
export const authApi = {
  login: (email: string, password: string) =>
    fetch(`${AUTH_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(async (r) => {
      const data = await r.json() as any;
      if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
      return data as { success: boolean; token: string; user: { id: string; email: string; name: string; role: string } };
    }),

  register: (email: string, password: string, name: string) =>
    fetch(`${AUTH_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    }).then(async (r) => {
      const data = await r.json() as any;
      if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
      return data as { success: boolean; message: string };
    }),

  me: () => apiFetch<{ id: string; email: string; name: string; role: string }>('/auth/me'),
};

// ── Workspaces ──
export const workspacesApi = {
  list: () => apiFetch<{ workspaces: Workspace[] }>('/workspaces'),
  create: (data: { name: string; description?: string }) =>
    apiFetch<{ workspace: Workspace }>('/workspaces', { method: 'POST', body: JSON.stringify(data) }),
  fetch: (id: string) => apiFetch<{ workspace: Workspace }>(`/workspaces/${id}`),
};

// ── Boards ──
export const boardsApi = {
  fetch: (id: string) => apiFetch<{ board: BoardFull }>(`/boards/${id}`),
  create: (data: { workspace_id: string; name: string; visibility?: string; template_id?: string }) =>
    apiFetch<{ board: BoardFull }>('/boards', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    apiFetch<{ board: BoardFull }>(`/boards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/boards/${id}`, { method: 'DELETE' }),
  search: (id: string, q: string) =>
    apiFetch<{ results: unknown[] }>(`/boards/${id}/search?q=${encodeURIComponent(q)}`),
  dashboard: (id: string) =>
    apiFetch<unknown>(`/boards/${id}/dashboard`),
  timeline: (id: string) =>
    apiFetch<unknown>(`/boards/${id}/timeline`),
  exportUrl: (id: string, format: 'json' | 'csv') =>
    `${API}/boards/${id}/export?format=${format}`,
};

// ── Lists ──
export const listsApi = {
  create: (boardId: string, data: { name: string; position?: number }) =>
    apiFetch<{ list: unknown }>(`/boards/${boardId}/lists`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string; position?: number }) =>
    apiFetch<{ list: unknown }>(`/lists/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ── Cards ──
export const cardsApi = {
  fetch: (id: string) => apiFetch<{ card: CardDetail }>(`/cards/${id}`),
  create: (listId: string, data: { title: string; description?: string; due_date?: number }) =>
    apiFetch<{ card: unknown }>(`/lists/${listId}/cards`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    apiFetch<{ card: unknown }>(`/cards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string, permanent = false) =>
    apiFetch<{ success: boolean }>(`/cards/${id}?permanent=${permanent}`, { method: 'DELETE' }),
  copy: (id: string, data?: { title?: string; list_id?: string }) =>
    apiFetch<{ card: unknown }>(`/cards/${id}/copy`, { method: 'POST', body: JSON.stringify(data ?? {}) }),
  addMember: (id: string, aridId: string) =>
    apiFetch<{ success: boolean }>(`/cards/${id}/members`, {
      method: 'POST',
      body: JSON.stringify({ arid_researcher_id: aridId }),
    }),
  removeMember: (id: string, aridId: string) =>
    apiFetch<{ success: boolean }>(`/cards/${id}/members/${aridId}`, { method: 'DELETE' }),
  addLabel: (id: string, labelId: string) =>
    apiFetch<{ success: boolean }>(`/cards/${id}/labels`, {
      method: 'POST',
      body: JSON.stringify({ label_id: labelId }),
    }),
  removeLabel: (id: string, labelId: string) =>
    apiFetch<{ success: boolean }>(`/cards/${id}/labels/${labelId}`, { method: 'DELETE' }),
  watch: (id: string) =>
    apiFetch<{ watching: boolean }>(`/cards/${id}/watch`, { method: 'POST' }),
};

// ── Comments ──
export const commentsApi = {
  create: (cardId: string, data: { body: string; parent_id?: string }) =>
    apiFetch<{ comment: unknown }>(`/cards/${cardId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { body: string }) =>
    apiFetch<{ comment: unknown }>(`/comments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/comments/${id}`, { method: 'DELETE' }),
};

// ── Checklists ──
export const checklistsApi = {
  create: (cardId: string, data: { title: string }) =>
    apiFetch<{ checklist: unknown }>(`/cards/${cardId}/checklists`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { title?: string }) =>
    apiFetch<{ checklist: unknown }>(`/checklists/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/checklists/${id}`, { method: 'DELETE' }),
  createItem: (checklistId: string, data: { title: string }) =>
    apiFetch<{ item: unknown }>(`/checklists/${checklistId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateItem: (itemId: string, data: { title?: string; is_complete?: boolean }) =>
    apiFetch<{ item: unknown }>(`/checklist-items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ── Attachments ──
export const attachmentsApi = {
  presign: (cardId: string, data: { filename: string; size_bytes: number; mime_type: string }) =>
    apiFetch<{ r2_key: string; upload_url: string; expires_at: number; headers: Record<string, string> }>(
      `/cards/${cardId}/attachments/presign`,
      { method: 'POST', body: JSON.stringify(data) }
    ),
  confirm: (cardId: string, data: {
    r2_key: string; filename: string; size_bytes: number; mime_type: string;
  }) =>
    apiFetch<{ attachment: unknown }>(`/cards/${cardId}/attachments/confirm`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/attachments/${id}`, { method: 'DELETE' }),
};
