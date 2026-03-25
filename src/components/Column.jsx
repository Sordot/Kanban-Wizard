import { useState, useRef, useEffect } from 'react';
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable, useDndContext } from '@dnd-kit/core';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import SortableTask from "./SortableTask"

export default function Column({ column, onAddTask, onDeleteTask, onUpdateTask, onUpdateColumn, onClearColumn, onSortColumn, onRemoveColumn, onOpenTaskModal }) {

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleInput, setTitleInput] = useState(column.title);

    // Initialize useDroppable for the entire column
    const { setNodeRef } = useDroppable({ id: column.id });
    // Setup useDndContext to track exactly what is being hovered globally
    const { over } = useDndContext();

    // The column glows if we are hovering the column's empty space OR any task inside this column
    const isDragOver = over && (
        over.id === column.id || 
        column.tasks.some(task => task.id === over.id)
    );

    // Check for newly created columns and clear their isNew state 1000ms after creation to match animation timer
    useEffect(() => {
        if (column.isNew) {
            const timer = setTimeout(() => {
                onUpdateColumn(column.id, { isNew: false });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [column.isNew, column.id, onUpdateColumn]);

    const handleTitleSave = () => {
        const finalTitle = titleInput.trim() ? titleInput : "Untitled Column";
        setTitleInput(finalTitle); // Reset to fallback if they left it blank
        setIsEditingTitle(false);
        if (onUpdateColumn) {
            onUpdateColumn(column.id, { title: finalTitle });
        }
    };

    return (
        <div ref={setNodeRef} className={`kanban-column ${column.isDeleting ? 'is-deleting' : ''} ${column.isNew ? 'is-new' : ''} ${isDragOver ? 'is-drag-over' : ''}`}
            key={column.id}
            style={{ overflow: column.isNew ? 'hidden' : undefined }}
        >
            <div className="column-header">
                <div className="column-title-container">
                    {isEditingTitle ? (
                        <input
                            className="editable-field" // Added editable-field
                            autoFocus
                            maxLength={40}
                            value={titleInput}
                            onChange={(e) => setTitleInput(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                            style={{
                                display: 'block',
                                width: '100%',
                                boxSixing: 'border-box',
                                fontSize: '1.2em',
                                fontWeight: 'bold',
                                background: 'transparent',
                                color: 'inherit',
                                outline: 'none',
                                appearance: 'none',       /* Strips native browser focus shifts */
                                WebkitAppearance: 'none', /* For Safari */
                                lineHeight: '1.2'         /* Locks text baseline */
                            }}
                        />
                    ) : (
                        <div
                            className="column-title editable-field" /* Changed from editable */
                            onClick={() => setIsEditingTitle(true)}
                            title="Click to edit title"
                            style={{
                                display: 'block',
                                width: '100%',
                                boxSixing: 'border-box',
                                fontSize: '1.2em',
                                fontWeight: 'bold',
                                lineHeight: '1.2',        /* Matches input baseline exactly */
                                whiteSpace: 'nowrap',     /* Matches input's single-line behavior */
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            {column.title}
                        </div>
                    )}
                </div>

                <div className="column-controls">
                    <button className="add-task-btn" onClick={() => onAddTask(column.id)}><span>+</span></button>

                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button className="column-menu-btn" aria-label="Column Options">
                                ⋮
                            </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                            <DropdownMenu.Content className="radix-menu-content" sideOffset={5} align="end">
                                
                                {/* Sub-Menu for Sorting */}
                                <DropdownMenu.Sub>
                                    <DropdownMenu.SubTrigger className="radix-menu-item">
                                        ↕️ Sort tasks...
                                        <div className="radix-menu-right-slot">▶</div>
                                    </DropdownMenu.SubTrigger>
                                    <DropdownMenu.Portal>
                                        <DropdownMenu.SubContent className="radix-menu-content" sideOffset={2} alignOffset={-5}>
                                            <DropdownMenu.Item className="radix-menu-item" onSelect={() => onSortColumn(column.id, 'newest')}>✨ Newest</DropdownMenu.Item>
                                            <DropdownMenu.Item className="radix-menu-item" onSelect={() => onSortColumn(column.id, 'oldest')}>🕰️ Oldest</DropdownMenu.Item>
                                            <DropdownMenu.Item className="radix-menu-item" onSelect={() => onSortColumn(column.id, 'alpha')}>📖 A-Z</DropdownMenu.Item>
                                            <DropdownMenu.Item className="radix-menu-item" onSelect={() => onSortColumn(column.id, 'effort')}>⚡ Effort</DropdownMenu.Item>
                                            <DropdownMenu.Item className="radix-menu-item" onSelect={() => onSortColumn(column.id, 'priority-desc')}>🔥 Highest Priority</DropdownMenu.Item>
                                            <DropdownMenu.Item className="radix-menu-item" onSelect={() => onSortColumn(column.id, 'priority-asc')}>🕯️ Lowest Priority</DropdownMenu.Item>
                                        </DropdownMenu.SubContent>
                                    </DropdownMenu.Portal>
                                </DropdownMenu.Sub>

                                <DropdownMenu.Separator className="radix-menu-separator" />
                                
                                <DropdownMenu.Item className="radix-menu-item" onSelect={() => onClearColumn(column.id)}>
                                    🔄 Clear tasks
                                </DropdownMenu.Item>
                                <DropdownMenu.Item className="radix-menu-item radix-menu-item-danger" onSelect={() => onRemoveColumn(column.id)}>
                                    ❌ Delete column
                                </DropdownMenu.Item>

                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>
            </div>



            <SortableContext id={column.id} items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                <div id={column.id} className="task-list">
                    {column.tasks.length === 0 && (
                        <div className="empty-column-placeholder">
                            <h4>No tasks here yet.</h4>
                        </div>
                    )}
                    {column.tasks.map((task) => (
                        <SortableTask
                            key={task.id}
                            id={task.id}
                            task={task}
                            columnID={column.id}
                            onDelete={onDeleteTask}
                            onUpdate={onUpdateTask}
                            onOpenModal={onOpenTaskModal}
                        />
                    ))}
                </div>
            </SortableContext>
            <div className="column-footer">
                <span className="task-count">
                    {column.tasks.length} {column.tasks.length === 1 ? 'Task' : 'Tasks'}
                </span>
            </div>
        </div>
    );
}