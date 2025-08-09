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
  weekStartDate: Date;
}

export function TaskBar({ task, isFirstDay, dayIndex, weekStartDate }: TaskBarProps) {
  const { dispatch } = useCalendar();
  const [isResizing, setIsResizing] = useState(false);
  const [resizeMode, setResizeMode] = useState<'start' | 'end' | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [currentMouseX, setCurrentMouseX] = useState(0);
  const [originalTask, setOriginalTask] = useState<Task | null>(null);
  const [tempDates, setTempDates] = useState<{ startDate: Date; endDate: Date } | null>(null);
  const taskRef = useRef<HTMLDivElement>(null);

  // Format date for display
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Drag and drop for moving tasks (disabled during resize)
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `task-${task.id}`,
    data: {
      task,
      type: 'task',
    },
    disabled: isResizing,
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
    setDragStartX(clientX);
    setCurrentMouseX(clientX);
    setOriginalTask({ ...task });

    // Initialize temp dates with current task dates
    setTempDates({
      startDate: new Date(task.startDate),
      endDate: new Date(task.endDate)
    });
  };

  // Handle resize move
  const handleResizeMove = (e: MouseEvent | TouchEvent) => {
    if (!isResizing || !resizeMode || !originalTask || !taskRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - dragStartX;

    // Update current mouse position for tooltip positioning
    setCurrentMouseX(clientX);

    // Get the calendar grid container for width calculation
    const calendarGrid = taskRef.current.closest('.grid');
    if (!calendarGrid) return;

    const gridRect = calendarGrid.getBoundingClientRect();
    const dayWidth = gridRect.width / 7; // 7 days in a week
    const daysDelta = Math.round(deltaX / dayWidth);

    // Only update if there's a meaningful change
    if (daysDelta === 0) return;

    // Calculate new dates based on resize mode
    let newStartDate: Date;
    let newEndDate: Date;

    if (resizeMode === 'start') {
      // When resizing start, move the start date
      newStartDate = addDays(originalTask.startDate, daysDelta);
      newEndDate = new Date(originalTask.endDate);

      // Ensure start date doesn't go past end date (minimum 1 day task)
      if (newStartDate >= newEndDate) {
        newStartDate = addDays(newEndDate, -1);
      }
    } else {
      // When resizing end, move the end date
      newStartDate = new Date(originalTask.startDate);
      newEndDate = addDays(originalTask.endDate, daysDelta);

      // Ensure end date doesn't go before start date (minimum 1 day task)
      if (newEndDate <= newStartDate) {
        newEndDate = addDays(newStartDate, 1);
      }
    }

    // Update temporary dates for smooth visual feedback
    const newTempDates = {
      startDate: startOfDay(newStartDate),
      endDate: startOfDay(newEndDate),
    };
    
    setTempDates(newTempDates);

    // Also update the actual task immediately for live visual feedback
    const updatedTask: Task = {
      ...originalTask,
      startDate: newTempDates.startDate,
      endDate: newTempDates.endDate,
    };

    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
  };

  // Handle resize end
  const handleResizeEnd = () => {
    // Reset all resize state (task is already updated during move)
    setIsResizing(false);
    setResizeMode(null);
    setDragStartX(0);
    setCurrentMouseX(0);
    setOriginalTask(null);
    setTempDates(null);
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
  }, [isResizing]);

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

  // Calculate task position and width
  const getTaskMetrics = () => {
    if (!isFirstDay) {
      return { width: 0, left: 0 };
    }

    // Use temporary dates during resizing for smooth visual feedback
    const displayDates = tempDates || { startDate: task.startDate, endDate: task.endDate };

    const taskStartDate = startOfDay(displayDates.startDate);
    const taskEndDate = startOfDay(displayDates.endDate);

    // Calculate the start and end positions within this week
    const weekStart = startOfDay(weekStartDate);
    const weekEnd = startOfDay(addDays(weekStartDate, 6));

    // Clamp task dates to this week's boundaries
    const visibleStart = taskStartDate < weekStart ? weekStart : taskStartDate;
    const visibleEnd = taskEndDate > weekEnd ? weekEnd : taskEndDate;

    // Calculate day indices within the week (0-6)
    const startDayIndex = Math.floor((visibleStart.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    const endDayIndex = Math.floor((visibleEnd.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate position and width as percentages
    const left = (startDayIndex / 7) * 100;
    const width = ((endDayIndex - startDayIndex + 1) / 7) * 100;



    return {
      width: Math.max(width, 14.28), // Minimum one day width (100/7 ≈ 14.28%)
      left: Math.max(0, Math.min(left, 85.72)) // Ensure left position doesn't exceed week bounds
    };
  };

  // Only apply drag listeners when not resizing
  const dragProps = isResizing ? {} : { ...attributes, ...listeners };

  // Get task metrics using D3 scale
  const { width: taskWidth, left: taskLeft } = getTaskMetrics();

  // Don't render if not first day (task bar is only shown on first day and spans)
  if (taskWidth === 0) {
    return null;
  }

  return (
    <>
      <div
        ref={(node) => {
          setNodeRef(node);
          if (node) taskRef.current = node;
        }}
        {...dragProps}
        className={`task-bar ${task.category} absolute top-0 z-10 ${isResizing ? `resizing resizing-${resizeMode}` : ''}`}
        style={{
          ...style,
          width: `${taskWidth}%`,
          left: `${taskLeft}%`,
          marginTop: `${dayIndex * 28}px`, // Spacing between overlapping tasks
          cursor: isResizing ? 'ew-resize' : 'grab',
        }}
        title={`${task.name} (${(tempDates?.startDate || task.startDate).toLocaleDateString()} - ${(tempDates?.endDate || task.endDate).toLocaleDateString()})`}
        onClick={handleClick}
      >
        <div className="flex items-center h-full relative">
          {/* Left resize handle */}
          <div
            className={`resize-handle absolute left-0 top-0 w-4 h-full cursor-ew-resize flex items-center justify-center z-20 ${isResizing && resizeMode === 'start' ? 'bg-blue-500 bg-opacity-50' : ''}`}
            onMouseDown={(e) => handleResizeStart(e, 'start')}
            onTouchStart={(e) => handleResizeStart(e, 'start')}
            title="Drag to extend or reduce start date"
          >
            <div className="w-1 h-4 bg-black bg-opacity-60 rounded"></div>
          </div>

          {/* Task content */}
          <div className="flex-1 mx-4 text-xs font-medium text-black pointer-events-none flex items-center justify-center relative">
            <span className="truncate text-center w-full">
              {task.name}
            </span>
          </div>

          {/* Right resize handle */}
          <div
            className={`resize-handle absolute right-0 top-0 w-4 h-full cursor-ew-resize flex items-center justify-center z-20 ${isResizing && resizeMode === 'end' ? 'bg-green-500 bg-opacity-50' : ''}`}
            onMouseDown={(e) => handleResizeStart(e, 'end')}
            onTouchStart={(e) => handleResizeStart(e, 'end')}
            title="Drag to extend or reduce end date"
          >
            <div className="w-1 h-4 bg-black bg-opacity-60 rounded"></div>
          </div>
        </div>
      </div>

      {/* Floating drag feedback tooltip */}
      {isResizing && tempDates && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2"
          style={{
            left: `${currentMouseX}px`,
            top: `${50}px`,
          }}
        >
          <div className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg shadow-xl border border-blue-500 animate-pulse">
            <div className="font-semibold text-center">
              📅 {task.name}
            </div>
            <div className="text-xs text-center mt-1 opacity-95">
              {formatDateForDisplay(tempDates.startDate)} → {formatDateForDisplay(tempDates.endDate)}
            </div>
            <div className="text-xs text-center mt-1 opacity-80">
              {resizeMode === 'start' ? '← Adjusting start' : 'Adjusting end →'}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
