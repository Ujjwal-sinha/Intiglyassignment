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
      return { task, isFirstDay: false, isLastDay: false, isMiddleDay: false };
    }
    
    // Determine the position of this day in the task range
    const isFirstDay = dayStart.getTime() === taskStart.getTime();
    const isLastDay = dayStart.getTime() === taskEnd.getTime();
    const isMiddleDay = !isFirstDay && !isLastDay;
    
    return { task, isFirstDay, isLastDay, isMiddleDay };
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
          .filter(({ isFirstDay, isLastDay, isMiddleDay }) => isFirstDay || isLastDay || isMiddleDay)
          .map(({ originalTask, index, isFirstDay, isLastDay, isMiddleDay }) => (
            <TaskBar
              key={`task-${originalTask.id}-day-${day.date.toISOString()}`}
              task={originalTask}
              isFirstDay={isFirstDay}
              dayIndex={index}
              weekStartDate={weekStartDate}
              isLastDay={isLastDay}
              isMiddleDay={isMiddleDay}
            />
          ))}
      </div>
    </div>
  );
}
