import {
  LABELS,
  PRIORITIES,
  LABEL_COLORS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  SORT_OPTIONS,
} from "../utils/data";

export default function FilterBar({
  filters,
  courses,
  onFilterChange,
  totalCount,
  filteredCount,
}) {
  const handleSearch = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleCourseChange = (e) => {
    onFilterChange({ ...filters, course: e.target.value });
  };

  const handleSortChange = (e) => {
    onFilterChange({ ...filters, sortBy: e.target.value });
  };

  const toggleUnsubmitted = () => {
    onFilterChange({ ...filters, onlyUnsubmitted: !filters.onlyUnsubmitted });
  };

  const toggleUrgent = () => {
    onFilterChange({ ...filters, onlyUrgent: !filters.onlyUrgent });
  };

  const toggleLabel = (label) => {
    const current = filters.labels || [];
    const next = current.includes(label)
      ? current.filter((l) => l !== label)
      : [...current, label];
    onFilterChange({ ...filters, labels: next });
  };

  const togglePriority = (priority) => {
    const current = filters.priority || [];
    const next = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority];
    onFilterChange({ ...filters, priority: next });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      course: "all",
      labels: [],
      priority: [],
      onlyUnsubmitted: false,
      onlyUrgent: false,
      sortBy: "dueDate",
    });
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.course !== "all" ||
    filters.labels?.length > 0 ||
    filters.priority?.length > 0 ||
    filters.onlyUnsubmitted ||
    filters.onlyUrgent ||
    filters.sortBy !== "dueDate";

  return (
    <div className="filter-bar">
      <div className="filter-row">
        <input
          type="text"
          className="filter-search"
          placeholder="과제명, 과목, 설명 검색..."
          value={filters.search || ""}
          onChange={handleSearch}
          aria-label="과제 검색"
        />

        <select
          className="filter-select"
          value={filters.course || "all"}
          onChange={handleCourseChange}
          aria-label="과목 필터"
        >
          <option value="all">전체 과목</option>
          {courses.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.sortBy || "dueDate"}
          onChange={handleSortChange}
          aria-label="정렬 기준"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              정렬: {opt.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className={`filter-toggle ${filters.onlyUnsubmitted ? "active" : ""}`}
          onClick={toggleUnsubmitted}
        >
          미제출만 보기
        </button>

        <button
          type="button"
          className={`filter-toggle filter-toggle--danger ${filters.onlyUrgent ? "active" : ""}`}
          onClick={toggleUrgent}
        >
          마감 임박(48h)
        </button>

        <span className="filter-count">
          {filteredCount} / {totalCount}개 표시
        </span>

        {hasActiveFilters && (
          <button type="button" className="filter-clear" onClick={clearFilters}>
            필터 초기화
          </button>
        )}
      </div>

      <div className="filter-row filter-row--chips">
        <div className="filter-group">
          <span className="filter-label">유형:</span>
          {LABELS.map((label) => (
            <button
              type="button"
              key={label}
              className={`filter-chip ${filters.labels?.includes(label) ? "active" : ""}`}
              style={{ "--chip-color": LABEL_COLORS[label] }}
              onClick={() => toggleLabel(label)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="filter-group">
          <span className="filter-label">우선순위:</span>
          {PRIORITIES.map((p) => (
            <button
              type="button"
              key={p}
              className={`filter-chip ${filters.priority?.includes(p) ? "active" : ""}`}
              style={{ "--chip-color": PRIORITY_COLORS[p] }}
              onClick={() => togglePriority(p)}
            >
              {PRIORITY_LABELS[p]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
