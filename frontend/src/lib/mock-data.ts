// Mock data types and data for the help desk system

export type UserRole = 'admin' | 'agent' | 'user';
export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type TicketPriority = 'critical' | 'high' | 'medium' | 'low';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  createdAt: string;
}

export interface Category {
  id: number;
  categoryName: string;
  description: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  categoryId: number;
  createdByUserId: number;
  assignedToUserId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  ticketId: number;
  userId: number;
  commentText: string;
  isInternalNote: boolean;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  isRead: boolean;
  ticketId?: number;
  createdAt: string;
}

export const mockUsers: User[] = [
  { id: 1, fullName: 'Admin User', email: 'admin@sentinel.com', role: 'admin', isActive: true, createdAt: '2024-01-15' },
  { id: 2, fullName: 'Sarah Chen', email: 'sarah@sentinel.com', role: 'agent', isActive: true, createdAt: '2024-02-01' },
  { id: 3, fullName: 'Mike Johnson', email: 'mike@sentinel.com', role: 'agent', isActive: true, createdAt: '2024-02-10' },
  { id: 4, fullName: 'John Silva', email: 'john@gmail.com', role: 'user', isActive: true, createdAt: '2024-03-01' },
  { id: 5, fullName: 'Emily Davis', email: 'emily@gmail.com', role: 'user', isActive: true, createdAt: '2024-03-05' },
  { id: 6, fullName: 'Robert Wilson', email: 'robert@company.com', role: 'user', isActive: false, createdAt: '2024-01-20' },
];

export const mockCategories: Category[] = [
  { id: 1, categoryName: 'Login Issue', description: 'Authentication related issues' },
  { id: 2, categoryName: 'Billing', description: 'Payment and subscription issues' },
  { id: 3, categoryName: 'Bug Report', description: 'Software bugs and errors' },
  { id: 4, categoryName: 'Feature Request', description: 'New feature suggestions' },
  { id: 5, categoryName: 'Account', description: 'Account management issues' },
];

export const mockTickets: Ticket[] = [
  { id: 1, ticketNumber: 'TKT-001', title: 'Cannot login with correct password', description: 'I cannot login with my correct password. I have tried resetting it but still not working.', status: 'open', priority: 'high', categoryId: 1, createdByUserId: 4, assignedToUserId: 2, createdAt: '2024-03-10T09:00:00Z', updatedAt: '2024-03-10T09:00:00Z' },
  { id: 2, ticketNumber: 'TKT-002', title: 'Double charged for subscription', description: 'I was charged twice for my monthly subscription in March.', status: 'in-progress', priority: 'critical', categoryId: 2, createdByUserId: 5, assignedToUserId: 2, createdAt: '2024-03-09T14:30:00Z', updatedAt: '2024-03-10T10:00:00Z' },
  { id: 3, ticketNumber: 'TKT-003', title: 'Dashboard charts not loading', description: 'The analytics dashboard charts show a blank white area since yesterday.', status: 'open', priority: 'medium', categoryId: 3, createdByUserId: 4, assignedToUserId: 3, createdAt: '2024-03-08T11:00:00Z', updatedAt: '2024-03-08T11:00:00Z' },
  { id: 4, ticketNumber: 'TKT-004', title: 'Add dark mode support', description: 'It would be great to have a dark mode option for the application.', status: 'open', priority: 'low', categoryId: 4, createdByUserId: 5, assignedToUserId: null, createdAt: '2024-03-07T16:00:00Z', updatedAt: '2024-03-07T16:00:00Z' },
  { id: 5, ticketNumber: 'TKT-005', title: 'Cannot update profile picture', description: 'When I try to upload a new profile picture, it shows an error.', status: 'resolved', priority: 'medium', categoryId: 5, createdByUserId: 4, assignedToUserId: 2, createdAt: '2024-03-06T08:00:00Z', updatedAt: '2024-03-09T15:00:00Z' },
  { id: 6, ticketNumber: 'TKT-006', title: 'Export to PDF not working', description: 'The export to PDF feature throws a 500 error on the reports page.', status: 'in-progress', priority: 'high', categoryId: 3, createdByUserId: 5, assignedToUserId: 3, createdAt: '2024-03-05T10:00:00Z', updatedAt: '2024-03-08T14:00:00Z' },
  { id: 7, ticketNumber: 'TKT-007', title: 'Password reset email not received', description: 'I requested a password reset but never got the email.', status: 'closed', priority: 'high', categoryId: 1, createdByUserId: 6, assignedToUserId: 2, createdAt: '2024-03-01T09:00:00Z', updatedAt: '2024-03-03T12:00:00Z' },
  { id: 8, ticketNumber: 'TKT-008', title: 'Need bulk user import feature', description: 'We need the ability to import users via CSV file for onboarding.', status: 'open', priority: 'medium', categoryId: 4, createdByUserId: 4, assignedToUserId: null, createdAt: '2024-03-11T08:00:00Z', updatedAt: '2024-03-11T08:00:00Z' },
];

export const mockComments: Comment[] = [
  { id: 1, ticketId: 1, userId: 4, commentText: 'I have been trying for 2 days now. Please help!', isInternalNote: false, createdAt: '2024-03-10T09:05:00Z' },
  { id: 2, ticketId: 1, userId: 2, commentText: 'Hi John, I can see your account. Let me check the authentication logs.', isInternalNote: false, createdAt: '2024-03-10T09:30:00Z' },
  { id: 3, ticketId: 1, userId: 2, commentText: 'Auth logs show the password hash mismatch. Might be a migration issue.', isInternalNote: true, createdAt: '2024-03-10T09:35:00Z' },
  { id: 4, ticketId: 2, userId: 5, commentText: 'I have attached my bank statement showing both charges.', isInternalNote: false, createdAt: '2024-03-09T14:35:00Z' },
  { id: 5, ticketId: 2, userId: 2, commentText: 'Thank you Emily. I have escalated this to our billing team. We will process the refund within 3-5 business days.', isInternalNote: false, createdAt: '2024-03-10T10:00:00Z' },
];

export const mockNotifications: Notification[] = [
  { id: 1, userId: 1, message: 'New ticket TKT-008 has been created', isRead: false, ticketId: 8, createdAt: '2024-03-11T08:00:00Z' },
  { id: 2, userId: 1, message: 'Ticket TKT-002 status changed to In Progress', isRead: false, ticketId: 2, createdAt: '2024-03-10T10:00:00Z' },
  { id: 3, userId: 1, message: 'New comment on TKT-001', isRead: true, ticketId: 1, createdAt: '2024-03-10T09:30:00Z' },
];

// Current logged in user (mock)
export const currentUser: User = mockUsers[0]; // Admin

export function getUserById(id: number): User | undefined {
  return mockUsers.find(u => u.id === id);
}

export function getCategoryById(id: number): Category | undefined {
  return mockCategories.find(c => c.id === id);
}
