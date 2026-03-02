import { DayOfWeek } from './types';

export const DAYS: DayOfWeek[] = ['월', '화', '수', '목', '금'];

export const COLORS = [
  { name: 'Soft Blue', value: '#E0F2FE' },
  { name: 'Soft Green', value: '#DCFCE7' },
  { name: 'Soft Yellow', value: '#FEF9C3' },
  { name: 'Soft Red', value: '#FEE2E2' },
  { name: 'Soft Purple', value: '#F3E8FF' },
  { name: 'Soft Orange', value: '#FFEDD5' },
  { name: 'Soft Pink', value: '#FCE7F3' },
];

export const TIME_SLOTS = Array.from({ length: 21 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});
