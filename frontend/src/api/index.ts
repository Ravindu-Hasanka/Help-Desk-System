export {
  apiClient,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  clearAuthTokens,
  clearAccessToken,
  clearRefreshToken,
  getAccessToken,
  getApiErrorMessage,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "./client";

export type { ApiErrorResponse } from "./client";
export {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "./categories";
export {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
  updateUserStatus,
} from "./users";
export {
  getAgentPerformance,
  getDashboardSummary,
  getTicketsByCategory,
  getTicketsByPriority,
  getTicketsByStatus,
} from "./dashboard";
export {
  createTicketComment,
  deleteTicketComment,
  getTicketComments,
  updateTicketComment,
} from "./comments";
export {
  getTicketReports,
} from "./reports";
export {
  assignTicket,
  createTicket,
  deleteTicket,
  deleteTicketAttachment,
  downloadTicketAttachment,
  getTicketAttachments,
  getTicketById,
  getTickets,
  updateTicket,
  updateTicketPriority,
  updateTicketStatus,
  uploadTicketAttachment,
} from "./tickets";

export { getMe, login, refresh } from "./auth";

export type {
  Category,
  CategoryPayload,
  DeleteCategoryResponse,
} from "./categories";
export type {
  CreateUserPayload,
  DeleteUserResponse as DeleteUserApiResponse,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  User as ApiUser,
  UserFilters,
  UserRole,
} from "./users";
export type {
  AgentPerformanceItem,
  DashboardChartItem,
  DashboardSummary,
} from "./dashboard";
export type {
  CreateTicketCommentPayload,
  TicketComment as ApiTicketComment,
  UpdateTicketCommentPayload,
} from "./comments";
export type {
  TicketReport as ApiTicketReport,
  TicketReportFilters,
} from "./reports";
export type {
  CreateTicketPayload,
  Ticket as ApiTicket,
  TicketAttachment as ApiTicketAttachment,
  TicketFilters,
  TicketPriority,
  TicketStatus,
  UpdateTicketPayload,
} from "./tickets";

export type {
  AuthTokens,
  CurrentUser,
  LoginPayload,
  RefreshAccessTokenResponse,
} from "./auth";
