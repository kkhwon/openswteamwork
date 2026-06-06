export type Priority = "높음" | "보통" | "낮음";
export type Category = "학습" | "과제" | "개인" | "기타";

export interface Todo {
  id: string;
  title: string;
  dueDate: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  priority: Priority;
  category: Category;
  progress: number; // 0 to 100
  memo: string;
  notify: boolean;
  completed: boolean;
}

export interface TimeCapsule {
  id: string;
  unlockDate: string; // "YYYY-MM-DD"
  content: string;
  createdAt: string; // "YYYY-MM-DD"
}

export interface Quote {
  text: string;
  author: string;
}

export interface TimetableEvent {
  id: string;
  title: string;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  dayOfWeek: number; // 0 (일) to 6 (토)
  color: string;
}
