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
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={clearAllFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Clear All
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Tasks
        </label>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by task name..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Categories */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categories
        </label>
        <div className="space-y-1">
          {categories.map((category) => (
            <label key={category.value} className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.categories.includes(category.value)}
                onChange={() => handleCategoryToggle(category.value)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className={`w-3 h-3 rounded ${category.color}`}></div>
              <span className="text-sm text-gray-700">{category.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Duration from Today
        </label>
        <div className="space-y-1">
          <label className="filter-checkbox">
            <input
              type="radio"
              name="duration"
              checked={filters.duration === null}
              onChange={() => handleDurationChange(null)}
              className="border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">All Tasks</span>
          </label>
          {durationOptions.map((option) => (
            <label key={option.value} className="filter-checkbox">
              <input
                type="radio"
                name="duration"
                checked={filters.duration === option.value}
                onChange={() => handleDurationChange(option.value)}
                className="border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
