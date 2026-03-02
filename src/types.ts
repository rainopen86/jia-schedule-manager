export type DayOfWeek = '월' | '화' | '수' | '목' | '금' | '토' | '일';

export interface ScheduleItem {
  id: string;
  title: string;
  day: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  color: string;
  location?: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}
