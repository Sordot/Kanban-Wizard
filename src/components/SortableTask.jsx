import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableTask({id, task, columnID, onDelete}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({id: id})

    const style = {
        transform: CSS.Transform.toString(transform), 
        transition,
        opacity: isDragging ? 0.3 : 1 //fade placeholder to 0.3 when item is picked up
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`task-card priority-${task.priority}`}>
            <div className="task-content">
                <div className="task-header">
                    <span className={`priority-badge ${task.priority || 'medium'}`}>
                        {(task.priority || 'medium').toUpperCase()}
                    </span>
                    <span className="task-date-created">{task.createdAt}</span>
                    <button className='delete-btn' 
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) =>{e.stopPropagation(); onDelete(columnID, id)}}>
                        x
                    </button>
                </div>
                <p className="task-text">{task.text}</p>
                {task.description && (
                    <p className="task-desc-preview">{task.description}</p>
                )}
            </div>
        </div>
    )
}

export default SortableTask