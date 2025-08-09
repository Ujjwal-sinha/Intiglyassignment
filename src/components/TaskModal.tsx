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
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        category: task.category || 'todo',
        startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
        endDate: task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        name: '',
        category: 'todo',
        startDate: '',
        endDate: '',
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    if (mode === 'create') {
      const startDate = formData.startDate ? new Date(formData.startDate) : (task?.startDate ? new Date(task.startDate) : new Date());
      const endDate = formData.endDate ? new Date(formData.endDate) : (task?.endDate ? new Date(task.endDate) : new Date());
      
      const newTask: Task = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        category: formData.category,
        startDate: startDate,
        endDate: endDate,
        createdAt: new Date(),
      };
      
      dispatch({ type: 'ADD_TASK', payload: newTask });
    } else if (mode === 'edit' && task?.id) {
      const updatedTask: Task = {
        ...task as Task,
        name: formData.name.trim(),
        category: formData.category,
        startDate: formData.startDate ? new Date(formData.startDate) : new Date(task.startDate || new Date()),
        endDate: formData.endDate ? new Date(formData.endDate) : new Date(task.endDate || new Date()),
      };
      
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    }

    onClose();
  };

  const handleDelete = () => {
    if (task?.id && task.name) {
      const confirmDelete = window.confirm(`Are you sure you want to delete the task "${task.name}"? This action cannot be undone.`);
      if (confirmDelete) {
        dispatch({ type: 'DELETE_TASK', payload: task.id });
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {mode === 'create' && task?.startDate && task?.endDate && (
            <div className="text-sm text-gray-600">
              <p>Date Range: {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="flex space-x-3">
              {mode === 'edit' && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  🗑️ Delete Task
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={!formData.name.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {mode === 'create' ? '✅ Create Task' : '💾 Update Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
