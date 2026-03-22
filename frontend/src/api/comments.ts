import { apiDelete, apiGet, apiPost, apiPut } from "./client";

type RawTicketComment = {
  commentId?: number;
  id?: number;
  ticketId?: number | null;
  userId?: number | null;
  commentText?: string | null;
  isInternalNote?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type TicketComment = {
  commentId: number;
  ticketId: number;
  userId: number;
  commentText: string;
  isInternalNote: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateTicketCommentPayload = {
  commentText: string;
  isInternalNote: boolean;
};

export type UpdateTicketCommentPayload = {
  commentText: string;
};

function normalizeTicketComment(comment: RawTicketComment): TicketComment {
  return {
    commentId: comment.commentId ?? comment.id ?? 0,
    ticketId: comment.ticketId ?? 0,
    userId: comment.userId ?? 0,
    commentText: comment.commentText?.trim() || "",
    isInternalNote: comment.isInternalNote ?? false,
    createdAt: comment.createdAt ?? new Date().toISOString(),
    updatedAt: comment.updatedAt ?? null,
  };
}

export async function getTicketComments(ticketId: number) {
  const comments = await apiGet<RawTicketComment[]>(`/tickets/${ticketId}/comments`);
  return comments.map(normalizeTicketComment);
}

export async function createTicketComment(ticketId: number, payload: CreateTicketCommentPayload) {
  const comment = await apiPost<RawTicketComment, CreateTicketCommentPayload>(`/tickets/${ticketId}/comments`, {
    commentText: payload.commentText.trim(),
    isInternalNote: payload.isInternalNote,
  });

  return normalizeTicketComment(comment);
}

export async function updateTicketComment(
  ticketId: number,
  commentId: number,
  payload: UpdateTicketCommentPayload,
) {
  const comment = await apiPut<RawTicketComment, UpdateTicketCommentPayload>(
    `/tickets/${ticketId}/comments/${commentId}`,
    {
      commentText: payload.commentText.trim(),
    },
  );

  return normalizeTicketComment(comment);
}

export function deleteTicketComment(ticketId: number, commentId: number) {
  return apiDelete<unknown>(`/tickets/${ticketId}/comments/${commentId}`);
}
