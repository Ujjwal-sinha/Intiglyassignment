import type { Task, FilterState } from '../types';
import { isDateInRange, getWeeksFromToday } from './dateUtils';

export function filterTasks(tasks: Task[], filters: FilterState): Task[] {
  return tasks.filter(task => {
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(task.category)) {
      return false;
    }

    // Duration filter
    if (filters.duration !== null) {
      const { start, end } = getWeeksFromToday(filters.duration);
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      
      // Check if task overlaps with the duration range
      const taskOverlaps = !(taskEnd < start || taskStart > end);
      if (!taskOverlaps) {
        return false;
      }
    }

    // Search filter
    if (filters.searchQuery && !task.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });
}

export function getTasksForDay(tasks: Task[], date: Date): Task[] {
  return tasks.filter(task => isDateInRange(date, task.startDate, task.endDate));
}

export function sortTasksByDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const startComparison = a.startDate.getTime() - b.startDate.getTime();
    if (startComparison !== 0) return startComparison;
    return a.endDate.getTime() - b.endDate.getTime();
  });
}

export function getTaskPosition(task: Task, date: Date): { isFirstDay: boolean; isLastDay: boolean } {
  const isFirstDay = isDateInRange(date, task.startDate, task.startDate);
  const isLastDay = isDateInRange(date, task.endDate, task.endDate);
  return { isFirstDay, isLastDay };
}
