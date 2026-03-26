import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableBoardItem({ board, activeBoardID, onSelectBoard, onRenameBoard, onDeleteBoard }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: board.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        {...attributes} 
        {...listeners} 
        className={`board-item-wrapper ${board.isNew ? 'is-new' : ''} ${board.isDeleting ? 'is-deleting' : ''} ${board.isRenamed ? 'is-renamed' : ''}`}
    >
      <button
        className={`board-link ${board.id === activeBoardID ? 'active' : ''}`}
        onClick={() => onSelectBoard(board.id)}
      >
        {board.name}
      </button>
      <div className="board-actions">
        <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onRenameBoard(board); }} className="edit-board-name-btn">✏️</button>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onDeleteBoard(board.id); }} className="delete-board-btn">X</button>
      </div>
    </div>
  );
}