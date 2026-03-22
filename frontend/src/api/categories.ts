import { apiDelete, apiGet, apiPost, apiPut } from "./client";

export type Category = {
  categoryId: number;
  categoryName: string;
  description: string | null;
  isActive?: boolean;
  createdAt?: string;
};

export type CategoryPayload = {
  categoryName: string;
  description: string | null;
};

export type DeleteCategoryResponse = {
  message: string;
};

export function getCategories() {
  return apiGet<Category[]>("/categories");
}

export function getCategoryById(categoryId: number) {
  return apiGet<Category>(`/categories/${categoryId}`);
}

export function createCategory(payload: CategoryPayload) {
  return apiPost<Category, CategoryPayload>("/categories", payload);
}

export function updateCategory(categoryId: number, payload: CategoryPayload) {
  return apiPut<Category, CategoryPayload>(`/categories/${categoryId}`, payload);
}

export function deleteCategory(categoryId: number) {
  return apiDelete<DeleteCategoryResponse>(`/categories/${categoryId}`);
}
