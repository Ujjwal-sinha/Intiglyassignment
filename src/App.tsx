
import { CalendarProvider } from './context/CalendarContext';
import { CalendarGrid } from './components/CalendarGrid';
import { FilterPanel } from './components/FilterPanel';
import { TaskModal } from './components/TaskModal';
import { useCalendar } from './context/CalendarContext';
import { getMonthName } from './utils/dateUtils';

function CalendarApp() {
  const { state, dispatch } = useCalendar();
  const { modal, currentMonth } = state;

  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    dispatch({ type: 'SET_CURRENT_MONTH', payload: newMonth });
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    dispatch({ type: 'SET_CURRENT_MONTH', payload: newMonth });
  };

  const handleToday = () => {
    dispatch({ type: 'SET_CURRENT_MONTH', payload: new Date() });
  };

  const closeModal = () => {
    dispatch({ type: 'SET_MODAL', payload: { isOpen: false } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">📅</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Smart Calendar
                </h1>
                <p className="text-sm text-gray-500">Organize your tasks beautifully</p>
              </div>
            </div>
            
            {/* Month Navigation */}
            <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-white/30">
              <button
                onClick={handlePreviousMonth}
                className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                title="Previous Month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="px-6 py-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  {getMonthName(currentMonth)}
                </h2>
              </div>
              
              <button
                onClick={handleNextMonth}
                className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                title="Next Month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleToday}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
              >
                Today
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FilterPanel />
          </div>

          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <CalendarGrid />
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        task={modal.task || undefined}
        mode={modal.mode}
      />
    </div>
  );
}

function App() {
  return (
    <CalendarProvider>
      <CalendarApp />
    </CalendarProvider>
  );
}

export default App;
