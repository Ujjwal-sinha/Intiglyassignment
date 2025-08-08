export type TaskCategory = 'todo' | 'in-progress' | 'review' | 'completed';

export interface Task {
  id: string;
  name: string;
  category: TaskCategory;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

export interface DragSelection {
  startDate: Date | null;
  endDate: Date | null;
  isSelecting: boolean;
}

export interface FilterState {
  categories: TaskCategory[];
  duration: number | null; // weeks from today
  searchQuery: string;
}

export interface TaskModalState {
  isOpen: boolean;
  task: Partial<Task> | null;
  mode: 'create' | 'edit';
}
