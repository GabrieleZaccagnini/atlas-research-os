import { z } from 'zod';
import { webUrl } from './project-details';
export const calendarDate = z.string().refine(value => !value || (/^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value), 'Use a valid calendar date');
export const reviewEntrySchema = z.object({
  id: z.string().uuid(), recordedAt: z.string().datetime(), note: z.string().trim().min(1).max(5000),
  nextAction: z.string().max(1000), nextReviewOn: calendarDate,
});
export const reviewSchema = z.object({
  nextAction: z.string().max(1000).default(''), nextReviewOn: calendarDate.default(''),
  entries: z.array(reviewEntrySchema).max(100).default([]),
}).default({});
export const catalystSchema = z.object({
  id: z.string().uuid(), title: z.string().trim().min(1).max(200), date: calendarDate.refine(Boolean, 'Choose a date'),
  sourceUrl: webUrl, notes: z.string().max(2000),
});
// Local calendar dates avoid moving reviews into yesterday/tomorrow through UTC conversion.
export function localDay(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function displayDay(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
export type Review = z.infer<typeof reviewSchema>;
export type Catalyst = z.infer<typeof catalystSchema>;
