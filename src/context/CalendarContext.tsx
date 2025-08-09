import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Task, FilterState, TaskModalState, DragSelection } from '../types';

interface CalendarState {
  tasks: Task[];
  filters: FilterState;
  modal: TaskModalState;
  dragSelection: DragSelection;
  currentMonth: Date;
}

type CalendarAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
  | { type: 'SET_MODAL'; payload: Partial<TaskModalState> }
  | { type: 'SET_DRAG_SELECTION'; payload: Partial<DragSelection> }
  | { type: 'SET_CURRENT_MONTH'; payload: Date }
  | { type: 'LOAD_STATE'; payload: CalendarState };

const initialState: CalendarState = {
  tasks: [],
  filters: {
    categories: [],
    duration: null,
    searchQuery: '',
  },
  modal: {
    isOpen: false,
    task: null,
    mode: 'create',
  },
  dragSelection: {
    startDate: null,
    endDate: null,
    isSelecting: false,
  },
  currentMonth: new Date(),
};

function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    case 'UPDATE_TASK':
      // Ensure we're updating the correct task by ID and not creating duplicates
      const updatedTasks = state.tasks.map(existingTask => 
        existingTask.id === action.payload.id 
          ? { ...action.payload } // Replace the entire task object
          : existingTask // Keep other tasks unchanged
      );
      
      return {
        ...state,
        tasks: updatedTasks,
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case 'SET_MODAL':
      return {
        ...state,
        modal: { ...state.modal, ...action.payload },
      };
    case 'SET_DRAG_SELECTION':
      return {
        ...state,
        dragSelection: { ...state.dragSelection, ...action.payload },
      };
    case 'SET_CURRENT_MONTH':
      return {
        ...state,
        currentMonth: action.payload,
      };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

interface CalendarContextType {
  state: CalendarState;
  dispatch: React.Dispatch<CalendarAction>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(calendarReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('calendar-state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Convert date strings back to Date objects
        const restoredState = {
          ...parsedState,
          tasks: parsedState.tasks.map((task: any) => ({
            ...task,
            startDate: new Date(task.startDate),
            endDate: new Date(task.endDate),
            createdAt: new Date(task.createdAt),
          })),
          currentMonth: new Date(parsedState.currentMonth),
        };
        dispatch({ type: 'LOAD_STATE', payload: restoredState });
      } catch (error) {
        console.error('Failed to load state from localStorage:', error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes (but avoid saving during rapid updates)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('calendar-state', JSON.stringify(state));
    }, 100); // Debounce to prevent excessive saves during resize

    return () => clearTimeout(timeoutId);
  }, [state]);

  return (
    <CalendarContext.Provider value={{ state, dispatch }}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}
