import React, { useState, useRef, useEffect } from 'react';
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
  const [resizeStart, setResizeStart] = useState<{ x: number; date: Date; edge: 'start' | 'end' } | null>(null);
  const taskRef = useRef<HTMLDivElement>(null);
  
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
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      date: edge === 'start' ? task.startDate : task.endDate,
      edge,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !resizeStart || !taskRef.current) return;

    // Get the calendar grid container
    const calendarGrid = taskRef.current.closest('.grid');
    if (!calendarGrid) return;

    const gridRect = calendarGrid.getBoundingClientRect();
    const dayWidth = gridRect.width / 7; // 7 days in a week
    
    const deltaX = e.clientX - resizeStart.x;
    const daysDelta = Math.round(deltaX / dayWidth);

    // Allow more sensitive resizing
    if (Math.abs(daysDelta) >= 0.5) {
      const newDate = new Date(resizeStart.date);
      newDate.setDate(newDate.getDate() + daysDelta);

      const updatedTask = { ...task };
      
      if (resizeStart.edge === 'start') {
        // Resizing start date - allow extending backwards
        updatedTask.startDate = newDate;
      } else {
        // Resizing end date - allow extending forwards
        updatedTask.endDate = newDate;
      }

      // Ensure minimum 1-day duration
      if (updatedTask.startDate < updatedTask.endDate) {
        dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
        setResizeStart({ 
          x: e.clientX, 
          date: newDate,
          edge: resizeStart.edge 
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setResizeStart(null);
  };

  useEffect(() => {
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
      ref={(node) => {
        setNodeRef(node);
        if (node) taskRef.current = node;
      }}
      {...attributes}
      {...listeners}
      className={`task-bar ${task.category} absolute top-0 left-0 right-0 z-10 ${isResizing ? 'resizing' : ''}`}
      style={{
        ...style,
        width: `${getTaskWidth()}%`,
        left: `${getTaskPosition()}%`,
        marginTop: `${dayIndex * 24}px`,
        cursor: isResizing ? 'col-resize' : 'grab',
      }}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between h-full relative">
        {/* Left resize handle - always visible for better UX */}
        <div
          className="resize-handle left-0 w-2"
          onMouseDown={(e) => handleMouseDown(e, 'start')}
          title="Drag to resize start date"
          style={{ opacity: isFirstDay ? 1 : 0.3 }}
        />
        
        {/* Task content */}
        <span className="flex-1 px-1 text-xs truncate z-10">
          {isFirstDay ? task.name : ''}
        </span>
        
        {/* Right resize handle - always visible for better UX */}
        <div
          className="resize-handle right-0 w-2"
          onMouseDown={(e) => handleMouseDown(e, 'end')}
          title="Drag to resize end date"
          style={{ opacity: isLastDay ? 1 : 0.3 }}
        />
      </div>
    </div>
  );
}
