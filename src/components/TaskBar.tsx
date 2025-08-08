import React, { useState, useRef, useEffect } from 'react';
import type { Task } from '../types';
import { useCalendar } from '../context/CalendarContext';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { addDays, startOfDay } from 'date-fns';

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
    disabled: isResizing, // Disable drag when resizing
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

  // Handle resize move - Simplified and robust
  const handleResizeMove = (e: MouseEvent | TouchEvent) => {
    if (!isResizing || !resizeMode || !startDateRef.current || !taskRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    
    // Get the calendar grid container
    const calendarGrid = taskRef.current.closest('.grid');
    if (!calendarGrid) return;

    const gridRect = calendarGrid.getBoundingClientRect();
    const dayWidth = gridRect.width / 7; // 7 days in a week
    
    const deltaX = clientX - startXRef.current;
    const daysDelta = Math.round(deltaX / dayWidth);

    // Create updated task based on original task
    const updatedTask = { ...task };
    
    if (resizeMode === 'start') {
      // Resizing start date
      const newStartDate = startOfDay(addDays(startDateRef.current, daysDelta));
      const currentEndDate = startOfDay(updatedTask.endDate);
      
      // Ensure start date is before end date
      if (newStartDate < currentEndDate) {
        updatedTask.startDate = newStartDate;
      } else {
        // Minimum 1-day duration
        updatedTask.startDate = addDays(currentEndDate, -1);
      }
    } else {
      // Resizing end date
      const newEndDate = startOfDay(addDays(startDateRef.current, daysDelta));
      const currentStartDate = startOfDay(updatedTask.startDate);
      
      // Ensure end date is after start date
      if (newEndDate > currentStartDate) {
        updatedTask.endDate = newEndDate;
      } else {
        // Minimum 1-day duration
        updatedTask.endDate = addDays(currentStartDate, 1);
      }
    }
    
    // Always update for live preview
    setTempTask(updatedTask);
    
    // Debug logging
    console.log('Resizing task:', task.name, 'Original:', task.startDate, '->', task.endDate);
    console.log('Mode:', resizeMode, 'Delta:', daysDelta);
    console.log('Updated:', updatedTask.startDate, '->', updatedTask.endDate);
  };

  // Handle resize end
  const handleResizeEnd = () => {
    if (isResizing && tempTask) {
      // Only commit if the task actually changed
      const startChanged = tempTask.startDate.getTime() !== task.startDate.getTime();
      const endChanged = tempTask.endDate.getTime() !== task.endDate.getTime();
      
      console.log('Resize end:', { startChanged, endChanged, tempTask });
      
      if (startChanged || endChanged) {
        console.log('Dispatching UPDATE_TASK with:', tempTask);
        dispatch({ type: 'UPDATE_TASK', payload: tempTask });
      } else {
        console.log('No changes detected, not updating');
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
        e.stopPropagation();
        handleResizeMove(e);
      };
      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleResizeEnd();
      };
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleResizeMove(e);
      };
      const handleTouchEnd = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleResizeEnd();
      };

      document.addEventListener('mousemove', handleMouseMove, { capture: true });
      document.addEventListener('mouseup', handleMouseUp, { capture: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
      document.addEventListener('touchend', handleTouchEnd, { capture: true });

      return () => {
        document.removeEventListener('mousemove', handleMouseMove, { capture: true });
        document.removeEventListener('mouseup', handleMouseUp, { capture: true });
        document.removeEventListener('touchmove', handleTouchMove, { capture: true });
        document.removeEventListener('touchend', handleTouchEnd, { capture: true });
      };
    }
  }, [isResizing, resizeMode]);

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
    if (!isFirstDay) {
      // If this is not the first day, don't show the task bar here
      // The task bar should only be rendered on the first day and span across
      return 0;
    }
    
    // Calculate how many days the task spans
    const taskStartDate = startOfDay(displayTask.startDate);
    const taskEndDate = startOfDay(displayTask.endDate);
    const daysDiff = Math.ceil((taskEndDate.getTime() - taskStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Return width as percentage (each day is ~14.28% of the week)
    return Math.min(daysDiff * 14.28, 100);
  };

  const getTaskPosition = () => {
    return 0; // Always start at the left edge of the first day
  };

  // Only apply drag listeners when not resizing
  const dragProps = isResizing ? {} : { ...attributes, ...listeners };

  // Don't render if not first day (task bar is only shown on first day and spans)
  const taskWidth = getTaskWidth();
  if (taskWidth === 0) {
    return null;
  }

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (node) taskRef.current = node;
      }}
      {...dragProps}
      className={`task-bar ${displayTask.category} absolute top-0 z-10 ${isResizing ? `resizing resizing-${resizeMode}` : ''}`}
      style={{
        ...style,
        width: `${taskWidth}%`,
        left: `${getTaskPosition()}%`,
        marginTop: `${dayIndex * 24}px`,
        cursor: isResizing ? 'ew-resize' : 'grab',
      }}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between h-full relative">
        {/* Left resize handle */}
        <div
          className="resize-handle left-0 w-6 flex items-center justify-center"
          onMouseDown={(e) => handleResizeStart(e, 'start')}
          onTouchStart={(e) => handleResizeStart(e, 'start')}
          title="Drag to extend or reduce start date"
        >
          <div className="w-1 h-4 bg-white bg-opacity-60 rounded"></div>
        </div>
        
                       {/* Task content */}
               <span className="flex-1 px-1 text-xs truncate z-10 pointer-events-none">
                 {displayTask.name}
               </span>
        
        {/* Right resize handle */}
        <div
          className="resize-handle right-0 w-6 flex items-center justify-center"
          onMouseDown={(e) => handleResizeStart(e, 'end')}
          onTouchStart={(e) => handleResizeStart(e, 'end')}
          title="Drag to extend or reduce end date"
        >
          <div className="w-1 h-4 bg-white bg-opacity-60 rounded"></div>
        </div>
      </div>
    </div>
  );
}
