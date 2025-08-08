import React, { useState, useRef, useEffect } from 'react';
import type { Task } from '../types';
import { useCalendar } from '../context/CalendarContext';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { addDays, isAfter, isBefore } from 'date-fns';

interface TaskBarProps {
  task: Task;
  isFirstDay: boolean;
  dayIndex: number;
}

export function TaskBar({ task, isFirstDay, dayIndex }: TaskBarProps) {
  const { dispatch } = useCalendar();
  const [isResizing, setIsResizing] = useState(false);
  const [resizeMode, setResizeMode] = useState<'start' | 'end' | null>(null);
  const [tempTask, setTempTask] = useState<Task | null>(null);
  const taskRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startDateRef = useRef<Date | null>(null);
  
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

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, edge: 'start' | 'end') => {
    e.stopPropagation();
    e.preventDefault();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    
    setIsResizing(true);
    setResizeMode(edge);
    setTempTask({ ...task });
    startXRef.current = clientX;
    startDateRef.current = edge === 'start' ? new Date(task.startDate) : new Date(task.endDate);
  };

  // Handle resize move
  const handleResizeMove = (e: MouseEvent | TouchEvent) => {
    if (!isResizing || !resizeMode || !tempTask || !taskRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    
    // Get the calendar grid container
    const calendarGrid = taskRef.current.closest('.grid');
    if (!calendarGrid) return;

    const gridRect = calendarGrid.getBoundingClientRect();
    const dayWidth = gridRect.width / 7; // 7 days in a week
    
    const deltaX = clientX - startXRef.current;
    const daysDelta = Math.round(deltaX / dayWidth);

    if (daysDelta !== 0 && startDateRef.current) {
      const updatedTask = { ...tempTask };
      
      if (resizeMode === 'start') {
        // Resizing start date
        const newStartDate = addDays(startDateRef.current, daysDelta);
        
        // Prevent start date from going after end date
        if (!isAfter(newStartDate, updatedTask.endDate)) {
          updatedTask.startDate = newStartDate;
          setTempTask(updatedTask);
        }
      } else {
        // Resizing end date
        const newEndDate = addDays(startDateRef.current, daysDelta);
        
        // Prevent end date from going before start date
        if (!isBefore(newEndDate, updatedTask.startDate)) {
          updatedTask.endDate = newEndDate;
          setTempTask(updatedTask);
        }
      }
    }
  };

  // Handle resize end
  const handleResizeEnd = () => {
    if (isResizing && tempTask) {
      // Only commit if the task actually changed
      const startChanged = tempTask.startDate.getTime() !== task.startDate.getTime();
      const endChanged = tempTask.endDate.getTime() !== task.endDate.getTime();
      
      if (startChanged || endChanged) {
        dispatch({ type: 'UPDATE_TASK', payload: tempTask });
      }
    }
    
    setIsResizing(false);
    setResizeMode(null);
    setTempTask(null);
    startXRef.current = 0;
    startDateRef.current = null;
  };

  // Add event listeners for resize
  useEffect(() => {
    if (isResizing) {
      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        handleResizeMove(e);
      };
      const handleMouseUp = () => handleResizeEnd();
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        handleResizeMove(e);
      };
      const handleTouchEnd = () => handleResizeEnd();

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isResizing, resizeMode, tempTask]);

  const handleClick = (e: React.MouseEvent) => {
    if (!isResizing) {
      e.stopPropagation();
      dispatch({
        type: 'SET_MODAL',
        payload: {
          isOpen: true,
          task,
          mode: 'edit',
        },
      });
    }
  };

  // Use tempTask for display if resizing, otherwise use original task
  const displayTask = isResizing && tempTask ? tempTask : task;

  const getTaskWidth = () => {
    const daysDiff = Math.ceil((displayTask.endDate.getTime() - displayTask.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
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
      className={`task-bar ${displayTask.category} absolute top-0 left-0 right-0 z-10 ${isResizing ? `resizing resizing-${resizeMode}` : ''}`}
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
        {/* Left resize handle */}
        <div
          className="resize-handle left-0 w-4"
          onMouseDown={(e) => handleResizeStart(e, 'start')}
          onTouchStart={(e) => handleResizeStart(e, 'start')}
          title="Drag to extend or reduce start date"
        />
        
        {/* Task content */}
        <span className="flex-1 px-1 text-xs truncate z-10">
          {isFirstDay ? displayTask.name : ''}
        </span>
        
        {/* Right resize handle */}
        <div
          className="resize-handle right-0 w-4"
          onMouseDown={(e) => handleResizeStart(e, 'end')}
          onTouchStart={(e) => handleResizeStart(e, 'end')}
          title="Drag to extend or reduce end date"
        />
      </div>
    </div>
  );
}
