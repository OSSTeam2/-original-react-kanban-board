import { useState, useEffect, useRef } from "react";
import {
  LABELS,
  PRIORITIES,
  LABEL_COLORS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  toDateTimeLocalValue,
  fromDateTimeLocalValue,
} from "../utils/data";

export default function CardModal({ card, column, courses, onSave, onClose }) {
  const isEditing = Boolean(card?.id);
  const titleRef = useRef(null);

  const initialColumn = card?.column || column || "시작 전";

  const [form, setForm] = useState({
    title: card?.title || "",
    course: card?.course || courses[0] || "오픈소스 스튜디오",
    description: card?.description || "",
    dueDateLocal: toDateTimeLocalValue(card?.dueDate || ""),
    submitted: typeof card?.submitted === "boolean" ? card.submitted : initialColumn === "제출 완료",
    lmsUrl: card?.lmsUrl || "",
    labels: card?.labels || [],
    priority: card?.priority || "medium",
  });

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const toggleLabel = (label) => {
    setForm((prev) => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter((l) => l !== label)
        : [...prev.labels, label],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    let nextColumn = initialColumn;
    if (form.submitted) {
      nextColumn = "제출 완료";
    } else if (initialColumn === "제출 완료") {
      nextColumn = "진행 중";
    }

    onSave({
      ...(card || {}),
      title: form.title.trim(),
      course: form.course.trim() || "기타 과목",
      description: form.description.trim(),
      dueDate: fromDateTimeLocalValue(form.dueDateLocal),
      submitted: form.submitted,
      lmsUrl: form.lmsUrl.trim(),
      labels: form.labels,
      priority: form.priority,
      source: card?.source || "manual",
      column: nextColumn,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? "과제 수정" : "새 과제 추가"}
      >
        <div className="modal-header">
          <h2>{isEditing ? "과제 수정" : "새 과제 추가"}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="card-title">과제명 *</label>
            <input
              ref={titleRef}
              id="card-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="예: 13주차 MVP 기본 기능 구현"
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-field">
              <label htmlFor="card-course">과목명</label>
              <input
                id="card-course"
                type="text"
                list="lms-course-list"
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                placeholder="과목 선택 또는 직접 입력"
              />
              <datalist id="lms-course-list">
                {courses.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div className="form-field">
              <label htmlFor="card-due">마감 일시</label>
              <input
                id="card-due"
                type="datetime-local"
                value={form.dueDateLocal}
                onChange={(e) => setForm({ ...form, dueDateLocal: e.target.value })}
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="card-desc">상세 설명</label>
            <textarea
              id="card-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="제출 조건이나 메모를 입력하세요"
              rows={3}
            />
          </div>

          <div className="form-field">
            <label htmlFor="card-url">과제 링크 (선택)</label>
            <input
              id="card-url"
              type="url"
              value={form.lmsUrl}
              onChange={(e) => setForm({ ...form, lmsUrl: e.target.value })}
              placeholder="https://lms.example.edu/courses/..."
            />
          </div>

          <div className="form-field form-checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.submitted}
                onChange={(e) => setForm({ ...form, submitted: e.target.checked })}
              />
              <span>제출 완료 상태 (체크 시 &ldquo;제출 완료&rdquo; 컬럼으로 이동)</span>
            </label>
          </div>

          <div className="form-field">
            <label>유형 라벨</label>
            <div className="chip-group">
              {LABELS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className={`filter-chip ${form.labels.includes(label) ? "active" : ""}`}
                  style={{ "--chip-color": LABEL_COLORS[label] }}
                  onClick={() => toggleLabel(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label>우선순위</label>
            <div className="chip-group">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`filter-chip ${form.priority === p ? "active" : ""}`}
                  style={{ "--chip-color": PRIORITY_COLORS[p] }}
                  onClick={() => setForm({ ...form, priority: p })}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? "저장" : "과제 추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
