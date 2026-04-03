🧙‍♂️ Kanban Wizard (or Theo-Kanban)
A purely client-side React Kanban board built to explore complex state management and drag-and-drop interfaces.

[Live Demo on Netlify] (Insert your link here)

💡 Why I Built This
I wanted a project that went beyond the standard "To-Do list" to genuinely challenge my understanding of React. My main goals were to figure out how to cleanly separate UI logic from data logic, handle deeply nested state updates, and implement a smooth drag-and-drop experience that works on both desktop and mobile.

✨ Features
Smooth Drag & Drop: Move tasks between columns or reorder entire boards (powered by @dnd-kit).

Local First: No database needed. Everything is saved instantly to your browser's localStorage.

Data Portability: Built-in JSON export/import using the File System Access API so users can backup their boards locally.

Multiple Views: Toggle between the classic Kanban board and a Calendar view.

Filtering & Theming: Filter tasks by priority, tags, or assignees, and toggle between Light/Dark/Wizard themes.

🛠️ Under the Hood
To keep App.jsx from becoming a massive, unreadable file, I focused heavily on custom hooks to isolate my logic:

useBoards.js: Handles all the heavy lifting for creating, editing, deleting, and moving tasks/columns.

useUIState.js: Manages the state for modals, sidebars, and currently dragged items.

useFilters.js: Isolates the logic for searching and sorting tasks.

🧠 Biggest Lessons Learned
Drag and Drop is Tricky: Getting @dnd-kit to feel completely natural required tweaking custom collision detection algorithms and setting up specific touch-sensor delays so mobile users could scroll without accidentally picking up tasks.

State Immutability: Updating a specific task deeply nested inside a column array taught me a lot about spreading state correctly without mutating the original data.

CSS Animations vs. React State: I had to implement a "delay" system using setTimeout to allow CSS delete/rename animations to finish before actually removing the items from the React state.

💻 Run it Locally
If you want to poke around the code:

Clone the repo:

Bash
git clone https://github.com/Sordot/Theo-Kanban.git
Install dependencies:

Bash
npm install
Start the Vite development server:

Bash
npm run dev
