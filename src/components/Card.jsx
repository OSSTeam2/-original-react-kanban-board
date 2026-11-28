import {
  LABEL_COLORS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  getCourseColor,
  getDueStatus,
} from "../utils/data";

function isSafeHttpUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export default function Card({ card, onDragStart, onDragEnd, onEdit, onDelete, isDragging }) {
  const courseColor = getCourseColor(card.course);
  const dueStatus = getDueStatus(card.dueDate, card.submitted);

  return (
    <article
      className={`card card--${dueStatus.urgency} ${isDragging ? "dragging" : ""}`}
      draggable
      onDragStart={(e) => onDragStart(e, card.id)}
      onDragEnd={onDragEnd}
      tabIndex={0}
      role="listitem"
      aria-label={`${card.course} ${card.title}, 마감 상태 ${dueStatus.label}`}
    >
      <div className="card-top">
        <div className="card-top-left">
          <span
            className="card-course"
            style={{
              background: `${courseColor}22`,
              color: courseColor,
              borderColor: `${courseColor}55`,
            }}
          >
            {card.course || "기타 과목"}
          </span>
          <span
            className="card-priority"
            style={{ background: PRIORITY_COLORS[card.priority] }}
            title={`우선순위: ${PRIORITY_LABELS[card.priority] || card.priority}`}
          />
        </div>

        <div className="card-actions">
          <button
            type="button"
            className="card-btn"
            onClick={() => onEdit(card)}
            title="과제 수정"
            aria-label="과제 수정"
          >
            ✏️
          </button>
          <button
            type="button"
            className="card-btn"
            onClick={() => onDelete(card)}
            title="과제 삭제"
            aria-label="과제 삭제"
          >
            🗑
          </button>
        </div>
      </div>

      <h3 className="card-title">{card.title}</h3>

      {card.description && <p className="card-desc">{card.description}</p>}

      <div className="card-lms-meta">
        <span className="card-due-date" title={card.dueDate || "마감일 미정"}>
          🕒 {dueStatus.formattedDate}
        </span>
        <span className={`due-pill due-pill--${dueStatus.urgency}`}>{dueStatus.label}</span>
      </div>

      <div className="card-footer">
        <div className="card-labels">
          {card.labels.map((label) => (
            <span
              key={label}
              className="card-label"
              style={{
                background: `${LABEL_COLORS[label] || "#64748b"}28`,
                color: LABEL_COLORS[label] || "#cbd5e1",
              }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="card-badges-right">
          <span className={`source-tag source-tag--${card.source || "manual"}`}>
            {card.source === "lms" ? "LMS" : "직접 추가"}
          </span>
          {isSafeHttpUrl(card.lmsUrl) && (
            <a
              href={card.lmsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card-lms-link"
              onClick={(e) => e.stopPropagation()}
              title="LMS 과제 페이지 열기"
            >
              열기 ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
