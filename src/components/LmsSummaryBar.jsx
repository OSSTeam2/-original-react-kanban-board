import { useMemo } from "react";
import { isUrgentCard } from "../utils/data";

function formatSyncTime(isoString) {
  if (!isoString) return "아직 동기화 전 (초기 예시 데이터)";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "동기화 기록 없음";
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function LmsSummaryBar({
  cards,
  lastSyncedAt,
  syncFeedback,
  isUrgentFilterActive,
  onToggleUrgentFilter,
  onDismissFeedback,
}) {
  const stats = useMemo(() => {
    const total = cards.length;
    const submittedCount = cards.filter((c) => c.submitted || c.column === "제출 완료").length;
    const unsubmittedCount = total - submittedCount;
    const urgentCount = cards.filter((c) => isUrgentCard(c)).length;
    const completionRate = total > 0 ? Math.round((submittedCount / total) * 100) : 0;

    return {
      total,
      submittedCount,
      unsubmittedCount,
      urgentCount,
      completionRate,
    };
  }, [cards]);

  return (
    <section className="summary-section" aria-label="LMS 과제 진행 요약">
      <div className="summary-grid">
        <div className="summary-card">
          <span className="summary-label">전체 과제</span>
          <strong className="summary-value">{stats.total}개</strong>
          <span className="summary-sub">최근 동기화: {formatSyncTime(lastSyncedAt)}</span>
        </div>

        <div className="summary-card">
          <span className="summary-label">미제출 과제</span>
          <strong className="summary-value summary-value--warn">
            {stats.unsubmittedCount}개
          </strong>
          <span className="summary-sub">시작 전 · 진행 중 합계</span>
        </div>

        <button
          type="button"
          className={`summary-card summary-card--interactive ${
            isUrgentFilterActive ? "summary-card--active" : ""
          }`}
          onClick={onToggleUrgentFilter}
          title="마감 임박 및 초과 과제만 필터링"
        >
          <span className="summary-label">마감 임박 / 초과</span>
          <strong className="summary-value summary-value--danger">{stats.urgentCount}개</strong>
          <span className="summary-sub">
            {isUrgentFilterActive ? "임박 필터 적용 중 (클릭해 해제)" : "클릭해 임박 과제만 보기"}
          </span>
        </button>

        <div className="summary-card summary-card--progress">
          <div className="summary-progress-header">
            <span className="summary-label">전체 제출률</span>
            <strong className="summary-rate">{stats.completionRate}%</strong>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={stats.completionRate}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="전체 과제 제출률"
          >
            <div
              className="progress-fill"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <span className="summary-sub">
            제출 완료 {stats.submittedCount} / {stats.total}개
          </span>
        </div>
      </div>

      {syncFeedback && (
        <div className="sync-banner" role="status">
          <div className="sync-banner__text">
            <strong>LMS 예시 동기화 완료</strong>
            <span>
              신규 +{syncFeedback.added}건 · 갱신 {syncFeedback.updated}건 · 사용자 위치 보존{" "}
              {syncFeedback.preserved}건
              {syncFeedback.autoCompleted > 0
                ? ` · 제출 완료 자동 반영 ${syncFeedback.autoCompleted}건`
                : ""}
            </span>
          </div>
          <button
            type="button"
            className="sync-banner__close"
            onClick={onDismissFeedback}
            aria-label="동기화 안내 닫기"
          >
            ×
          </button>
        </div>
      )}
    </section>
  );
}
