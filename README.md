# 📅 Smart Calendar - Modern Task Management App

A beautiful, modern calendar application built with React, TypeScript, and Tailwind CSS. Features drag-and-drop task management, multi-day task spanning, glassmorphism UI design, and comprehensive task filtering.

## ✨ Features

### 🎯 Core Functionality
- **📅 Interactive Calendar**: Monthly view with beautiful glassmorphism design
- **🖱️ Drag & Drop**: Create tasks by dragging across calendar days
- **📝 Task Management**: Full CRUD operations (Create, Read, Update, Delete)
- **🔄 Task Resizing**: Adjust task duration by dragging edges
- **📱 Task Spanning**: Tasks visually span across multiple days
- **🔍 Advanced Filtering**: Filter by category, duration, and search query

### 🎨 Modern UI/UX
- **🌟 Glassmorphism Design**: Semi-transparent elements with backdrop blur
- **🎨 Gradient Backgrounds**: Beautiful color transitions throughout
- **✨ Smooth Animations**: 300ms cubic-bezier transitions
- **🖼️ Visual Feedback**: Hover effects and interactive states
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🎭 Category Colors**: Color-coded tasks (Red, Blue, Orange, Green)

### 🛠️ Technical Features
- **💾 Local Storage**: Automatic data persistence
- **🔄 State Management**: React Context with useReducer
- **📅 Date Handling**: Comprehensive date utilities with date-fns
- **🎯 Type Safety**: Full TypeScript implementation
- **🧹 Code Quality**: ESLint configuration with strict rules

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd intiglyassignment
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:5173
```

5. **Build for production**
```bash
npm run build
```

## 📦 Dependencies

### Core Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 19.1.1 | Frontend framework |
| `react-dom` | 19.1.1 | DOM rendering |
| `typescript` | 5.8.3 | Type safety |
| `tailwindcss` | 3.4.17 | Utility-first CSS |
| `date-fns` | 4.1.0 | Date manipulation |
| `@dnd-kit/core` | 6.3.1 | Drag and drop core |
| `@dnd-kit/sortable` | 10.0.0 | Sortable components |
| `@dnd-kit/utilities` | 3.2.2 | DnD utilities |

### Development Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | 6.3.5 | Build tool and dev server |
| `@vitejs/plugin-react` | 4.7.0 | React plugin for Vite |
| `eslint` | 9.32.0 | Code linting |
| `typescript-eslint` | 8.39.0 | TypeScript linting |
| `autoprefixer` | 10.4.21 | CSS vendor prefixes |
| `postcss` | 8.5.6 | CSS processing |

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── CalendarDay.tsx     # Individual calendar day
│   ├── CalendarGrid.tsx    # Main calendar grid
│   ├── TaskBar.tsx         # Task visualization
│   ├── TaskModal.tsx       # Task creation/editing
│   └── FilterPanel.tsx     # Filter controls
├── context/             # State management
│   └── CalendarContext.tsx # Global app state
├── types/               # TypeScript definitions
│   └── index.ts            # Type definitions
├── utils/               # Utility functions
│   ├── dateUtils.ts        # Date manipulation
│   └── taskUtils.ts        # Task operations
├── App.tsx              # Main app component
├── main.tsx             # App entry point
└── index.css            # Global styles
```

## 🎯 Usage Guide

### Creating Tasks
1. **Drag Selection**: Click and drag across calendar days to select date range
2. **Task Modal**: Release to open task creation modal
3. **Fill Details**: Enter task name, select category, adjust dates
4. **Save**: Click "Create Task" to add to calendar

### Managing Tasks
- **Edit**: Click on any task to open edit modal
- **Resize**: Drag task edges to adjust duration
- **Move**: Drag entire task to different dates
- **Delete**: Use delete button in edit modal (with confirmation)

### Filtering
- **Search**: Type in search box to find tasks by name
- **Categories**: Toggle category checkboxes to filter by type
- **Duration**: Filter tasks by time range from today

