import { isSameDay, startOfDay } from 'date-fns';
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

export function getTaskDisplayInfo(task: Task, dayDate: Date, weekStartDate: Date) {
  const taskStart = startOfDay(task.startDate);
  const taskEnd = startOfDay(task.endDate);
  const currentDay = startOfDay(dayDate);
  const weekStart = startOfDay(weekStartDate);
  
  // Check if this day is part of the task
  const isInTask = currentDay >= taskStart && currentDay <= taskEnd;
  if (!isInTask) return null;
  
  // Calculate position within the week (0-6)
  const dayOfWeek = Math.floor((currentDay.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
  const taskStartDayOfWeek = Math.max(0, Math.floor((taskStart.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)));
  const taskEndDayOfWeek = Math.min(6, Math.floor((taskEnd.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Determine if this is the first or last day of the task in this week
  const isFirstDay = isSameDay(currentDay, taskStart);
  const isLastDay = isSameDay(currentDay, taskEnd);
  const isFirstInWeek = dayOfWeek === taskStartDayOfWeek;
  const isLastInWeek = dayOfWeek === taskEndDayOfWeek;
  
  // Calculate width and position as percentages
  const width = ((taskEndDayOfWeek - taskStartDayOfWeek + 1) / 7) * 100;
  const left = (taskStartDayOfWeek / 7) * 100;
  
  return {
    isFirstDay,
    isLastDay,
    isFirstInWeek,
    isLastInWeek,
    width,
    left,
    dayOfWeek,
    taskStartDayOfWeek,
    taskEndDayOfWeek,
    showTaskName: isFirstInWeek || isFirstDay
  };
}
