import React, { useRef, useState } from 'react';
import type { CalendarDay as CalendarDayType, Task } from '../types';
import { useCalendar } from '../context/CalendarContext';
import { useDroppable } from '@dnd-kit/core';
import { TaskBar } from './TaskBar';
import { getDayNumber } from '../utils/dateUtils';
import { getTasksForDay, filterTasks } from '../utils/taskUtils';

interface CalendarDayProps {
  day: CalendarDayType;
  onDragStart: (date: Date) => void;
  onDragOver: (date: Date) => void;
  onDragEnd: () => void;
}

export function CalendarDay({ day, onDragStart, onDragOver, onDragEnd }: CalendarDayProps) {
  const { state } = useCalendar();
  const { tasks } = state;
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
    const isFirstDay = dayDate.getTime() === task.startDate.getTime();
    return { task, isFirstDay };
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        dayRef.current = node;
      }}
      className={`calendar-day ${day.isToday ? 'today' : ''} ${!day.isCurrentMonth ? 'other-month' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
    >
      <div className="text-sm font-medium mb-1">
        {getDayNumber(day.date)}
      </div>
      
      <div className="relative min-h-[60px]">
        {dayTasks.map((task, index) => {
          const { isFirstDay } = getTaskForDay(task, day.date);
          return (
            <TaskBar
              key={`${task.id}-${day.date.toISOString()}`}
              task={task}
              isFirstDay={isFirstDay}
              dayIndex={index}
            />
          );
        })}
      </div>
    </div>
  );
}
