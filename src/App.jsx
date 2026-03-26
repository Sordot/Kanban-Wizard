import { useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './App.css';

import { useTheme } from './hooks/useTheme';
import { useBoards } from './hooks/useBoards';
import { useFilters } from './hooks/useFilters';
import { useUIState } from './hooks/useUIState';
import { issueIcons } from './utils/helpers';
import FilterBar from './components/FilterBar';
import Column from './components/Column';
import ConfirmationModal from './components/ConfirmationModal';
import Sidebar from './components/Sidebar';
import TaskModal from './components/TaskModal';
import AnalyticsBar from './components/AnalyticsBar';

const DEFAULT_DATA = [
  {
    id: 'board-1',
    name: '🚀 Project 1',
    columns: [{ id: 1, title: 'To Do', tasks: [{ id: 't1', text: 'Example Task', priority: 'High', description: 'Click this field to edit!', isNew: false }, { id: 't2', text: 'Drag Me', priority: 'Low', description: '', isNew: false }] },
    { id: 2, title: 'In Progress', tasks: [] },
    { id: 3, title: 'Done', tasks: [] }]
  },
  {
    id: 'board-2',
    name: '🛠️ Project 2',
    columns: [{ id: 1, title: 'To Do', tasks: [{ id: 't1', text: 'Learn React', priority: 'High', description: 'Shake off the rust!', isNew: false }, { id: 't2', text: 'Drag Me', priority: 'Low', description: '', isNew: false }] },
    { id: 2, title: 'In Progress', tasks: [] },
    { id: 3, title: 'Done', tasks: [] }]
  }
];

function App() {
  const { theme, toggleTheme } = useTheme();

  // 1. Initialize our focused hooks
  const boardData = useBoards(DEFAULT_DATA);
  const filterData = useFilters(boardData.columns);
  const uiState = useUIState();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleString([], {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const customCollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    return closestCorners(args);
  };

  // --- GLUE LOGIC ---
  // Connects the UI state variables to the Data functions

  const handleAddTask = (columnID) => {
    const newTask = {
      id: `task-${Date.now()}`,
      text: '',
      priority: 'Medium',
      description: '',
      isNew: true, // triggers edit mode
      updatedAt: Date.now()
    };
    // Send it directly to the UI layer to open the modal
    uiState.openTaskModal(columnID, newTask);
  };

  const handleAddColumn = () => {
    // Assuming you refactored addColumn in useBoards to accept a title string
    boardData.addColumn(uiState.newColumnTitle);
    uiState.closeColumnEditor();
  };

  const confirmDelete = () => {
    const { type, data } = uiState.modalConfig;
    if (type === 'column') boardData.removeColumn(data.columnID);
    if (type === 'task') boardData.deleteTask(data.columnID, data.taskID);
    if (type === 'board') boardData.deleteBoard(data.boardID);
    if (type === 'renameBoard') boardData.updateBoard(data.boardID, { name: uiState.modalRenameValue });
    uiState.closeModal();
  };

  const handleDeleteTask = (colId, taskId) => {
    uiState.openDeleteModal('task', { columnID: colId, taskID: taskId });
  };

  const handleRemoveColumn = (columnID) => {
    uiState.openDeleteModal('column', { columnID });
  };

  return (
    <div className="app-layout">
      <Sidebar
        boards={boardData.boards}
        activeBoardID={boardData.activeBoardID}
        onSelectBoard={boardData.setActiveBoardID}
        onAddBoard={boardData.addBoard}
        onDeleteBoard={uiState.openDeleteModal}
        onRenameBoard={uiState.openRenameModal}
        onExportBoard={boardData.exportBoard}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <div className='kanban-container'>
        <FilterBar
          filters={filterData.filters}
          setFilters={filterData.setFilters}
          uniqueAssignees={filterData.uniqueAssignees}
        />

        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragOver={boardData.handleDragOver}
          onDragEnd={(e) => {
            boardData.handleDragEnd(e);
            uiState.setActiveTask(null);
          }}
          onDragStart={(e) => uiState.handleDragStart(e, boardData.columns)}
        >
          <div className='kanban-board'>
            {filterData.filteredColumns && filterData.filteredColumns.map((column, index, array) => (
              <Column
                key={column.id}
                column={column}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onUpdateTask={boardData.updateTask}
                onSortColumn={boardData.sortColumn}
                onUpdateColumn={boardData.updateColumn}
                onClearColumn={boardData.clearColumn}
                isFirstColumn={index === 0}
                isLastColumn={index === array.length - 1}
                onMoveColumn={boardData.moveColumn}
                onRemoveColumn={handleRemoveColumn}
                onOpenTaskModal={uiState.openTaskModal}
              />
            ))}

            {uiState.isAddingColumn ? (
              <div className="add-column-editor">
                <input
                  autoFocus
                  className="edit-input"
                  style={{ width: '100%', fontSize: '1.1rem', boxSizing: 'border-box', padding: '6px 10px' }}
                  placeholder="Name this column..."
                  value={uiState.newColumnTitle}
                  onChange={(e) => uiState.setNewColumnTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn();
                    if (e.key === 'Escape') uiState.closeColumnEditor();
                  }}
                />
                <div className="edit-actions">
                  <button className="cancel-btn" onClick={uiState.closeColumnEditor}>Cancel</button>
                  <button className="save-btn" onClick={handleAddColumn}>Add Column</button>
                </div>
              </div>
            ) : (
              <button className="add-column-btn" onClick={uiState.openColumnEditor}>
                <span>+ Add Column</span>
              </button>
            )}
          </div>

          <ConfirmationModal
            isOpen={uiState.modalConfig.isOpen}
            title={uiState.modalConfig.type === 'renameBoard' ? "Rename Board" : `Delete ${uiState.modalConfig.type}?`}
            confirmText={uiState.modalConfig.type === 'renameBoard' ? 'Save Changes' : "Delete"}
            message={
              uiState.modalConfig.type === 'renameBoard'
                ? "Enter a new name for your workspace."
                : "This action is permanent and cannot be undone."
            }
            variant={uiState.modalConfig.type === 'renameBoard' ? "confirm" : "danger"}
            onConfirm={confirmDelete}
            onCancel={uiState.closeModal}
          >
            {uiState.modalConfig.type === 'renameBoard' && (
              <input
                className="modal-rename-input"
                value={uiState.modalRenameValue}
                onChange={(e) => uiState.setModalRenameValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmDelete()}
                autoFocus
              />
            )}
          </ConfirmationModal>

          <TaskModal
            isOpen={uiState.taskModalConfig.isOpen}
            task={uiState.taskModalConfig.task}
            onClose={() => uiState.closeTaskModal()}
            onSave={(taskID, updatedTask, isClosing = false) => {
              const currentColumn = boardData.columns.find(col => col.id === uiState.taskModalConfig.columnID);
              const taskAlreadyInserted = currentColumn?.tasks.some(t => t.id === taskID);
              const isOriginallyNew = uiState.taskModalConfig.task?.isNew;

              if (isOriginallyNew && !taskAlreadyInserted) {
                boardData.insertTask(uiState.taskModalConfig.columnID, {
                  ...updatedTask,
                  isNew: isClosing ? true : 'draft'
                });
              } else if (isOriginallyNew && taskAlreadyInserted) {
                boardData.updateTask(uiState.taskModalConfig.columnID, taskID, {
                  ...updatedTask,
                  isNew: isClosing ? true : 'draft'
                });
              } else {
                boardData.updateTask(uiState.taskModalConfig.columnID, taskID, {
                  ...updatedTask,
                  isNew: updatedTask.isNew
                });
              }
            }}
          />

          <DragOverlay>
            {uiState.activeTask ? (
              <div className="tilt-wrapper">
                <div
                  className={`task-card dragging-overlay priority-${uiState.activeTask.priority}`}
                  style={{
                    minHeight: '100px',
                    border: '2px dashed #0073cf', // Bright accent outline
                    backgroundColor: 'var(--bg-color)', // Very faint magical tint
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    /* Forces the ghost card onto its own hardware-accelerated compositor layer for optimized dragging */
                    willChange: 'transform'
                  }}
                ></div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <AnalyticsBar columns={filterData.filteredColumns} />

        <footer className="portfolio-footer">
          <div className="footer-content">
            <span className="built-by">
              Built by <strong>Theo Gevirtz</strong>
            </span>
            <a href="https://github.com/Sordot/Theo-Kanban" target="_blank" rel="noopener noreferrer" className='footer-link'>
              <FaGithub size={18} />
              <span>GitHub</span>
            </a>
            <a href="https://www.linkedin.com/in/theodore-gevirtz/" target="_blank" rel="noopener noreferrer" className='footer-link'>
              <FaLinkedin size={18} />
              <span>LinkedIn</span>
            </a>
          </div>
        </footer>

        <Tooltip
          id="wizard-tooltip"
          className="wizard-theme-tooltip"
          place="top"
          arrowColor='#0073cf'
          delayShow={200}
        />
      </div>
    </div>
  );
}

export default App;