## 🎨 Design System

### Color Palette
```css
/* Task Categories */
Todo:        Red (#ef4444 to #dc2626)
In Progress: Blue (#3b82f6 to #2563eb)
Review:      Orange (#f59e0b to #d97706)
Completed:   Green (#22c55e to #16a34a)

/* UI Colors */
Background:  Gradient (slate-50 to indigo-100)
Glass:       White with 90% opacity + backdrop blur
Borders:     White with 30-40% opacity
Text:        Gray-900 to Gray-600 gradients
```

### Typography
- **Font Family**: System fonts (system-ui, -apple-system)
- **Font Weights**: 400 (normal), 600 (semibold), 800-900 (bold)
- **Text Shadows**: Used for contrast on colored backgrounds
- **Letter Spacing**: 0.5px on task names for readability

### Spacing System
- **Component Padding**: 6-8 units (24-32px)
- **Element Margins**: 4-6 units (16-24px)
- **Task Heights**: 60px with 70px spacing
- **Border Radius**: 12-24px for modern appearance

## 🛠️ Development Problems & Solutions

### 1. Task Spanning Across Multiple Days
**Problem**: Tasks were only showing on the first day of their date range.

**Solution**: 
- Modified `CalendarDay` component to render tasks on all covered days
- Updated `TaskBar` to show different segments (first, middle, last) with appropriate styling
- Added conditional rendering for resize handles (only on first/last days)

```typescript
// Before: Only first day
.filter(({ isFirstDay }) => isFirstDay)

// After: All relevant days
.filter(({ isFirstDay, isLastDay, isMiddleDay }) => 
  isFirstDay || isLastDay || isMiddleDay)
```

### 2. Task Text Visibility
**Problem**: Task text was not visible due to color contrast issues.

**Solutions Applied**:
- **Color Scheme**: Changed from light backgrounds to vibrant gradients
- **Text Color**: Switched to white text with dark shadows
- **Font Weight**: Increased to 800-900 for better visibility
- **Text Shadow**: Added multiple shadow layers for contrast

```css
/* Final solution */
color: #ffffff;
text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
font-weight: 800;
```

### 3. Date Handling in TaskModal
**Problem**: TypeScript errors with Date object handling in task creation/editing.

**Solution**:
```typescript
// Problem: task.startDate might be undefined
startDate: new Date(task.startDate)

// Solution: Provide fallback
startDate: new Date(task.startDate || new Date())
```

### 4. Task Positioning and Layout
**Problem**: Tasks overlapping and not properly aligned.

**Solutions**:
- **Z-Index Management**: Proper layering (task-bar: 20, hover: 30, dragging: 50)
- **Positioning**: Absolute positioning with calculated top values
- **Spacing**: Consistent 70px vertical spacing between tasks
- **Container Heights**: Increased calendar day heights to accommodate multiple tasks

### 5. Drag and Drop State Management
**Problem**: Complex state updates during drag operations causing re-renders.

**Solution**:
- Used `flushSync` for synchronous state updates
- Implemented proper cleanup in useEffect hooks
- Added debounced localStorage saves to prevent excessive writes

### 6. Filter Panel Color Inconsistency
**Problem**: Filter panel showed old colors while tasks used new colors.

**Solution**: Updated all color references across components:
```typescript
// Centralized color definitions
const categories = [
  { value: 'todo', label: 'To Do', color: 'bg-red-500' },
  // ... consistent across FilterPanel and TaskModal
];
```

### 7. Glassmorphism Implementation
**Problem**: Achieving consistent glass effect across all components.

**Solution**:
```css
/* Consistent glass pattern */
background: rgba(255, 255, 255, 0.9);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.3);
```

## 🔧 Configuration Files

### Tailwind Config
```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
```

### TypeScript Config
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  }
}
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ujjwal Sinha**
- GitHub: [@ujjwal-sinha](https://github.com/ujjwal-sinha)
- Email: ujjwalsinha418@gmail.com

