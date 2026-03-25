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
        transform: CSS.Transform.toString(transform),
        transition: transition,
        opacity: isDragging ? 0.3 : 1
    }

    // Determine the CSS class based on the search status passed from useKanban
    const searchClass = task.searchStatus === 'matched' ? 'search-matched' :
        task.searchStatus === 'obscured' ? 'search-obscured' : '';

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
                        <button className='delete-btn'
                            data-tooltip-id="wizard-tooltip"
                            data-tooltip-content="Delete task"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); onDelete(columnID, id); }}>
                            ❌
                        </button>
                    </div>
                </div>
                <p className='task-text'>{task.text || 'Untitled Task'}</p>
                <div className='task-footer' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className='footer-label'>
                        {task.subtasks?.length || 0} {task.subtasks?.length === 1 ? 'Subtask' : 'Subtasks'}
                    </span>
                    <span className='footer-label'>
                        Updated: {formatTime(task.updatedAt)}
                    </span>
                </div>
            </div>
        </div>
    )
})

export default SortableTask