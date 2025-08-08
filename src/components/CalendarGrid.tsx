import { useState } from 'react';
import { DndContext, type DragEndEvent, type DragOverEvent, type DragStartEvent } from '@dnd-kit/core';
import { CalendarDay } from './CalendarDay';
import { useCalendar } from '../context/CalendarContext';
import { getCalendarDays, isCurrentMonth, isTodayDate } from '../utils/dateUtils';
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
      
      // Normalize date range
      if (startDate > endDate) {
        const temp = startDate;
        startDate = endDate;
        endDate = temp;
      }

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
      const newDate = over.data.current.date as Date;
      
      // Calculate the duration of the task
      const duration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Update task dates
      const updatedTask = {
        ...task,
        startDate: new Date(newDate),
        endDate: new Date(newDate.getTime() + duration * 24 * 60 * 60 * 1000),
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


      </div>
    </DndContext>
  );
}
