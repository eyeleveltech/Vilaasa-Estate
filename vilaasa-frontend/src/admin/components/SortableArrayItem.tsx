import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, Trash2 } from "lucide-react";

interface SortableArrayItemProps {
  id: string;
  children: React.ReactNode;
  onClone: () => void;
  onRemove: () => void;
  canRemove?: boolean;
}

/**
 * Generic drag-to-reorder wrapper for dynamic array items.
 * Renders a 6-dot grip handle, a Clone icon, and a Delete icon
 * in a top row above the item's content.
 */
export const SortableArrayItem: React.FC<SortableArrayItemProps> = ({
  id,
  children,
  onClone,
  onRemove,
  canRemove = true,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag & action controls bar */}
      <div className="absolute -top-2 left-0 right-0 flex items-center justify-between px-1 z-10">
        {/* Grip handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex items-center gap-0.5 cursor-grab active:cursor-grabbing p-1 rounded text-muted-foreground/40 hover:text-muted-foreground hover:bg-secondary/60 transition-colors touch-none"
          title="Drag to reorder"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        {/* Clone + Delete */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onClone}
            className="p-1 rounded text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors"
            title="Clone item"
            aria-label="Clone"
          >
            <Copy className="h-3 w-3" />
          </button>
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1 rounded text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Remove item"
              aria-label="Remove"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Item content */}
      <div className="pt-4">{children}</div>
    </div>
  );
};

export default SortableArrayItem;
