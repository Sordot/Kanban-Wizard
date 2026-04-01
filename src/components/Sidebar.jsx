import { useState } from 'react';
import logoIcon from '../assets/Kanban-Wizard-removebg-preview.png'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableBoardItem from './SortableBoardItem';

export default function Sidebar({
  isOpen,
  closeSidebar, 
  boards, 
  activeBoardID, 
  onSelectBoard, 
  onAddBoard, 
  onDeleteBoard, 
  onRenameBoard, 
  onExportBoard, 
  theme, 
  toggleTheme, 
  handleBoardDragEnd }) {

  //track if someone is dragging a board link
  const [isDraggingActive, setIsDraggingActive] = useState(false);

  //configure sensors for minimum of 5px movement before "drag" fires
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <img src={logoIcon} alt="Theo Kanban" className="logo-icon" />
        <span>Kanban Wizard</span>
      </div>
      <nav className="board-list">
        <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter}
            onDragStart={() => setIsDraggingActive(true)} //Set to true when board link is picked up
            onDragEnd={(event) => {
                handleBoardDragEnd(event);
                setIsDraggingActive(false); // Set to false when dragging ends
            }}
            onDragCancel={() => setIsDraggingActive(false)}
        >
          <div className={`board-items-container ${isDraggingActive ? 'is-drag-active' : ''}`}>
            <SortableContext items={boards.map(b => b.id)} strategy={verticalListSortingStrategy}>
              {boards.map(board => (
                <SortableBoardItem 
                    key={board.id} 
                    board={board} 
                    activeBoardID={activeBoardID}
                    onSelectBoard={onSelectBoard}
                    onRenameBoard={onRenameBoard}
                    onDeleteBoard={onDeleteBoard}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
        
        <button className="add-board-sidebar" onClick={onAddBoard}>+ New Board</button>
      </nav>
      <div className="sidebar-footer">
        <button className="export-btn" onClick={onExportBoard} title="Export current board as JSON">
          <span>💾 Export Board as JSON</span>
        </button>
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <>
                <span>☀️ Light Mode</span>
              </>
            ) : (
              <>
                <span>🌑 Dark Mode</span>
              </>
            )}
          </button>
        </div>
    </aside>
  );
}