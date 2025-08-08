import React, { useState, useEffect } from 'react';
import type { Task, TaskCategory } from '../types';
import { useCalendar } from '../context/CalendarContext';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Partial<Task>;
  mode: 'create' | 'edit';
}

const categories: { value: TaskCategory; label: string; color: string }[] = [
  { value: 'todo', label: 'To Do', color: 'bg-red-500' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'review', label: 'Review', color: 'bg-yellow-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
];

export function TaskModal({ isOpen, onClose, task, mode }: TaskModalProps) {
  const { dispatch } = useCalendar();
  const [formData, setFormData] = useState({
    name: '',
    category: 'todo' as TaskCategory,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        category: task.category || 'todo',
      });
    } else {
      setFormData({
        name: '',
        category: 'todo',
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    if (mode === 'create' && task?.startDate && task?.endDate) {
      const newTask: Task = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        category: formData.category,
        startDate: task.startDate,
        endDate: task.endDate,
        createdAt: new Date(),
      };
      
      dispatch({ type: 'ADD_TASK', payload: newTask });
    } else if (mode === 'edit' && task?.id) {
      const updatedTask: Task = {
        ...task as Task,
        name: formData.name.trim(),
        category: formData.category,
      };
      
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    }

    onClose();
  };

  const handleDelete = () => {
    if (task?.id) {
      dispatch({ type: 'DELETE_TASK', payload: task.id });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">
          {mode === 'create' ? 'Create New Task' : 'Edit Task'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-1">
              Task Name
            </label>
            <input
              type="text"
              id="taskName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task name"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={category.value}
                    checked={formData.category === category.value}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TaskCategory })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className={`w-4 h-4 rounded ${category.color}`}></div>
                  <span className="text-sm">{category.label}</span>
                </label>
              ))}
            </div>
          </div>

          {mode === 'create' && task?.startDate && task?.endDate && (
            <div className="text-sm text-gray-600">
              <p>Date Range: {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            {mode === 'edit' && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'create' ? 'Create' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
