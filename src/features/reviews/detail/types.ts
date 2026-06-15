import type { ReviewServiceType } from '../list/types';

export interface RatingBreakdown {
  thoroughness: number;
  punctuality: number;
  kindness: number;
  satisfaction: number;
}

export interface ReviewPhoto {
  id: number;
  beforeUrl: string;
  afterUrl: string;
}

export interface OwnerReply {
  id: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewDetail {
  id: number;
  type: ReviewServiceType;
  rating: number;
  ratingBreakdown: RatingBreakdown;
  content: string;
  author: string;
  authorId: number;
  authorProfileUrl?: string;
  useCount: number;
  createdAt: string;
  photos: ReviewPhoto[];
  ownerReply?: OwnerReply;
}

export interface CreateReplyRequest {
  content: string;
}

export interface UpdateReplyRequest {
  content: string;
}
