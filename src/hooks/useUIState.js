import { useState, useCallback } from "react";

export const useUIState = () => {

  const [currentView, setCurrentView] = useState('board')

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  const [activeTask, setActiveTask] = useState(null)

  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState("")

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null, // 'task' or 'column'
    data: null // stores IDs needed for deletion
  })

  const [modalRenameValue, setModalRenameValue] = useState('')

  const [taskModalConfig, setTaskModalConfig] = useState({
    isOpen: false,
    columnID: null,
    task: null
  })

  const openColumnEditor = () => setIsAddingColumn(true)
  const closeColumnEditor = () => {
    setIsAddingColumn(false)
    setNewColumnTitle("")
  }

  const openDeleteModal = useCallback((type, data) => {
    setModalConfig({ isOpen: true, type, data })
  }, []);

  const closeModal = () => {
    setModalConfig({ isOpen: false, type: null, data: null })
  }

  const openRenameModal = (board) => {
    setModalRenameValue(board.name);
    setModalConfig({
      isOpen: true,
      type: 'renameBoard',
      data: { boardID: board.id }
    });
  };

  const openTaskModal = useCallback((columnID, task) => {
    setTaskModalConfig({ isOpen: true, columnID, task });
  }, []);

  const closeTaskModal = () => {
    setTaskModalConfig({ isOpen: false, columnID: null, task: null });
  };



  //DragStart is here instead of useBoards because it touches activeTask
  const handleDragStart = (event, columns) => {
    const { active } = event
    //Find task object from columns state
    const task = columns.flatMap(column => column.tasks).find(task => task.id === active.id)
    setActiveTask(task)
  }

  return {
    currentView,
    setCurrentView,
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    activeTask,
    setActiveTask,
    isAddingColumn,
    newColumnTitle,
    setNewColumnTitle,
    openColumnEditor,
    closeColumnEditor,
    modalConfig,
    openDeleteModal,
    closeModal,
    modalRenameValue,
    setModalRenameValue,
    openRenameModal,
    taskModalConfig,
    openTaskModal,
    closeTaskModal,
    handleDragStart
  };
}