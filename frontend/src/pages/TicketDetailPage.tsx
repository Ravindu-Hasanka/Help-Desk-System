import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Lock, MessageSquare, Paperclip, Pencil, Save, Send, Trash2, Upload, X } from "lucide-react";
import AlertDialog from "../components/AlertDialog";
import { useAuth } from "../auth/AuthContext";
import {
  assignTicket,
  createTicketComment,
  deleteTicket,
  deleteTicketAttachment,
  deleteTicketComment,
  downloadTicketAttachment,
  getApiErrorMessage,
  getCategories,
  getTicketAttachments,
  getTicketById,
  getTicketComments,
  getUsers,
  updateTicket,
  updateTicketComment,
  updateTicketPriority,
  updateTicketStatus,
  uploadTicketAttachment,
  type ApiTicket,
  type ApiTicketAttachment,
  type ApiTicketComment,
  type ApiUser,
  type Category,
  type TicketPriority,
  type TicketStatus,
} from "../api";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";

type TicketFormState = {
  title: string;
  description: string;
  categoryId: string;
};

type CommentFormState = {
  commentText: string;
  isInternalNote: boolean;
};

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const ticketId = Number(id);

  const [ticket, setTicket] = useState<ApiTicket | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [comments, setComments] = useState<ApiTicketComment[]>([]);
  const [attachments, setAttachments] = useState<ApiTicketAttachment[]>([]);
  const [form, setForm] = useState<TicketFormState>({
    title: "",
    description: "",
    categoryId: "",
  });
  const [commentForm, setCommentForm] = useState<CommentFormState>({
    commentText: "",
    isInternalNote: false,
  });
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [updatingCommentId, setUpdatingCommentId] = useState<number | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isDeletingTicket, setIsDeletingTicket] = useState(false);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<ApiTicketComment | null>(null);
  const [pageError, setPageError] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [attachmentError, setAttachmentError] = useState("");

  useEffect(() => {
    if (!Number.isFinite(ticketId)) {
      setPageError("Invalid ticket id.");
      setIsLoading(false);
      return;
    }

    const loadPage = async () => {
      try {
        setIsLoading(true);
        setPageError("");

        const [ticketResponse, categoriesResponse, commentsResponse, attachmentsResponse, usersResponse] = await Promise.all([
          getTicketById(ticketId),
          getCategories(),
          getTicketComments(ticketId),
          getTicketAttachments(ticketId),
          user?.role === "Admin" ? getUsers() : Promise.resolve([]),
        ]);

        setTicket(ticketResponse);
        setCategories(categoriesResponse);
        setComments(commentsResponse);
        setAttachments(attachmentsResponse);
        setUsers(usersResponse);
        setForm({
          title: ticketResponse.title,
          description: ticketResponse.description,
          categoryId: String(ticketResponse.categoryId),
        });
      } catch (loadError) {
        setPageError(getApiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadPage();
  }, [ticketId, user?.role]);

  const isStaffUser = user?.role !== "User";

  const getCategoryName = (categoryId: number) =>
    categories.find((category) => category.categoryId === categoryId)?.categoryName ?? `Category #${categoryId}`;

  const getUserName = (userId: number | null) => {
    if (userId === null) {
      return "Unassigned";
    }

    const matchedUser =
      users.find((existingUser) => existingUser.id === userId) ??
      (user?.id === userId
        ? {
            id: user.id,
            fullName: user.name,
          }
        : null);

    return matchedUser?.fullName ?? `User #${userId}`;
  };

  const assigneeOptions = users;
  const hasCurrentAssigneeOption =
    ticket?.assignedToUserId !== null &&
    ticket?.assignedToUserId !== undefined &&
    assigneeOptions.some((assignee) => assignee.id === ticket.assignedToUserId);
  const canManageComment = (comment: ApiTicketComment) => user?.id === comment.userId;

  const handleSaveDetails = async (event: React.FormEvent) => {
    event.preventDefault();
    setDetailsError("");

    if (!ticket || !form.title.trim() || !form.description.trim() || !form.categoryId) {
      setDetailsError("Title, description, and category are required.");
      return;
    }

    try {
      setIsSavingDetails(true);

      const updatedTicket = await updateTicket(ticket.id, {
        title: form.title,
        description: form.description,
        categoryId: Number(form.categoryId),
        priority: ticket.priority,
      });

      setTicket(updatedTicket);
    } catch (saveError) {
      setDetailsError(getApiErrorMessage(saveError));
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleStatusChange = async (nextStatus: TicketStatus) => {
    if (!ticket || nextStatus === ticket.status) {
      return;
    }

    try {
      setIsUpdatingStatus(true);
      await updateTicketStatus(ticket.id, nextStatus);
      setTicket({ ...ticket, status: nextStatus });
    } catch (statusError) {
      setPageError(getApiErrorMessage(statusError));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (nextPriority: TicketPriority) => {
    if (!ticket || nextPriority === ticket.priority) {
      return;
    }

    try {
      setIsUpdatingPriority(true);
      await updateTicketPriority(ticket.id, nextPriority);
      setTicket({ ...ticket, priority: nextPriority });
    } catch (priorityError) {
      setPageError(getApiErrorMessage(priorityError));
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  const handleAssign = async (assignedToUserId: number) => {
    if (!ticket || assignedToUserId === ticket.assignedToUserId) {
      return;
    }

    try {
      setIsAssigning(true);
      await assignTicket(ticket.id, assignedToUserId);
      setTicket({ ...ticket, assignedToUserId });
    } catch (assignError) {
      setPageError(getApiErrorMessage(assignError));
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUploadAttachment = async () => {
    if (!ticket || !selectedFile) {
      setAttachmentError("Choose a file before uploading.");
      return;
    }

    try {
      setAttachmentError("");
      setIsUploadingAttachment(true);

      const uploadedAttachment = await uploadTicketAttachment(ticket.id, selectedFile);
      setAttachments((currentAttachments) => [uploadedAttachment, ...currentAttachments]);
      setSelectedFile(null);
    } catch (uploadError) {
      setAttachmentError(getApiErrorMessage(uploadError));
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const handleDownloadAttachment = async (attachment: ApiTicketAttachment) => {
    try {
      const blob = await downloadTicketAttachment(attachment.ticketId, attachment.attachmentId);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = attachment.originalFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (downloadError) {
      setAttachmentError(getApiErrorMessage(downloadError));
    }
  };

  const handleDeleteAttachment = async (attachment: ApiTicketAttachment) => {
    try {
      setDeletingAttachmentId(attachment.attachmentId);
      await deleteTicketAttachment(attachment.ticketId, attachment.attachmentId);
      setAttachments((currentAttachments) =>
        currentAttachments.filter((currentAttachment) => currentAttachment.attachmentId !== attachment.attachmentId),
      );
    } catch (deleteError) {
      setAttachmentError(getApiErrorMessage(deleteError));
    } finally {
      setDeletingAttachmentId(null);
    }
  };

  const handleSubmitComment = async (event: React.FormEvent) => {
    event.preventDefault();
    setCommentError("");

    if (!ticket || !commentForm.commentText.trim()) {
      setCommentError("Comment text is required.");
      return;
    }

    try {
      setIsSubmittingComment(true);

      const createdComment = await createTicketComment(ticket.id, {
        commentText: commentForm.commentText,
        isInternalNote: isStaffUser ? commentForm.isInternalNote : false,
      });

      setComments((currentComments) => [...currentComments, createdComment]);
      setCommentForm({
        commentText: "",
        isInternalNote: false,
      });
    } catch (createError) {
      setCommentError(getApiErrorMessage(createError));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleStartEditComment = (comment: ApiTicketComment) => {
    setCommentError("");
    setEditingCommentId(comment.commentId);
    setEditingCommentText(comment.commentText);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleSaveComment = async (commentId: number) => {
    if (!ticket || !editingCommentText.trim()) {
      setCommentError("Comment text is required.");
      return;
    }

    try {
      setCommentError("");
      setUpdatingCommentId(commentId);

      const updatedComment = await updateTicketComment(ticket.id, commentId, {
        commentText: editingCommentText,
      });

      setComments((currentComments) =>
        currentComments.map((comment) => (comment.commentId === commentId ? updatedComment : comment)),
      );
      handleCancelEditComment();
    } catch (updateError) {
      setCommentError(getApiErrorMessage(updateError));
    } finally {
      setUpdatingCommentId(null);
    }
  };

  const handleDeleteComment = async () => {
    if (!ticket || !commentToDelete) {
      return;
    }

    try {
      setCommentError("");
      setDeletingCommentId(commentToDelete.commentId);
      await deleteTicketComment(ticket.id, commentToDelete.commentId);
      setComments((currentComments) =>
        currentComments.filter((comment) => comment.commentId !== commentToDelete.commentId),
      );
      if (editingCommentId === commentToDelete.commentId) {
        handleCancelEditComment();
      }
      setCommentToDelete(null);
    } catch (deleteError) {
      setCommentError(getApiErrorMessage(deleteError));
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticket) {
      return;
    }

    try {
      setIsDeletingTicket(true);
      await deleteTicket(ticket.id);
      navigate("/tickets");
    } catch (deleteError) {
      setPageError(getApiErrorMessage(deleteError));
    } finally {
      setIsDeletingTicket(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading ticket...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">{pageError || "Ticket not found"}</p>
        <Link to="/tickets" className="mt-2 text-sm font-medium text-primary hover:underline">
          Back to tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AlertDialog
        open={showDeleteDialog}
        title="Delete ticket"
        description={`Are you sure you want to delete "${ticket.title}"?`}
        confirmLabel="Delete"
        isConfirming={isDeletingTicket}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          void handleDeleteTicket();
        }}
      />
      <AlertDialog
        open={commentToDelete !== null}
        title="Delete comment"
        description="Are you sure you want to delete this comment?"
        confirmLabel="Delete"
        isConfirming={deletingCommentId !== null}
        onCancel={() => setCommentToDelete(null)}
        onConfirm={() => {
          void handleDeleteComment();
        }}
      />

      <div className="flex items-center gap-3">
        <Link
          to="/tickets"
          className="rounded-md p-1.5 text-muted-foreground transition-snappy hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">{ticket.ticketNumber}</span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h1 className="truncate text-lg font-semibold text-foreground">{ticket.title}</h1>
        </div>
      </div>

      {pageError && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {pageError}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <form onSubmit={handleSaveDetails} className="space-y-4 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Ticket Details</h2>
              <button
                type="submit"
                disabled={isSavingDetails}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-snappy hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save className="h-4 w-4" />
                {isSavingDetails ? "Saving..." : "Save Details"}
              </button>
            </div>

            {detailsError && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {detailsError}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((currentForm) => ({ ...currentForm, title: event.target.value }))}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                rows={7}
                value={form.description}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    description: event.target.value,
                  }))
                }
                className="mt-1 block w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Category</label>
              <select
                value={form.categoryId}
                onChange={(event) => setForm((currentForm) => ({ ...currentForm, categoryId: event.target.value }))}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>
          </form>

          <div className="space-y-3 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Attachments</h2>
              </div>
              <span className="text-xs text-muted-foreground">{attachments.length} files</span>
            </div>

            {attachmentError && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {attachmentError}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="file"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/80"
              />
              <button
                type="button"
                onClick={() => void handleUploadAttachment()}
                disabled={isUploadingAttachment}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-snappy hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Upload className="h-4 w-4" />
                {isUploadingAttachment ? "Uploading..." : "Upload"}
              </button>
            </div>

            <div className="space-y-2">
              {attachments.length === 0 ? (
                <div className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                  No attachments yet.
                </div>
              ) : (
                attachments.map((attachment) => (
                  <div
                    key={attachment.attachmentId}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {attachment.originalFileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.max(1, Math.round(attachment.fileSize / 1024))} KB |{" "}
                        {new Date(attachment.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleDownloadAttachment(attachment)}
                        className="rounded-md p-1.5 text-muted-foreground transition-snappy hover:bg-muted hover:text-foreground"
                        aria-label={`Download ${attachment.originalFileName}`}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteAttachment(attachment)}
                        disabled={deletingAttachmentId === attachment.attachmentId}
                        className="rounded-md p-1.5 text-muted-foreground transition-snappy hover:bg-muted hover:text-destructive disabled:cursor-not-allowed disabled:opacity-70"
                        aria-label={`Delete ${attachment.originalFileName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Comments</h2>
              </div>
              <span className="text-xs text-muted-foreground">{comments.length} comments</span>
            </div>

            {commentError && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {commentError}
              </div>
            )}

            <form onSubmit={handleSubmitComment} className="space-y-3 rounded-md border border-border bg-background p-3">
              <textarea
                rows={4}
                value={commentForm.commentText}
                onChange={(event) =>
                  setCommentForm((currentForm) => ({
                    ...currentForm,
                    commentText: event.target.value,
                  }))
                }
                placeholder="Write a comment..."
                className="block w-full resize-none rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />

              <div className="flex items-center justify-between gap-3">
                {isStaffUser ? (
                  <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={commentForm.isInternalNote}
                      onChange={(event) =>
                        setCommentForm((currentForm) => ({
                          ...currentForm,
                          isInternalNote: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border border-input"
                    />
                    Internal note
                  </label>
                ) : (
                  <span className="text-xs text-muted-foreground">Comments are visible on the ticket timeline.</span>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-snappy hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Send className="h-4 w-4" />
                  {isSubmittingComment ? "Posting..." : "Add Comment"}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {comments.length === 0 ? (
                <div className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                  No comments yet.
                </div>
              ) : (
                comments.map((comment) => {
                  const isEditing = editingCommentId === comment.commentId;

                  return (
                    <div
                      key={comment.commentId}
                      className="space-y-3 rounded-md border border-border px-3 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {getUserName(comment.userId)}
                            </span>
                            {comment.isInternalNote && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                <Lock className="h-3 w-3" />
                                Internal
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                            {comment.updatedAt ? ` | Edited ${new Date(comment.updatedAt).toLocaleString()}` : ""}
                          </p>
                        </div>

                        {canManageComment(comment) && !isEditing && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEditComment(comment)}
                              className="rounded-md p-1.5 text-muted-foreground transition-snappy hover:bg-muted hover:text-foreground"
                              aria-label="Edit comment"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setCommentToDelete(comment)}
                              disabled={deletingCommentId === comment.commentId}
                              className="rounded-md p-1.5 text-muted-foreground transition-snappy hover:bg-muted hover:text-destructive disabled:cursor-not-allowed disabled:opacity-70"
                              aria-label="Delete comment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-3">
                          <textarea
                            rows={4}
                            value={editingCommentText}
                            onChange={(event) => setEditingCommentText(event.target.value)}
                            className="block w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={handleCancelEditComment}
                              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-snappy hover:bg-muted"
                            >
                              <X className="h-4 w-4" />
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleSaveComment(comment.commentId)}
                              disabled={updatingCommentId === comment.commentId}
                              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-snappy hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              <Save className="h-4 w-4" />
                              {updatingCommentId === comment.commentId ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm text-foreground">{comment.commentText}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3 rounded-lg border border-border bg-card p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workflow</h3>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={ticket.status}
                onChange={(event) => void handleStatusChange(event.target.value as TicketStatus)}
                disabled={isUpdatingStatus}
                className="mt-1 block w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Priority</label>
              <select
                value={ticket.priority}
                onChange={(event) => void handlePriorityChange(event.target.value as TicketPriority)}
                disabled={isUpdatingPriority}
                className="mt-1 block w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Assignee</label>
              <select
                value={ticket.assignedToUserId ?? ""}
                onChange={(event) => {
                  if (event.target.value) {
                    void handleAssign(Number(event.target.value));
                  }
                }}
                disabled={isAssigning || assigneeOptions.length === 0}
                className="mt-1 block w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
              >
                {ticket.assignedToUserId === null && <option value="">Unassigned</option>}
                {ticket.assignedToUserId !== null && !hasCurrentAssigneeOption && (
                  <option value={ticket.assignedToUserId}>{getUserName(ticket.assignedToUserId)}</option>
                )}
                {assigneeOptions.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.fullName}
                  </option>
                ))}
              </select>
              {assigneeOptions.length === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Assignee options are only available when user data can be loaded.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-card p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Info</h3>
            <div className="flex justify-between gap-3 text-xs">
              <span className="text-muted-foreground">Category</span>
              <span className="text-right font-medium text-foreground">
                {getCategoryName(ticket.categoryId)}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-xs">
              <span className="text-muted-foreground">Created by</span>
              <span className="text-right font-medium text-foreground">
                {getUserName(ticket.createdByUserId)}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-xs">
              <span className="text-muted-foreground">Assigned to</span>
              <span className="text-right font-medium text-foreground">
                {getUserName(ticket.assignedToUserId)}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-xs">
              <span className="text-muted-foreground">Created</span>
              <span className="text-right font-medium text-foreground">
                {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-xs">
              <span className="text-muted-foreground">Updated</span>
              <span className="text-right font-medium text-foreground">
                {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : "-"}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-destructive">Danger Zone</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Deleting a ticket hides it from the main list and cannot be undone from the UI.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground transition-snappy hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4" />
              Delete Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
