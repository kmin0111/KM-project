export type ReviewServiceType = '정기청소' | '입주청소' | '특수청소';
export type ReviewFilterType = '전체' | ReviewServiceType;
export type ReviewSort = 'latest' | 'rating';

export interface Review {
  id: number;
  type: ReviewServiceType;
  rating: number;
  content: string;
  author: string;
  authorId: number;
  useCount: number;
  createdAt: string;
}

export interface ReviewListParams {
  page: number;
  size: number;
  type?: ReviewServiceType;
  sort: ReviewSort;
  authorId?: number;
}

export interface ReviewListResponse {
  content: Review[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  averageRating: number;
}
