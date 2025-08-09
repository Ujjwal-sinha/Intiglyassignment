import React, { useRef, useState } from 'react';
import type { CalendarDay as CalendarDayType, Task } from '../types';
import { useCalendar } from '../context/CalendarContext';
import { useDroppable } from '@dnd-kit/core';
import { TaskBar } from './TaskBar';
import { getDayNumber } from '../utils/dateUtils';
import { getTasksForDay, filterTasks } from '../utils/taskUtils';
import { startOfWeek, startOfDay } from 'date-fns';

interface CalendarDayProps {
  day: CalendarDayType;
  onDragStart: (date: Date) => void;
  onDragOver: (date: Date) => void;
  onDragEnd: () => void;
}

export function CalendarDay({ day, onDragStart, onDragOver, onDragEnd }: CalendarDayProps) {
  const { state } = useCalendar();
  const { tasks, dragSelection } = state;
  const [isDragging, setIsDragging] = useState(false);
  const dayRef = useRef<HTMLDivElement>(null);

  const { setNodeRef } = useDroppable({
    id: `day-${day.date.toISOString()}`,
    data: {
      date: day.date,
      type: 'day',
    },
  });

  // Filter tasks for this day
  const filteredTasks = filterTasks(tasks, state.filters);
  const dayTasks = getTasksForDay(filteredTasks, day.date);
  
  // Calculate week start date for D3 scale
  const weekStartDate = startOfWeek(day.date);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    setIsDragging(true);
    onDragStart(day.date);
  };

  const handleMouseEnter = () => {
    if (isDragging) {
      onDragOver(day.date);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd();
    }
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const getTaskForDay = (task: Task, dayDate: Date) => {
    // Normalize dates to start of day for proper comparison
    const dayStart = startOfDay(dayDate);
    const taskStart = startOfDay(task.startDate);
    const taskEnd = startOfDay(task.endDate);
    
    // Check if this day is within the task range
    const isInTaskRange = dayStart >= taskStart && dayStart <= taskEnd;
    
    if (!isInTaskRange) {
      return { task, isFirstDay: false };
    }
    
    // For multi-day tasks, only render the TaskBar on the FIRST day it appears in this week
    // This prevents duplicate rendering across multiple days
    const weekStart = startOfDay(weekStartDate);
    
    // The first day to render the task bar is the later of:
    // 1. The task's actual start date
    // 2. The start of this week
    const firstDayInWeek = taskStart >= weekStart ? taskStart : weekStart;
    const isFirstDay = dayStart.getTime() === firstDayInWeek.getTime();
    
    return { task, isFirstDay };
  };

  const getSelectionState = () => {
    if (!dragSelection.isSelecting || !dragSelection.startDate) {
      return { isSelected: false, isSelecting: false };
    }
    
    const startTime = new Date(dragSelection.startDate).getTime();
    const currentTime = new Date(day.date).getTime();
    
    if (!dragSelection.endDate) {
      // Just started dragging
      return {
        isSelected: currentTime === startTime,
        isSelecting: currentTime === startTime
      };
    }
    
    const endTime = new Date(dragSelection.endDate).getTime();
    const minTime = Math.min(startTime, endTime);
    const maxTime = Math.max(startTime, endTime);
    
    return {
      isSelected: currentTime >= minTime && currentTime <= maxTime,
      isSelecting: dragSelection.isSelecting
    };
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        dayRef.current = node;
      }}
      data-date={day.date.toISOString()}
      className={`calendar-day ${day.isToday ? 'today' : ''} ${!day.isCurrentMonth ? 'other-month' : ''} ${getSelectionState().isSelected ? 'selected-range' : ''} ${getSelectionState().isSelecting && !getSelectionState().isSelected ? 'selecting' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
    >
      <div className="text-sm font-medium mb-1">
        {getDayNumber(day.date)}
      </div>
      
      <div className="relative min-h-[240px] overflow-visible">
        {dayTasks
          .map((task, index) => ({ originalTask: task, index, ...getTaskForDay(task, day.date) }))
          .filter(({ isFirstDay }) => isFirstDay) // Only render on first day
          .map(({ originalTask, index }) => (
            <TaskBar
              key={`task-${originalTask.id}-week-${weekStartDate.toISOString()}`}
              task={originalTask}
              isFirstDay={true}
              dayIndex={index}
              weekStartDate={weekStartDate}
            />
          ))}
      </div>
    </div>
  );
}
