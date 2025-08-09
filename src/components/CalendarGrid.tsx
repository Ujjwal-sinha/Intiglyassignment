import { useState } from 'react';
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

      // If single day selected, make it a 1-day task (same start and end is fine for single day)
      // If multiple days selected, keep the range as is

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

      // Update task dates - move the task to the new start date and maintain duration
      const updatedTask: Task = {
        ...task,
        startDate: startOfDay(newStartDate),
        endDate: startOfDay(addDays(newStartDate, duration)),
      };

      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    }
  };



  return (
    <DndContext
      onDragStart={handleDndDragStart}
      onDragOver={handleDndDragOver}
      onDragEnd={handleDndDragEnd}
    >
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 relative">
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

        {/* Drag Selection Info */}
        {dragSelection.isSelecting && dragSelection.startDate && dragSelection.endDate && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg z-50">
            <div className="text-sm font-medium">
              Creating Task: {dragSelection.startDate.toLocaleDateString()} - {dragSelection.endDate.toLocaleDateString()}
            </div>
            <div className="text-xs opacity-75">
              Release to open task creation modal
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}
