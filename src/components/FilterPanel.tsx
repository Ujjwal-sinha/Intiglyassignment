import type { TaskCategory } from '../types';
import { useCalendar } from '../context/CalendarContext';

const categories: { value: TaskCategory; label: string; color: string }[] = [
  { value: 'todo', label: 'To Do', color: 'bg-red-500' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'review', label: 'Review', color: 'bg-yellow-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
];

const durationOptions = [
  { value: 1, label: '1 Week' },
  { value: 2, label: '2 Weeks' },
  { value: 3, label: '3 Weeks' },
];

export function FilterPanel() {
  const { state, dispatch } = useCalendar();
  const { filters } = state;

  const handleCategoryToggle = (category: TaskCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    dispatch({ type: 'SET_FILTERS', payload: { categories: newCategories } });
  };

  const handleDurationChange = (duration: number | null) => {
    dispatch({ type: 'SET_FILTERS', payload: { duration } });
  };

  const handleSearchChange = (searchQuery: string) => {
    dispatch({ type: 'SET_FILTERS', payload: { searchQuery } });
  };

  const clearAllFilters = () => {
    dispatch({ type: 'SET_FILTERS', payload: { categories: [], duration: null, searchQuery: '' } });
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-white/40 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Filters
          </h3>
        </div>
        <button
          onClick={clearAllFilters}
          className="text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-xl transition-all duration-200"
        >
          Clear All
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          🔍 Search Tasks
        </label>
        <div className="relative">
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Type to search tasks..."
            className="w-full px-4 py-3 bg-white/60 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-200 backdrop-blur-sm"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          🏷️ Categories
        </label>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category.value} className="flex items-center space-x-3 p-3 hover:bg-white/40 rounded-2xl cursor-pointer transition-all duration-200 group">
              <input
                type="checkbox"
                checked={filters.categories.includes(category.value)}
                onChange={() => handleCategoryToggle(category.value)}
                className="rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <div className={`w-4 h-4 rounded-full ${category.color} group-hover:scale-110 transition-transform duration-200 shadow-sm`}></div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">{category.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          ⏰ Duration from Today
        </label>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 p-3 hover:bg-white/40 rounded-2xl cursor-pointer transition-all duration-200 group">
            <input
              type="radio"
              name="duration"
              checked={filters.duration === null}
              onChange={() => handleDurationChange(null)}
              className="border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">All Tasks</span>
          </label>
          {durationOptions.map((option) => (
            <label key={option.value} className="flex items-center space-x-3 p-3 hover:bg-white/40 rounded-2xl cursor-pointer transition-all duration-200 group">
              <input
                type="radio"
                name="duration"
                checked={filters.duration === option.value}
                onChange={() => handleDurationChange(option.value)}
                className="border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
