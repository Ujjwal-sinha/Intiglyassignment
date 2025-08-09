import { useState } from 'react';
import { flushSync } from 'react-dom';
import { DndContext, type DragEndEvent, type DragOverEvent, type DragStartEvent } from '@dnd-kit/core';
import { CalendarDay } from './CalendarDay';
import { useCalendar } from '../context/CalendarContext';
import { getCalendarDays, isCurrentMonth, isTodayDate } from '../utils/dateUtils';
import { differenceInDays, addDays, startOfDay } from 'date-fns';
import type { Task } from '../types';

export function CalendarGrid() {
  const { state, dispatch } = useCalendar();
  const { currentMonth, dragSelection } = state;
  const [isDragging, setIsDragging] = useState(false);

  const calendarDays = getCalendarDays(currentMonth);

  const handleDragStart = (date: Date) => {
    setIsDragging(true);
    dispatch({
      type: 'SET_DRAG_SELECTION',
      payload: {
        startDate: date,
        endDate: date,
        isSelecting: true,
      },
    });
  };

  const handleDragOver = (date: Date) => {
    if (isDragging && dragSelection.startDate) {
      dispatch({
        type: 'SET_DRAG_SELECTION',
        payload: {
          endDate: date,
        },
      });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);

    if (dragSelection.startDate && dragSelection.endDate) {
      let startDate = new Date(dragSelection.startDate);
      let endDate = new Date(dragSelection.endDate);

      // Normalize date range - ensure start is before or equal to end
      if (startDate.getTime() > endDate.getTime()) {
        const temp = startDate;
        startDate = endDate;
        endDate = temp;
      }

      // Ensure dates are at start of day for consistency
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

      // Open modal for task creation
      dispatch({
        type: 'SET_MODAL',
        payload: {
          isOpen: true,
          task: { startDate, endDate },
          mode: 'create',
        },
      });
    }

    dispatch({
      type: 'SET_DRAG_SELECTION',
      payload: {
        startDate: null,
        endDate: null,
        isSelecting: false,
      },
    });
  };

  const handleDndDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'task') {
      // Handle task dragging
    }
  };

  const handleDndDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (active.data.current?.type === 'task' && over?.data.current?.type === 'day') {
      // Handle task dropping
    }
  };

  const handleDndDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.data.current?.type === 'task' && over?.data.current?.type === 'day') {
      const task = active.data.current.task as Task;
      const newStartDate = over.data.current.date as Date;

      // Calculate the duration of the task in days
      const duration = differenceInDays(task.endDate, task.startDate);

      // Update task by ID - keep all existing properties, only change dates
      const updatedTask: Task = {
        ...task, // Preserve all existing properties (id, name, category, createdAt, etc.)
        startDate: startOfDay(newStartDate),
        endDate: startOfDay(addDays(newStartDate, duration)),
      };

      // Use flushSync to ensure proper batching and prevent duplicate rendering during drag
      flushSync(() => {
        // This should update the existing task by matching task.id, not create a duplicate
        dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      });
    }
  };



  return (
    <DndContext
      onDragStart={handleDndDragStart}
      onDragOver={handleDndDragOver}
      onDragEnd={handleDndDragEnd}
    >
      <div className="bg-white/90 backdrop-blur-sm border border-white/40 rounded-3xl overflow-hidden shadow-2xl">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-white/50">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
            <div key={day} className="p-4 text-center">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {day.slice(0, 3)}
              </div>
              <div className="text-sm font-semibold text-gray-700 mt-1">
                {day.slice(0, 3)}
              </div>
              {(index === 0 || index === 6) && (
                <div className="w-1 h-1 bg-blue-400 rounded-full mx-auto mt-1"></div>
              )}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 relative bg-gradient-to-br from-white/50 to-slate-50/50">
          {calendarDays.map((date) => {
            const dayData = {
              date,
              isCurrentMonth: isCurrentMonth(date, currentMonth),
              isToday: isTodayDate(date),
              tasks: [],
            };

            return (
              <CalendarDay
                key={date.toISOString()}
                day={dayData}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              />
            );
          })}
        </div>

        {/* Enhanced Drag Selection Info */}
        {dragSelection.isSelecting && dragSelection.startDate && dragSelection.endDate && (
          <div className="absolute top-6 left-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-2xl shadow-2xl z-50 border border-white/20">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="text-sm font-semibold">
                Creating Task
              </div>
            </div>
            <div className="text-xs opacity-90 mt-1">
              {dragSelection.startDate.toLocaleDateString()} → {dragSelection.endDate.toLocaleDateString()}
            </div>
            <div className="text-xs opacity-75 mt-1">
              Release to open task editor
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}
