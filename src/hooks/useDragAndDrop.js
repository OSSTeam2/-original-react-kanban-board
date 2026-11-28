import { useState, useCallback } from "react";

export function useDragAndDrop(onCardMove) {
  const [draggedCardId, setDraggedCardId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const handleDragStart = useCallback((e, cardId) => {
    setDraggedCardId(cardId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", cardId);
    const target = e.currentTarget;
    requestAnimationFrame(() => {
      target?.classList.add("dragging");
    });
  }, []);

  const handleDragEnd = useCallback((e) => {
    e.currentTarget?.classList.remove("dragging");
    setDraggedCardId(null);
    setDragOverColumn(null);
  }, []);

  const handleDragOver = useCallback((e, columnName) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn((prev) => (prev === columnName ? prev : columnName));
  }, []);

  const handleDragLeave = useCallback((e) => {
    if (e.currentTarget && e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) {
      return;
    }
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    (e, targetColumn) => {
      e.preventDefault();
      const cardId = e.dataTransfer.getData("text/plain") || draggedCardId;
      if (cardId && onCardMove) {
        onCardMove(cardId, targetColumn);
      }
      setDraggedCardId(null);
      setDragOverColumn(null);
    },
    [onCardMove, draggedCardId]
  );

  return {
    draggedCardId,
    dragOverColumn,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
