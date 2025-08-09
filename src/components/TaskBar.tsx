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
  const [currentMouseX, setCurrentMouseX] = useState(0);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
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
    setCurrentMouseX(clientX);
    setTempStartDate(new Date(task.startDate));
    setTempEndDate(new Date(task.endDate));
  };

  // Simple and direct resize move handler
  const handleResizeMove = (e: MouseEvent | TouchEvent) => {
    if (!isResizing || !resizeMode || !tempStartDate || !tempEndDate) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setCurrentMouseX(clientX);

    // Find the calendar day that the mouse is over
    const dayElements = document.querySelectorAll('.calendar-day');
    let targetDate: Date | null = null;

    for (const dayEl of dayElements) {
      const rect = dayEl.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right) {
        const dateStr = dayEl.getAttribute('data-date');
        if (dateStr) {
          targetDate = new Date(dateStr);
          break;
        }
      }
    }

    if (!targetDate) return;

    // Calculate new dates based on resize mode
    let newStartDate: Date;
    let newEndDate: Date;

    if (resizeMode === 'start') {
      // Dragging the start handle
      newStartDate = startOfDay(targetDate);
      newEndDate = new Date(task.endDate);

      // Ensure start is before end
      if (newStartDate >= newEndDate) {
        newStartDate = addDays(newEndDate, -1);
      }
    } else {
      // Dragging the end handle
      newStartDate = new Date(task.startDate);
      newEndDate = startOfDay(targetDate);

      // Ensure end is after start
      if (newEndDate <= newStartDate) {
        newEndDate = addDays(newStartDate, 1);
      }
    }

    // Update temp dates for immediate visual feedback
    setTempStartDate(newStartDate);
    setTempEndDate(newEndDate);
  };

  // Handle resize end
  const handleResizeEnd = () => {
    if (tempStartDate && tempEndDate) {
      // Update the actual task with final dates
      const updatedTask: Task = {
        ...task,
        startDate: tempStartDate,
        endDate: tempEndDate,
      };

      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    }

    setIsResizing(false);
    setResizeMode(null);
    setCurrentMouseX(0);
    setTempStartDate(null);
    setTempEndDate(null);
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
    // Only open modal if not resizing and not being dragged
    if (!isResizing && !transform) {
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

  // Task position and width calculation with temp dates support
  const getTaskMetrics = () => {
    if (!isFirstDay) {
      return { width: 0, left: 0 };
    }

    // Use temp dates during resize for immediate visual feedback
    const displayStartDate = tempStartDate || task.startDate;
    const displayEndDate = tempEndDate || task.endDate;

    const taskStartDate = startOfDay(displayStartDate);
    const taskEndDate = startOfDay(displayEndDate);
    const weekStart = startOfDay(weekStartDate);
    const weekEnd = startOfDay(addDays(weekStartDate, 6));

    // Find the visible portion of the task in this week
    const visibleStart = taskStartDate < weekStart ? weekStart : taskStartDate;
    const visibleEnd = taskEndDate > weekEnd ? weekEnd : taskEndDate;

    // Calculate day indices (0-6)
    const startDayIndex = Math.floor((visibleStart.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    const endDayIndex = Math.floor((visibleEnd.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));

    // Convert to percentages
    const left = (startDayIndex / 7) * 100;
    const width = ((endDayIndex - startDayIndex + 1) / 7) * 100;

    return {
      width: Math.max(width, 14.28), // Minimum one day
      left: Math.max(0, Math.min(left, 85.72))
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
        className={`task-bar ${task.category} absolute top-0 z-10 ${isResizing ? `resizing resizing-${resizeMode}` : ''} ${transform ? 'dragging' : ''}`}
        style={{
          ...style,
          width: `${taskWidth}%`,
          left: `${taskLeft}%`,
          marginTop: `${dayIndex * 28}px`, // Spacing between overlapping tasks
          cursor: isResizing ? 'ew-resize' : (transform ? 'grabbing' : 'grab'),
        }}
        title={`${task.name} (${(tempStartDate || task.startDate).toLocaleDateString()} - ${(tempEndDate || task.endDate).toLocaleDateString()})`}
        onClick={handleClick}
      >
        <div className="flex items-center h-full relative">
          {/* Left resize handle */}
          <div
            className={`resize-handle absolute left-0 top-0 w-4 h-full cursor-ew-resize flex items-center justify-center z-20 rounded-l transition-all duration-200 ${isResizing && resizeMode === 'start' ? 'bg-blue-400 shadow-lg' : 'hover:bg-black hover:bg-opacity-10'}`}
            onMouseDown={(e) => handleResizeStart(e, 'start')}
            onTouchStart={(e) => handleResizeStart(e, 'start')}
            title="← Drag to adjust start date"
          >
            <div className={`w-1 h-4 bg-white rounded shadow-sm transition-all duration-200 ${isResizing && resizeMode === 'start' ? 'bg-opacity-100 w-1.5 h-5' : 'bg-opacity-90'}`}></div>
          </div>

          {/* Task content - clickable area for drag & drop move */}
          <div className="flex-1 mx-4 text-xs font-medium text-black flex items-center justify-center cursor-grab active:cursor-grabbing">
            <span className="truncate text-center w-full pointer-events-none">
              {task.name}
            </span>
          </div>

          {/* Right resize handle */}
          <div
            className={`resize-handle absolute right-0 top-0 w-4 h-full cursor-ew-resize flex items-center justify-center z-20 rounded-r transition-all duration-200 ${isResizing && resizeMode === 'end' ? 'bg-green-400 shadow-lg' : 'hover:bg-black hover:bg-opacity-10'}`}
            onMouseDown={(e) => handleResizeStart(e, 'end')}
            onTouchStart={(e) => handleResizeStart(e, 'end')}
            title="Drag to adjust end date →"
          >
            <div className={`w-1 h-4 bg-white rounded shadow-sm transition-all duration-200 ${isResizing && resizeMode === 'end' ? 'bg-opacity-100 w-1.5 h-5' : 'bg-opacity-90'}`}></div>
          </div>
        </div>
      </div>

      {/* Floating resize feedback tooltip */}
      {isResizing && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2"
          style={{
            left: `${currentMouseX}px`,
            top: `${50}px`,
          }}
        >
          <div className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg shadow-xl border border-blue-500">
            <div className="font-semibold text-center">
              📅 {task.name}
            </div>
            <div className="text-xs text-center mt-1 opacity-95">
              {formatDateForDisplay(tempStartDate || task.startDate)} → {formatDateForDisplay(tempEndDate || task.endDate)}
            </div>
            <div className="text-xs text-center mt-1 opacity-80">
              {resizeMode === 'start' ? '← Adjusting start' : 'Adjusting end →'}
            </div>
          </div>
        </div>
      )}

      {/* Floating drag move feedback tooltip */}
      {transform && !isResizing && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2"
          style={{
            left: `${window.innerWidth / 2}px`,
            top: `${50}px`,
          }}
        >
          <div className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg shadow-xl border border-green-500">
            <div className="font-semibold text-center">
              🚀 Moving {task.name}
            </div>
            <div className="text-xs text-center mt-1 opacity-95">
              Duration: {Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
            </div>
            <div className="text-xs text-center mt-1 opacity-80">
              Drop on any day to move
            </div>
          </div>
        </div>
      )}
    </>
  );
}
