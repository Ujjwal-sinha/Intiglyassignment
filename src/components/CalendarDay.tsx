import React, { useRef, useState } from 'react';
import type { CalendarDay as CalendarDayType, Task } from '../types';
import { useCalendar } from '../context/CalendarContext';
import { useDroppable } from '@dnd-kit/core';
import { TaskBar } from './TaskBar';
import { getDayNumber } from '../utils/dateUtils';
import { getTasksForDay, filterTasks } from '../utils/taskUtils';
import { startOfWeek } from 'date-fns';

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
    // Normalize both dates to start of day for proper comparison
    const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
    const taskStart = new Date(task.startDate.getFullYear(), task.startDate.getMonth(), task.startDate.getDate());
    const taskEnd = new Date(task.endDate.getFullYear(), task.endDate.getMonth(), task.endDate.getDate());
    
    // Check if this day is within the task range
    const isInTaskRange = dayStart >= taskStart && dayStart <= taskEnd;
    
    if (!isInTaskRange) {
      return { task, isFirstDay: false };
    }
    
    // For tasks spanning multiple days, render the task bar on the first day it appears in this week
    const weekStart = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate());
    
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
      
      <div className="relative min-h-[100px]">
        {dayTasks.map((task, index) => {
          const { isFirstDay } = getTaskForDay(task, day.date);
          return (
            <TaskBar
              key={`${task.id}-${day.date.toISOString()}`}
              task={task}
              isFirstDay={isFirstDay}
              dayIndex={index}
              weekStartDate={weekStartDate}
            />
          );
        })}
      </div>
    </div>
  );
}
