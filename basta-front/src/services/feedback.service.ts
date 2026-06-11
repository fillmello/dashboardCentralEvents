import api from '@/src/lib/api';
 
export type CreateFeedbackDto = {
  description: string;
};
 
export type AnswerFeedbackDto = {
  adminResponse: string;
};
 
export const feedbackService = {
  create: (productReleaseId: number, dto: CreateFeedbackDto) =>
    api.post(`/feedback/${productReleaseId}`, dto),
 
  update: (feedbackId: number, dto: CreateFeedbackDto) =>
    api.patch(`/feedback/${feedbackId}`, dto),

  remove: (feedbackId: number) =>
    api.delete(`/feedback/${feedbackId}`),
 
  findAll: () =>
    api.get('/feedback'),
 
  answer: (feedbackId: number, dto: AnswerFeedbackDto) =>
    api.patch(`/feedback/${feedbackId}/answer`, dto),
};
 