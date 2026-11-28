import Card from "./Card";
import { COLUMN_META } from "../utils/data";

export default function Column({
  name,
  cards,
  isDropTarget,
  draggedCardId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onAddCard,
  onEditCard,
  onDeleteCard,
}) {
  const meta = COLUMN_META[name] || {
    accent: "#64748b",
    emptyText: "등록된 카드가 없습니다.",
  };

  return (
    <section
      className={`column ${isDropTarget ? "drop-target" : ""}`}
      onDragOver={(e) => onDragOver(e, name)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, name)}
      role="list"
      aria-label={`${name} 컬럼, ${cards.length}개 과제`}
    >
      <div className="column-header">
        <div className="column-title-wrap">
          <span className="column-dot" style={{ background: meta.accent }} />
          <h2 className="column-title">{name}</h2>
        </div>
        <span className="column-count">{cards.length}</span>
      </div>

      <div className="column-cards">
        {cards.length === 0 ? (
          <div className="column-empty">{meta.emptyText}</div>
        ) : (
          cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              isDragging={card.id === draggedCardId}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))
        )}
      </div>

      <button type="button" className="add-card-btn" onClick={() => onAddCard(name)}>
        + 과제 추가
      </button>
    </section>
  );
}
