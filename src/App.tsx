
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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Calendar App</h1>
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
            <button
              onClick={handlePreviousMonth}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              ← Previous
            </button>
            
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {getMonthName(currentMonth)}
              </h2>
              <button
                onClick={handleToday}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Today
              </button>
            </div>
            
            <button
              onClick={handleNextMonth}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              Next →
            </button>
          </div>
        </div>

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
