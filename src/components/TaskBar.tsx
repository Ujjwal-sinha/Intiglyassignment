import React, { useState, useRef, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import type { Task } from '../types';
import { useCalendar } from '../context/CalendarContext';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { addDays, startOfDay, differenceInDays } from 'date-fns';

interface TaskBarProps {
  task: Task;
  isFirstDay: boolean;
  dayIndex: number;
  weekStartDate: Date;
}

export function TaskBar({ task, isFirstDay, dayIndex, weekStartDate }: TaskBarProps) {
  const { dispatch } = useCalendar();

  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeMode, setResizeMode] = useState<'start' | 'end' | null>(null);
  const [resizeStartDate, setResizeStartDate] = useState<Date | null>(null);
  const [resizeEndDate, setResizeEndDate] = useState<Date | null>(null);
  const [mouseX, setMouseX] = useState(0);
  const [initialMouseX, setInitialMouseX] = useState(0);
  const [cellWidth, setCellWidth] = useState(0);

  const taskRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate cell width from calendar grid
  const calculateCellWidth = useCallback(() => {
    const calendarGrid = document.querySelector('.grid.grid-cols-7.relative');
    if (calendarGrid) {
      const gridWidth = calendarGrid.getBoundingClientRect().width;
      return gridWidth / 7;
    }
    return 100; // Fallback
  }, []);

  // Get current dates (resize dates during resize, actual dates otherwise)
  // This ensures we show the live resize state, not the original task dates
  const getCurrentDates = () => {
    if (isResizing && resizeStartDate && resizeEndDate) {
      return {
        startDate: resizeStartDate,
        endDate: resizeEndDate
      };
    }
    return {
      startDate: task.startDate,
      endDate: task.endDate
    };
  };

  // Calculate task position and width
  const getTaskMetrics = useCallback(() => {
    if (!isFirstDay) return { width: 0, left: 0, isVisible: false };

    const { startDate, endDate } = getCurrentDates();
    const weekStart = startOfDay(weekStartDate);
    const weekEnd = addDays(weekStart, 6);

    // Find visible portion in this week
    const visibleStart = startDate < weekStart ? weekStart : startDate;
    const visibleEnd = endDate > weekEnd ? weekEnd : endDate;

    if (visibleStart > visibleEnd) return { width: 0, left: 0, isVisible: false };

    // Calculate day indices (0-6)
    const startDayIndex = Math.floor((visibleStart.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    const endDayIndex = Math.floor((visibleEnd.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));

    // Convert to percentages
    const left = (startDayIndex / 7) * 100;
    const width = ((endDayIndex - startDayIndex + 1) / 7) * 100;

    return {
      width: Math.max(width, 14.28), // Minimum one day (100% / 7 days)
      left: Math.max(0, Math.min(left, 85.72)),
      isVisible: true
    };
  }, [isFirstDay, weekStartDate, task.startDate, task.endDate, resizeStartDate, resizeEndDate, isResizing]);

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

  // Handle resize start - professional implementation
  const handleResizeStart = (e: React.MouseEvent, edge: 'start' | 'end') => {
    e.stopPropagation();
    e.preventDefault();

    const clientX = e.clientX;
    const calculatedCellWidth = calculateCellWidth();

    setIsResizing(true);
    setResizeMode(edge);
    setInitialMouseX(clientX);
    setMouseX(clientX);
    setCellWidth(calculatedCellWidth);
    setResizeStartDate(new Date(task.startDate));
    setResizeEndDate(new Date(task.endDate));
  };

  // Professional resize handler with precise deltaX calculation
  const handleResizing = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeMode || cellWidth === 0) return;

    const currentX = e.clientX;
    setMouseX(currentX);

    // Calculate deltaX and convert to days
    const deltaX = currentX - initialMouseX;
    const daysDelta = Math.round(deltaX / cellWidth);

    // Use the original task dates as the base for calculations
    let newStartDate = new Date(task.startDate);
    let newEndDate = new Date(task.endDate);

    if (resizeMode === 'start') {
      // Left handle: adjust startDate only, keep endDate fixed
      newStartDate = addDays(task.startDate, daysDelta);

      // Validation: prevent startDate >= endDate (minimum 1 day)
      if (newStartDate >= task.endDate) {
        newStartDate = addDays(task.endDate, -1);
      }
    } else {
      // Right handle: adjust endDate only, keep startDate fixed
      newEndDate = addDays(task.endDate, daysDelta);

      // Validation: prevent endDate <= startDate (minimum 1 day)
      if (newEndDate <= task.startDate) {
        newEndDate = addDays(task.startDate, 1);
      }
    }

    // Only update if dates actually changed to prevent unnecessary re-renders
    const currentResizeStart = resizeStartDate?.getTime() || 0;
    const currentResizeEnd = resizeEndDate?.getTime() || 0;

    if (newStartDate.getTime() !== currentResizeStart || newEndDate.getTime() !== currentResizeEnd) {
      setResizeStartDate(newStartDate);
      setResizeEndDate(newEndDate);
    }
  }, [isResizing, resizeMode, cellWidth, initialMouseX, task.startDate, task.endDate, resizeStartDate, resizeEndDate]);

  // Handle resize end - persist changes with proper cleanup
  const handleResizeEnd = useCallback(() => {
    if (resizeStartDate && resizeEndDate) {
      // Create updated task with ONLY the changed dates, keeping all other properties
      const updatedTask: Task = {
        ...task, // Keep all existing properties (id, name, category, etc.)
        startDate: resizeStartDate,
        endDate: resizeEndDate,
      };

      // Use flushSync to ensure state updates are batched properly and prevent duplicate rendering
      flushSync(() => {
        // Update the task by ID - this should replace the existing task, not create a new one
        dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
        
        // Clean up resize state immediately to prevent ghost rendering
        setIsResizing(false);
        setResizeMode(null);
        setResizeStartDate(null);
        setResizeEndDate(null);
        setMouseX(0);
        setInitialMouseX(0);
        setCellWidth(0);
      });
    } else {
      // Clean up even if no valid dates
      setIsResizing(false);
      setResizeMode(null);
      setResizeStartDate(null);
      setResizeEndDate(null);
      setMouseX(0);
      setInitialMouseX(0);
      setCellWidth(0);
    }
  }, [resizeStartDate, resizeEndDate, task, dispatch]);

  // Event listeners for resize
  useEffect(() => {
    if (isResizing) {
      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        handleResizing(e);
      };

      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        handleResizeEnd();
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleResizing, handleResizeEnd]);

  const handleClick = (e: React.MouseEvent) => {
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

  // Only apply drag listeners when not resizing
  const dragProps = isResizing ? {} : { ...attributes, ...listeners };

  // Get task metrics
  const { width: taskWidth, left: taskLeft, isVisible } = getTaskMetrics();

  // During resize, ensure this task bar only renders where the resized dates indicate
  // This prevents the same task from appearing in multiple locations during resize
  if (!isVisible) return null;

  const { startDate, endDate } = getCurrentDates();
  const duration = differenceInDays(endDate, startDate) + 1;

  return (
    <>
      <div
        ref={(node) => {
          setNodeRef(node);
          if (node) taskRef.current = node;
          containerRef.current = node;
        }}
        {...dragProps}
        className={`
          task-bar ${task.category} rounded-md absolute
          ${isResizing ? 'resizing' : ''}
          ${transform ? 'dragging' : ''}
        `}
        style={{
          ...style,
          width: `${taskWidth}%`,
          left: `${taskLeft}%`,
          top: `${dayIndex * 70}px`,
          cursor: isResizing ? 'ew-resize' : (transform ? 'grabbing' : 'grab'),
          transition: isResizing ? 'none' : 'all 0.2s ease',
        }}
        onClick={handleClick}
      >
        {/* Left resize handle */}
        <div
          className={`
            absolute left-0 top-0 w-3 h-full cursor-ew-resize z-10
            bg-black bg-opacity-20 rounded-l-md
            hover:bg-opacity-40 transition-all duration-200
            ${isResizing && resizeMode === 'start' ? 'bg-blue-500 bg-opacity-60' : ''}
          `}
          onMouseDown={(e) => handleResizeStart(e, 'start')}
          title="Drag to adjust start date"
        />

        {/* Task content */}
        <div className="flex-1 px-2 py-3 flex items-center justify-center">
          <span style={{
            fontSize: '16px',
            fontWeight: '900',
            color: '#000000',
            textAlign: 'center',
            lineHeight: '1.2',
            textShadow: '2px 2px 4px rgba(255, 255, 255, 0.9), -1px -1px 2px rgba(255, 255, 255, 0.9)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontFamily: 'Arial, sans-serif',
            display: 'block',
            width: '100%',
            overflow: 'visible',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
          }}>
            {task.name}
          </span>
        </div>

        {/* Right resize handle */}
        <div
          className={`
            absolute right-0 top-0 w-3 h-full cursor-ew-resize z-10
            bg-black bg-opacity-20 rounded-r-md
            hover:bg-opacity-40 transition-all duration-200
            ${isResizing && resizeMode === 'end' ? 'bg-green-500 bg-opacity-60' : ''}
          `}
          onMouseDown={(e) => handleResizeStart(e, 'end')}
          title="Drag to adjust end date"
        />
      </div>

      {/* Live resize tooltip */}
      {isResizing && resizeStartDate && resizeEndDate && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${mouseX}px`,
            top: `${100}px`,
          }}
        >
          <div className={`
            text-gray-800 text-sm px-3 py-2 rounded-lg shadow-xl border-2 bg-white
            ${resizeMode === 'start' ? 'border-blue-400' : 'border-green-400'}
          `}>
            <div className="font-semibold text-center text-gray-900">
              {task.name}
            </div>
            <div className="text-xs text-center mt-1 text-gray-700">
              {resizeStartDate.toLocaleDateString()} → {resizeEndDate.toLocaleDateString()}
            </div>
            <div className="text-xs text-center text-gray-600">
              {duration} day{duration !== 1 ? 's' : ''}
            </div>
          </div>
          <div className={`
            absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
            border-l-4 border-r-4 border-transparent
            border-t-4 border-t-white
          `} />
        </div>
      )}

      {/* Drag move tooltip */}
      {transform && !isResizing && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2"
          style={{
            left: `${window.innerWidth / 2}px`,
            top: `${100}px`,
          }}
        >
          <div className="bg-white text-gray-800 text-sm px-3 py-2 rounded-lg shadow-xl border border-purple-400">
            <div className="font-semibold text-center text-gray-900">
              Moving {task.name}
            </div>
            <div className="text-xs text-center text-gray-600">
              {duration} day{duration !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
