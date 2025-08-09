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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white/95 backdrop-blur-md border border-white/30 rounded-3xl p-8 w-full max-w-2xl shadow-2xl transform transition-all duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center">
            {mode === 'create' ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {mode === 'create' ? 'Create New Task' : 'Edit Task'}
            </h2>
            <p className="text-sm text-gray-500">
              {mode === 'create' ? 'Add a new task to your calendar' : 'Modify your existing task'}
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="taskName" className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Task Name
            </label>
            <input
              type="text"
              id="taskName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-200 backdrop-blur-sm text-gray-900 placeholder-gray-500"
              placeholder="Enter a descriptive task name..."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              🏷️ Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <label key={category.value} className="flex items-center space-x-3 p-4 bg-white/40 hover:bg-white/60 rounded-2xl cursor-pointer transition-all duration-200 border border-white/30 group">
                  <input
                    type="radio"
                    name="category"
                    value={category.value}
                    checked={formData.category === category.value}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TaskCategory })}
                    className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <div className={`w-5 h-5 rounded-full ${category.color} group-hover:scale-110 transition-transform duration-200 shadow-sm`}></div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{category.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-2">
                📅 Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-200 backdrop-blur-sm text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">
                🏁 End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-200 backdrop-blur-sm text-gray-900"
              />
            </div>
          </div>

          {mode === 'create' && task?.startDate && task?.endDate && (
            <div className="text-sm text-gray-600">
              <p>Date Range: {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-8 border-t border-white/30">
            <div className="flex space-x-3">
              {mode === 'edit' && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-200 shadow-lg font-semibold"
                >
                  🗑️ Delete Task
                </button>
              )}
            </div>
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 border border-white/40 bg-white/30 rounded-2xl hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition-all duration-200 font-semibold"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={!formData.name.trim()}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 shadow-lg font-semibold"
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
