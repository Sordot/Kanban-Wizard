import { useState, useEffect, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";

export const useBoards = (initialData) => {

    //State for boards and activeID
    const [boards, setBoards] = useState(() => {
        const saved = localStorage.getItem('theo-kanban-boards');
        return saved ? JSON.parse(saved) : initialData;
    });
    const [activeBoardID, setActiveBoardID] = useState(boards[0].id)

    //Get the columns for the currently selected board
    const activeBoard = boards.find(board => board.id === activeBoardID)
    const columns = activeBoard ? activeBoard.columns : []

    // Strip out animation flags so they never trigger on a page refresh
    useEffect(() => {
        // Deep copy to pull out animation flags so they never trigger on a page refresh
        const boardsToSave = boards.map(board => {
            return {
                ...board,
                isNew: false,
                isRenamed: false,
                isDeleting: false,
                // Map through columns to clean them
                columns: board.columns.map(col => ({
                    ...col,
                    isNew: false,
                    isDeleting: false,
                    // Map through tasks to clean them
                    tasks: col.tasks.map(task => ({
                        ...task,
                        isNew: false,
                        isDeleting: false
                    }))
                }))
            };
        });
        
        localStorage.setItem('theo-kanban-boards', JSON.stringify(boardsToSave));
    }, [boards]);

    const addBoard = useCallback(() => {
        const newBoardId = `board-${Date.now()}`;
        const newBoard = {
            id: newBoardId,
            name: "🌱 Untitled Project",
            columns: [
                { id: `col-1-${Date.now()}`, title: "To Do", tasks: [] },
                { id: `col-2-${Date.now()}`, title: "In Progress", tasks: [] },
                { id: `col-3-${Date.now()}`, title: "Done", tasks: [] }
            ],
            isNew: true // Mark as new
        };

        setBoards(prev => [...prev, newBoard]);
        setActiveBoardID(newBoard.id);

        // Add this timeout to clear the isNew flag after the animation finishes
        setTimeout(() => {
            setBoards(prev => prev.map(board => 
                board.id === newBoardId ? { ...board, isNew: false } : board
            ));
        }, 800);
    }, []);

    const updateBoard = (boardID, updates) => {
        // Detect if the update includes a name change
        const isRenaming = updates.name !== undefined;

        setBoards(prev => prev.map(board =>
            board.id === boardID ? { ...board, ...updates, isRenamed: isRenaming } : board
        ));

        // Clear the flag after the 0.8s animation finishes
        if (isRenaming) {
            setTimeout(() => {
                setBoards(prev => prev.map(board =>
                    board.id === boardID ? { ...board, isRenamed: false } : board
                ));
            }, 800);
        }
    };

    const deleteBoard = useCallback((id) => {
        if (boards.length <= 1) return; // Prevent deleting the last board

        // 1. Mark the board for deletion
        setBoards(prev => prev.map(board =>
            board.id === id ? { ...board, isDeleting: true } : board
        ));

        // 2. Wait for animation (1s) then remove
        setTimeout(() => {
            setBoards(prev => {
                const filtered = prev.filter(board => board.id !== id);
                // Switch active board if the one we deleted was active
                if (activeBoardID === id && filtered.length > 0) {
                    setActiveBoardID(filtered[0].id);
                }
                return filtered;
            });
        }, 1000);
    }, [boards.length, activeBoardID]);

    //Export board logic
    const exportBoard = useCallback(async () => {
        const boardToExport = boards.find(b => b.id === activeBoardID);
        if (!boardToExport) return;

        // Data Cleaning
        const cleanBoard = {
            ...boardToExport,
            columns: boardToExport.columns.map(col => ({
                ...col,
                isDeleting: false,
                isNew: false,
                tasks: col.tasks.map(task => ({
                    ...task,
                    isDeleting: false,
                    isNew: false
                }))
            }))
        };

        const dataStr = JSON.stringify(cleanBoard, null, 2);
        const fileName = `${boardToExport.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;

        // File System Access API
        try {
            // Check if the browser supports the API
            if ('showSaveFilePicker' in window) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        description: 'JSON File',
                        accept: { 'application/json': ['.json'] },
                    }],
                });

                // Create a FileSystemWritableFileStream to write to.
                const writable = await handle.createWritable();

                // Write the contents of our file to the stream.
                await writable.write(dataStr);

                // Close the file and write the contents to disk.
                await writable.close();

                console.log("Successfully exported board.");
            } else {
                // 3. Fallback: The Anchor Ritual (For Safari/Older Browsers)
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                link.click();
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            // Handle user cancellation or errors
            if (err.name !== 'AbortError') {
                console.error("Failed to export:", err);
            }
        }
    }, [boards, activeBoardID]);

    //=========COLUMN CRUD=================
    const addColumn = (title) => {
        const cleanTitle = title.trim()
        if (!cleanTitle) return

        const newColumn = {
            // eslint-disable-next-line react-hooks/purity
            id: `col-${Date.now()}`,
            title: title,
            tasks: [],
            isNew: true
        }

        setBoards(prevBoards => prevBoards.map(board => {
            if (board.id !== activeBoardID) return board
            return { ...board, columns: [...board.columns, newColumn] };
        }));
    }

    const updateColumn = useCallback((columnID, updates) => {
        setBoards(prevBoards => prevBoards.map(board => {
            if (board.id !== activeBoardID) return board;
            return {
                ...board,
                columns: board.columns.map(col => {
                    if (col.id === columnID) {
                        return { ...col, ...updates };
                    }
                    return col;
                })
            };
        }));
    }, [activeBoardID]);

    const clearColumn = useCallback((columnID) => {
        setBoards(prevBoards => prevBoards.map(board => {
            // Guardrail: only modify the active board
            if (board.id !== activeBoardID) return board;

            return {
                ...board,
                columns: board.columns.map(col => {
                    if (col.id === columnID) {
                        // Return the column with an empty tasks array
                        return { ...col, tasks: [] };
                    }
                    return col;
                })
            };
        }));
    }, [activeBoardID]);

    const sortColumn = useCallback((columnID, sortType) => {
        setBoards(prevBoards => prevBoards.map(board => {
            // Guardrail: only modify the active board
            if (board.id !== activeBoardID) return board;

            return {
                ...board,
                columns: board.columns.map(col => {
                    if (col.id === columnID) {
                        // Create a copy of tasks to sort
                        const sortedTasks = [...col.tasks].sort((a, b) => {

                            // FIX: Use the native updatedAt property first! 
                            // Falls back to parsing the ID, then defaults to 0 for 't1'/'t2'
                            const timeA = a.updatedAt || parseInt(a.id.split('-')[1], 10) || 0;
                            const timeB = b.updatedAt || parseInt(b.id.split('-')[1], 10) || 0;

                            // Map priorities to numerical weights for sorting
                            const priorityWeight = { 'Low': 1, 'Medium': 2, 'High': 3 };
                            const effortWeight = { 'Small': 1, 'Medium': 2, 'Large': 3, 'X-Large': 4 };

                            switch (sortType) {
                                case 'newest':
                                    return timeB - timeA; // Higher (newer) timestamp first
                                case 'oldest':
                                    return timeA - timeB; // Lower (older) timestamp first
                                case 'alpha':
                                    return (a.text || "").localeCompare(b.text || "");
                                case 'effort':
                                    return (effortWeight[b.effort] || 0) - (effortWeight[a.effort] || 0);
                                case 'priority-desc':
                                    return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
                                case 'priority-asc':
                                    return (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0);
                                default:
                                    return 0;
                            }
                        });
                        return { ...col, tasks: sortedTasks };
                    }
                    return col;
                })
            };
        }));
    }, [activeBoardID]);

    const moveColumn = useCallback((columnID, direction) => {
        setBoards(prevBoards => prevBoards.map(board => {
            // Guardrail: only modify the active board
            if (board.id !== activeBoardID) return board;

            // Find the index of the column we want to move
            const columnIndex = board.columns.findIndex(col => col.id === columnID);

            // If column isn't found, do nothing
            if (columnIndex === -1) return board;

            // Create a shallow copy of the columns array to mutate
            const newColumns = [...board.columns];

            if (direction === 'left' && columnIndex > 0) {
                // Swap with the left neighbor
                [newColumns[columnIndex - 1], newColumns[columnIndex]] =
                    [newColumns[columnIndex], newColumns[columnIndex - 1]];

            } else if (direction === 'right' && columnIndex < newColumns.length - 1) {
                // Swap with the right neighbor
                [newColumns[columnIndex], newColumns[columnIndex + 1]] =
                    [newColumns[columnIndex + 1], newColumns[columnIndex]];
            }

            // Return the updated board state
            return { ...board, columns: newColumns };
        }));
    }, [activeBoardID]);

    const removeColumn = useCallback((columnID) => {
        // Mark the column as deleting first
        updateColumn(columnID, { isDeleting: true });

        // Wait for the 1000ms animation before removing from state
        setTimeout(() => {
            setBoards(prev => prev.map(board => {
                if (board.id !== activeBoardID) return board;
                return {
                    ...board,
                    columns: board.columns.filter(col => col.id !== columnID)
                };
            }));
        }, 1000);
    }, [activeBoardID, updateColumn]);

    //============TASK CRUD===============

    const insertTask = useCallback((columnID, newTask) => {
        setBoards(prevBoards => prevBoards.map(board => {
            if (board.id !== activeBoardID) return board;
            return {
                ...board,
                columns: board.columns.map(col => {
                    if (col.id === columnID) {
                        return { ...col, tasks: [...col.tasks, newTask] };
                    }
                    return col;
                })
            };
        }));
    }, [activeBoardID]);

    
    const updateTask = useCallback((columnID, taskID, updates) => {
        setBoards(prevBoards => prevBoards.map(board => {
            if (board.id !== activeBoardID) return board;
            return {
                ...board,
                columns: board.columns.map(column => {
                    if (column.id !== columnID) return column;
                    return {
                        ...column,
                        tasks: column.tasks.map(task => {
                            if (task.id === taskID) {
                                // if (updates.isNew === false && task.isNew === false) return task; STRICT check
                                return { ...task, ...updates, updatedAt: Date.now() };
                            }
                            return task;
                        })
                    };
                })
            };
        }));
    }, [activeBoardID]);

    const deleteTask = useCallback((columnID, taskID) => {
        // 1. First, mark the task as "deleting" to trigger the CSS
        updateTask(columnID, taskID, { isDeleting: true });

        // 2. Wait for the animation (1000ms matches the CSS duration)
        setTimeout(() => {
            setBoards(prevBoards => prevBoards.map(board => {
                if (board.id !== activeBoardID) return board;
                return {
                    ...board,
                    columns: board.columns.map(col => {
                        if (col.id !== columnID) return col;
                        return {
                            ...col,
                            tasks: col.tasks.filter(task => task.id !== taskID)
                        };
                    })
                };
            }));
        }, 1000); // 1000ms delay
    }, [activeBoardID, updateTask]);

    //================DRAG UTILS=================
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeID = active.id;
        const overID = over.id;

        setBoards((prevBoards) => {
            return prevBoards.map(board => {
                // Guardrail: Only process drag logic for the active board
                if (board.id !== activeBoardID) return board;

                const activeColumn = board.columns.find(column => column.tasks.some(task => task.id === activeID));
                const overColumn = board.columns.find(column => column.id === overID || column.tasks.some(task => task.id === overID));

                if (!activeColumn || !overColumn) return board;

                // Handle same-column reordering
                if (activeColumn.id === overColumn.id) {
                    //abort state update if dropped in original position to prevent rerender/flashing
                    if (active.id === over.id) return board;
                    const oldIndex = activeColumn.tasks.findIndex(task => task.id === activeID);
                    let newIndex = activeColumn.tasks.findIndex(task => task.id === overID);
                    // FIX: If dropped in the empty space below tasks, push to the end
                    if (newIndex === -1 && overID === overColumn.id) {
                        newIndex = activeColumn.tasks.length - 1;
                    }

                    return {
                        ...board,
                        columns: board.columns.map(column => {
                            if (column.id === activeColumn.id) {
                                // FIX: Only run arrayMove if dropped over an actual task (newIndex !== -1)
                                // This hacky index check prevents the task card from snapping downward when moved between tasks
                                if (newIndex !== -1) {
                                    return { ...column, tasks: arrayMove(column.tasks, oldIndex, newIndex) };
                                }
                            }
                            return column;
                        })
                    };
                }
                return board;
            });
        });
    };

    const handleDragOver = (event) => {
        const { active, over } = event
        if (!over) return

        const activeID = active.id
        const overID = over.id

        setBoards((prevBoards) => {
            return prevBoards.map((board) => {
                // Only perform drag logic on the active board
                if (board.id !== activeBoardID) return board;

                const activeColumn = board.columns.find(col => col.tasks.some(task => task.id === activeID));
                const overColumn = board.columns.find(col => col.id === overID || col.tasks.some(task => task.id === overID));

                if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
                    return board;
                }

                const activeTask = activeColumn.tasks.find(t => t.id === activeID);
                const cleanedTask = { ...activeTask, isNew: false };
                const overTasks = overColumn.tasks;

                const overIndex = overTasks.findIndex(t => t.id === overID);
                let newIndex;
                if (overIndex >= 0) {
                    // Check if active item is vertically below the over item's center
                    // helps to prevent task cards from shifting on letting go
                    const isBelowOverItem = over && active.rect.current.translated &&
                        active.rect.current.translated.top > over.rect.top + over.rect.height / 2;

                    const modifier = isBelowOverItem ? 1 : 0;
                    newIndex = overIndex + modifier;
                } else {
                    // Dropped on empty column
                    newIndex = overTasks.length;
                }

                return {
                    ...board,
                    columns: board.columns.map(column => {
                        if (column.id === activeColumn.id) {
                            return { ...column, tasks: column.tasks.filter(t => t.id !== activeID) };
                        }
                        if (column.id === overColumn.id) {
                            const newTasks = [...column.tasks];
                            newTasks.splice(newIndex, 0, cleanedTask);
                            return { ...column, tasks: newTasks };
                        }
                        return column;
                    })
                };
            });
        });
    }

    //================BOARD DRAG UTILS=================
    const handleBoardDragEnd = useCallback((event) => {
        const { active, over } = event;
        
        if (over && active.id !== over.id) {
            setBoards((prevBoards) => {
                const oldIndex = prevBoards.findIndex(board => board.id === active.id);
                const newIndex = prevBoards.findIndex(board => board.id === over.id);
                return arrayMove(prevBoards, oldIndex, newIndex);
            });
        }
    }, []);

    return {
        boards,
        setBoards,
        activeBoardID,
        setActiveBoardID,
        columns,
        addBoard,
        updateBoard,
        deleteBoard,
        exportBoard,
        addColumn,
        updateColumn,
        clearColumn,
        sortColumn,
        moveColumn,
        removeColumn,
        insertTask,
        updateTask,
        deleteTask,
        handleDragOver,
        handleDragEnd,
        handleBoardDragEnd
    }
}