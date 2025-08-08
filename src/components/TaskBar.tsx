import React, { useState } from 'react';
import type { Task } from '../types';
import { useCalendar } from '../context/CalendarContext';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface TaskBarProps {
  task: Task;
  isFirstDay: boolean;
  isLastDay: boolean;
  dayIndex: number;
}

export function TaskBar({ task, isFirstDay, isLastDay, dayIndex }: TaskBarProps) {
  const { dispatch } = useCalendar();
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState<{ x: number; date: Date } | null>(null);
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `task-${task.id}`,
    data: {
      task,
      type: 'task',
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const handleMouseDown = (e: React.MouseEvent, edge: 'start' | 'end') => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      date: edge === 'start' ? task.startDate : task.endDate,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !resizeStart) return;

    const deltaX = e.clientX - resizeStart.x;
    const dayWidth = 100; // Approximate day width
    const daysDelta = Math.round(deltaX / dayWidth);

    if (Math.abs(daysDelta) >= 1) {
      const newDate = new Date(resizeStart.date);
      newDate.setDate(newDate.getDate() + daysDelta);

      const updatedTask = { ...task };
      if (resizeStart.date === task.startDate) {
        updatedTask.startDate = newDate;
      } else {
        updatedTask.endDate = newDate;
      }

      // Ensure start date is before end date
      if (updatedTask.startDate <= updatedTask.endDate) {
        dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
        setResizeStart({ x: e.clientX, date: newDate });
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setResizeStart(null);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, resizeStart]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: 'SET_MODAL',
      payload: {
        isOpen: true,
        task,
        mode: 'edit',
      },
    });
  };

  const getTaskWidth = () => {
    const daysDiff = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(daysDiff * 100, 100); // Cap at 100% width
  };

  const getTaskPosition = () => {
    if (isFirstDay) {
      return 0;
    }
    return 0; // For now, all tasks start at the left edge
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`task-bar ${task.category} absolute top-0 left-0 right-0 z-10`}
      style={{
        ...style,
        width: `${getTaskWidth()}%`,
        left: `${getTaskPosition()}%`,
        marginTop: `${dayIndex * 24}px`,
        cursor: isResizing ? 'col-resize' : 'grab',
      }}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between h-full">
        {isFirstDay && (
          <div
            className="w-2 h-full bg-black bg-opacity-20 cursor-col-resize"
            onMouseDown={(e) => handleMouseDown(e, 'start')}
          />
        )}
        
        <span className="flex-1 px-1 text-xs truncate">
          {isFirstDay ? task.name : ''}
        </span>
        
        {isLastDay && (
          <div
            className="w-2 h-full bg-black bg-opacity-20 cursor-col-resize"
            onMouseDown={(e) => handleMouseDown(e, 'end')}
          />
        )}
      </div>
    </div>
  );
}
