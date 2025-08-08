# Calendar Task Management App

A modern, interactive calendar application built with React, TypeScript, and TailwindCSS that allows users to create, edit, and manage tasks with drag-and-drop functionality.

## Features

### 🗓️ Calendar View
- **Month View**: Clean 7-column × 5-6 row grid layout
- **Month Navigation**: Navigate between months with Previous/Next buttons
- **Today Highlight**: Current date is highlighted in blue
- **Cross-month Tasks**: Tasks spanning multiple months are displayed correctly

### ✨ Task Management
- **Drag to Create**: Click and drag across consecutive days to create new tasks
- **Task Categories**: 4 categories with color coding:
  - 🔴 To Do (Red)
  - 🔵 In Progress (Blue)
  - 🟡 Review (Yellow)
  - 🟢 Completed (Green)
- **Task Editing**: Click on any task to edit name and category
- **Task Deletion**: Delete tasks from the edit modal

### 🎯 Drag & Drop Features
- **Drag to Move**: Drag tasks to different dates while preserving duration
- **Resize Tasks**: Drag left/right edges to change start/end dates
- **Live Feedback**: Visual feedback during drag operations

### 🔍 Filtering & Search
- **Category Filter**: Multi-select checkboxes for task categories
- **Duration Filter**: Filter tasks by 1, 2, or 3 weeks from today
- **Search**: Live search by task name
- **Cumulative Filters**: All filters work together and update instantly

### 💾 Data Persistence
- **Local Storage**: All tasks and settings are automatically saved
- **State Management**: React Context API for efficient state management

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Drag & Drop**: @dnd-kit/core
- **Date Handling**: date-fns
- **State Management**: React Context API

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd intiglyassignment
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Usage Guide

### Creating Tasks
1. **Drag to Create**: Click and drag across multiple days in the calendar
2. **Modal Opens**: Release to open the task creation modal
3. **Fill Details**: Enter task name and select category
4. **Save**: Click "Create" to save the task

### Editing Tasks
1. **Click Task**: Click on any task bar to open the edit modal
2. **Modify**: Change task name or category
3. **Save/Delete**: Save changes or delete the task

### Moving Tasks
1. **Drag Task**: Click and drag a task to a new date
2. **Drop**: Release to move the task (duration is preserved)

### Resizing Tasks
1. **Drag Edges**: Drag the left or right edge of a task
2. **Resize**: The task will resize and update its date range

### Filtering Tasks
1. **Category Filter**: Check/uncheck categories in the sidebar
2. **Duration Filter**: Select duration range (1-3 weeks from today)
3. **Search**: Type in the search box to filter by task name
4. **Clear All**: Click "Clear All" to reset all filters

## Project Structure

```
src/
├── components/          # React components
│   ├── CalendarDay.tsx  # Individual day cell
│   ├── CalendarGrid.tsx # Main calendar grid
│   ├── FilterPanel.tsx  # Filter sidebar
│   ├── TaskBar.tsx      # Individual task bar
│   └── TaskModal.tsx    # Task creation/edit modal
├── context/             # React Context
│   └── CalendarContext.tsx # State management
├── types/               # TypeScript types
│   └── index.ts         # Type definitions
├── utils/               # Utility functions
│   ├── dateUtils.ts     # Date handling utilities
│   └── taskUtils.ts     # Task filtering utilities
├── App.tsx              # Main app component
└── main.tsx             # App entry point
```

## Key Features Implementation

### Drag-to-Create
- Uses mouse events to track drag selection
- Visual feedback with blue overlay during selection
- Opens modal with pre-filled date range

### Task Positioning
- Tasks are positioned absolutely within day cells
- Stacked display for overlapping tasks
- Proper width calculation based on duration

### State Management
- Context API for global state
- Reducer pattern for complex state updates
- LocalStorage persistence

### Responsive Design
- Mobile-friendly layout
- Touch support for drag operations
- Responsive grid system

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
