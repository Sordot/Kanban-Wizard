import { memo, useEffect } from 'react';
import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { envIcons, issueIcons } from '../utils/helpers';

const SortableTask = memo(({ id, task, columnID, onDelete, onUpdate, onOpenModal }) => {

    const isNewTask = task.isNew === true;
    const isDeleting = task.isDeleting === true;

    // Keep the flash animation effect
    useEffect(() => {
        if (isNewTask) {
            const timer = setTimeout(() => {
                onUpdate(columnID, id, { isNew: false });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isNewTask, columnID, id, onUpdate]);

    // Optimize layout changes (prevents jitter when entering new columns)
    const animateLayoutChanges = (args) => {
        const { isSorting, wasDragging } = args;
        // Only animate layout changes during an active drag/sort
        if (isSorting || wasDragging) {
            return defaultAnimateLayoutChanges(args);
        }
        return true;
    };

    // 2. Add the optimized physics to the hook
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ 
        id,
        animateLayoutChanges,
        transition: {
            duration: 350, // Slightly increased duration for a more visible glide
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)', // Smooth deceleration curve
        }
    });

    const formatTime = (ts) => {
        if (!ts) return ''
        return new Date(ts).toLocaleString([], {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })
    }

    const style = {
        transform: CSS.Translate.toString(transform),
        transition: transition,
    }

    // Determine the CSS class based on the search status passed from useKanban
    const searchClass = task.searchStatus === 'matched' ? 'search-matched' :
        task.searchStatus === 'obscured' ? 'search-obscured' : '';

    // If the item is currently being dragged, replace its entire complex DOM structure 
    // in the underlying list with a lightweight, empty placeholder box.
    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={{
                    ...style,
                    height: '100px', // Approximate height to keep the list stable
                    border: '2px dashed var(--accent-color)', // Faint magical border
                    backgroundColor: 'var(--bg-color)', // Very faint tint
                    borderRadius: '8px',
                    opacity: 0.5
                }}
            />
        );
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}
            className={
                `task-card priority-${task.priority} 
                ${isNewTask ? 'is-new' : ''} 
                ${isDeleting ? 'is-deleting' : ''}
                ${searchClass}`
            }>
            <div className='task-content'>
                <div className='task-header'>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {task.assignee && (
                            // hacky fix to ensure assignee avatar can keep its overflow hidden for its circular shape while still having tooltip
                            <div data-tooltip-id="wizard-tooltip" data-tooltip-content={`${task.assignee}`} style={{ display: 'inline-flex' }}>
                                <span
                                    className="assignee-avatar"
                                >
                                    {task.assignee.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <span className="task-card-issue-icon" data-tooltip-id="wizard-tooltip" data-tooltip-content={`${task.issueType}`}>
                            {issueIcons[task.issueType || "📜"]}
                        </span>
                        <span className="task-card-env-icon" data-tooltip-id="wizard-tooltip" data-tooltip-content={`${task.environment}`}>
                            {envIcons[task.environment] || "🧙‍♂️"}
                        </span>
                    </div>
                    <div>
                        <button
                            className='edit-btn'
                            data-tooltip-id="wizard-tooltip"
                            data-tooltip-content="Edit task"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenModal(columnID, task);
                            }}>
                            🔍
                        </button>
                    </div>
                </div>
                <p className='task-text'>{task.text || 'Untitled Task'}</p>
                <div className='task-footer' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px' }}>
                    {task.subtasks?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                            <span className='footer-label'>
                                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} Subtasks
                            </span>
                            <div className="mana-tube-glass" style={{ height: '4px', minHeight: '4px', padding: 0, border: 'none' }}>
                                <div
                                    className="mana-liquid"
                                    style={{ width: `${Math.round((task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    ) : (
                        <span className='footer-label'>
                            0 Subtasks
                        </span>
                    )}
                    <span className='footer-label' style={{ whiteSpace: 'nowrap' }}>
                        Updated: {formatTime(task.updatedAt)}
                    </span>
                </div>
            </div>
        </div>
    )
})

export default SortableTask