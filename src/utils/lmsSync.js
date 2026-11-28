import { createCard, DEFAULT_COLUMNS } from "./data.js";

/**
 * LMS 과제 동기화 핵심 모듈 (F3 기능 1)
 * - 동일한 lmsId를 가진 기존 카드는 제목/설명/과목/마감일/제출 여부를 최신화한다.
 * - 미제출 과제의 경우 사용자가 localStorage에 옮겨 둔 위치("시작 전" 또는 "진행 중")를 그대로 보존한다.
 * - LMS에서 submitted=true가 확인된 과제는 "제출 완료" 컬럼으로 자동 이동한다.
 * - 사용자가 직접 추가한 카드(source === "manual")는 동기화 시 손실 없이 유지한다.
 */
export function syncLmsCards(existingCards, incomingLmsItems) {
  const existingByLmsId = new Map();
  existingCards.forEach((card) => {
    if (card.lmsId) {
      existingByLmsId.set(card.lmsId, card);
    }
  });

  const handledLmsIds = new Set();
  const stats = {
    added: 0,
    updated: 0,
    preserved: 0,
    autoCompleted: 0,
    totalIncoming: incomingLmsItems.length,
  };

  const mergedIncoming = incomingLmsItems.map((incoming) => {
    const existing = incoming.lmsId ? existingByLmsId.get(incoming.lmsId) : null;

    if (!existing) {
      stats.added += 1;
      return createCard({
        ...incoming,
        source: "lms",
        column: incoming.submitted ? "제출 완료" : incoming.column || "시작 전",
      });
    }

    handledLmsIds.add(existing.lmsId);
    stats.updated += 1;

    let nextColumn = existing.column;
    if (incoming.submitted) {
      if (existing.column !== "제출 완료") {
        stats.autoCompleted += 1;
      }
      nextColumn = "제출 완료";
    } else {
      // 사용자가 "시작 전" ↔ "진행 중"으로 배치한 컬럼 위치를 재동기화 시 보존
      if (existing.column === "시작 전" || existing.column === "진행 중") {
        nextColumn = existing.column;
        stats.preserved += 1;
      } else {
        nextColumn = DEFAULT_COLUMNS.includes(incoming.column) ? incoming.column : "시작 전";
      }
    }

    return {
      ...existing,
      title: incoming.title ?? existing.title,
      description: incoming.description ?? existing.description,
      course: incoming.course ?? existing.course,
      dueDate: incoming.dueDate ?? existing.dueDate,
      lmsUrl: incoming.lmsUrl ?? existing.lmsUrl,
      labels: incoming.labels?.length ? incoming.labels : existing.labels,
      priority: incoming.priority ?? existing.priority,
      submitted: Boolean(incoming.submitted),
      source: "lms",
      column: nextColumn,
    };
  });

  // 수동 추가 카드 및 이번 응답에 없는 기존 카드 보존
  const untouchedCards = existingCards.filter(
    (card) => !card.lmsId || !handledLmsIds.has(card.lmsId)
  );

  return {
    cards: [...mergedIncoming, ...untouchedCards],
    stats,
  };
}

/**
 * 14주차 F2(Canvas LMS REST API) 연동을 위한 표준 매핑 어댑터
 * GET /api/v1/courses/:course_id/assignments?include[]=submission 응답 객체를
 * syncLmsCards 입력 포맷으로 정규화한다.
 */
export function mapCanvasAssignmentToLmsItem(course, assignment) {
  const workflowState = assignment?.submission?.workflow_state || "unsubmitted";
  const isSubmitted =
    workflowState === "submitted" ||
    workflowState === "graded" ||
    workflowState === "pending_review";

  return {
    lmsId: `canvas-${course?.id ?? "unknown"}-${assignment?.id ?? "unknown"}`,
    title: assignment?.name || "제목 없는 과제",
    description: assignment?.description
      ? assignment.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 140)
      : "",
    course: course?.name || "미분류 과목",
    dueDate: assignment?.due_at || "",
    submitted: isSubmitted,
    lmsUrl: assignment?.html_url || "",
    source: "lms",
    labels: ["과제"],
    priority: isSubmitted ? "low" : "medium",
  };
}
