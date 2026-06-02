/** جميع types مشتركة بين الـ API والـ frontend */

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  logo_r2_key: string | null;
  created_by: string;
  created_at: number;
  updated_at: number;
}

export interface Board {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  background: string | null;
  visibility: 'private' | 'workspace' | 'public';
  is_starred: 0 | 1;
  is_closed: 0 | 1;
  created_by: string;
  created_at: number;
  updated_at: number;
}

export interface BoardFull extends Board {
  lists: ListFull[];
  labels: Label[];
  members: BoardMember[];
}

export interface List {
  id: string;
  board_id: string;
  name: string;
  position: number;
  is_archived: 0 | 1;
  created_at: number;
}

export interface ListFull extends List {
  cards: CardSummary[];
}

export interface Card {
  id: string;
  list_id: string;
  board_id: string;
  title: string;
  description: string | null;
  position: number;
  due_date: number | null;
  start_date: number | null;
  due_complete: 0 | 1;
  cover_r2_key: string | null;
  cover_color: string | null;
  is_archived: 0 | 1;
  is_watched: 0 | 1;
  created_by: string;
  created_at: number;
  updated_at: number;
}

export interface CardSummary extends Card {
  labels: Label[];
  members: string[]; // ARID researcher IDs
  checklist_progress: { completed: number; total: number };
  comments_count: number;
  attachments_count: number;
}

export interface CardDetail extends CardSummary {
  checklists: ChecklistFull[];
  comments: Comment[];
  attachments: Attachment[];
  activity: Activity[];
}

export interface Label {
  id: string;
  board_id: string;
  name: string | null;
  color: string;
}

export interface BoardMember {
  board_id: string;
  arid_researcher_id: string;
  role: 'owner' | 'admin' | 'member' | 'observer';
  joined_at: number;
}

export interface Checklist {
  id: string;
  card_id: string;
  title: string;
  position: number;
  total: number;
  completed: number;
}

export interface ChecklistFull extends Checklist {
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  title: string;
  is_complete: 0 | 1;
  due_date: number | null;
  assigned_to: string | null;
  position: number;
}

export interface Comment {
  id: string;
  card_id: string;
  arid_researcher_id: string;
  body: string;
  is_edited: 0 | 1;
  parent_id: string | null;
  created_at: number;
  updated_at: number;
}

export interface Attachment {
  id: string;
  card_id: string;
  r2_key: string;
  filename: string;
  size_bytes: number;
  mime_type: string;
  thumbnail_r2_key: string | null;
  uploaded_by: string;
  created_at: number;
}

export interface Activity {
  id: string;
  board_id: string;
  card_id: string | null;
  arid_researcher_id: string;
  type: string;
  data: Record<string, unknown>;
  created_at: number;
}

export interface AutomationRule {
  id: string;
  board_id: string;
  name: string;
  trigger: Record<string, unknown>;
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>[];
  is_enabled: 0 | 1;
  created_by: string;
  created_at: number;
}

// Presence types (WebSocket)
export interface PresenceUser {
  aridId: string;
  name: string;
  avatar?: string;
}

export type WSIncomingMessage =
  | { type: 'card.moved'; cardId: string; fromListId: string; toListId: string; position: number }
  | { type: 'card.updated'; cardId: string; fields: Partial<Card> }
  | { type: 'card.created'; card: CardSummary }
  | { type: 'card.archived'; cardId: string }
  | { type: 'list.updated'; listId: string; name?: string; position?: number }
  | { type: 'comment.added'; cardId: string; comment: Comment }
  | { type: 'presence.join'; aridId: string; name: string; avatar?: string }
  | { type: 'presence.leave'; aridId: string }
  | { type: 'presence.list'; users: PresenceUser[] }
  | { type: 'presence.cursor'; cardId: string; x: number; y: number; aridId: string };

// API Responses
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  cursor?: string;
  has_more: boolean;
}
