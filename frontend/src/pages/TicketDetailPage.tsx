import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Send, Lock } from "lucide-react";
import { useState } from "react";
import { mockTickets, mockComments, mockCategories, mockUsers, getUserById, getCategoryById } from "../lib/mock-data";
import { StatusBadge, PriorityBadge } from "../components/StatusBadge";
import type { TicketStatus, TicketPriority } from "../lib/mock-data";

export default function TicketDetailPage() {
  const { id } = useParams();
  const ticket = mockTickets.find(t => t.id === Number(id));
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Ticket not found</p>
        <Link to="/tickets" className="mt-2 text-sm font-medium text-primary hover:underline">Back to tickets</Link>
      </div>
    );
  }

  const comments = mockComments.filter(c => c.ticketId === ticket.id);
  const creator = getUserById(ticket.createdByUserId);
  const assignee = ticket.assignedToUserId ? getUserById(ticket.assignedToUserId) : null;
  const category = getCategoryById(ticket.categoryId);
  const agents = mockUsers.filter(u => u.role === 'agent' || u.role === 'admin');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/tickets" className="rounded-md p-1.5 text-muted-foreground transition-snappy hover:bg-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">{ticket.ticketNumber}</span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h1 className="text-lg font-semibold text-foreground">{ticket.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-4">
        {/* Main content - conversation */}
        <div className="space-y-4">
          {/* Description */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                {creator?.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="text-sm font-medium text-foreground">{creator?.fullName}</span>
              <span className="text-xs text-muted-foreground">{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{ticket.description}</p>
          </div>

          {/* Comments */}
          {comments.map(comment => {
            const author = getUserById(comment.userId);
            return (
              <div key={comment.id} className={`rounded-lg border p-4 ${comment.isInternalNote ? 'border-status-in-progress/30 bg-[hsl(var(--status-in-progress)/0.05)]' : 'border-border bg-card'}`}>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    {author?.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm font-medium text-foreground">{author?.fullName}</span>
                  {comment.isInternalNote && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-[hsl(var(--status-in-progress)/0.1)] px-1.5 py-0.5 text-[10px] font-medium text-status-in-progress">
                      <Lock className="h-3 w-3" />Internal
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground">{comment.commentText}</p>
              </div>
            );
          })}

          {/* Comment input */}
          <div className="rounded-lg border border-border bg-card p-4">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              className="w-full resize-none rounded-md border border-input bg-background p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="mt-2 flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} className="rounded" />
                Internal note
              </label>
              <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-snappy hover:bg-primary/90">
                <Send className="h-3.5 w-3.5" />
                Reply
              </button>
            </div>
          </div>
        </div>

        {/* Metadata sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</h3>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select defaultValue={ticket.status} className="mt-1 block w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Priority</label>
              <select defaultValue={ticket.priority} className="mt-1 block w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select defaultValue={ticket.categoryId} className="mt-1 block w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                {mockCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Assignee</label>
              <select defaultValue={ticket.assignedToUserId ?? ''} className="mt-1 block w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Unassigned</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Info</h3>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Created by</span>
              <span className="font-medium text-foreground">{creator?.fullName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium text-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Updated</span>
              <span className="font-medium text-foreground">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
