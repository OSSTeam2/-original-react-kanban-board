export const DEFAULT_COLUMNS = ["시작 전", "진행 중", "제출 완료"];

export const COLUMN_META = {
  "시작 전": {
    accent: "#64748b",
    emptyText: "시작 전 상태인 과제가 없습니다.",
  },
  "진행 중": {
    accent: "#f59e0b",
    emptyText: "작업 중인 과제를 이 컬럼으로 드래그하세요.",
  },
  "제출 완료": {
    accent: "#22c55e",
    emptyText: "제출 완료된 과제가 여기에 표시됩니다.",
  },
};

export const COURSES = [
  "오픈소스 스튜디오",
  "데이터구조",
  "운영체제",
  "컴퓨터네트워크",
  "알고리즘",
];

export const COURSE_COLORS = {
  "오픈소스 스튜디오": "#58a6ff",
  데이터구조: "#a855f7",
  운영체제: "#f97316",
  컴퓨터네트워크: "#06b6d4",
  알고리즘: "#ec4899",
};

const FALLBACK_COURSE_PALETTE = [
  "#58a6ff",
  "#a855f7",
  "#f97316",
  "#06b6d4",
  "#ec4899",
  "#10b981",
  "#eab308",
];

export function getCourseColor(course = "") {
  if (COURSE_COLORS[course]) return COURSE_COLORS[course];
  let hash = 0;
  for (let i = 0; i < course.length; i += 1) {
    hash = (hash * 31 + course.charCodeAt(i)) % FALLBACK_COURSE_PALETTE.length;
  }
  return FALLBACK_COURSE_PALETTE[Math.abs(hash) % FALLBACK_COURSE_PALETTE.length];
}

export const LABELS = ["과제", "팀프로젝트", "퀴즈", "실습", "발표"];

export const LABEL_COLORS = {
  과제: "#8b5cf6",
  팀프로젝트: "#3b82f6",
  퀴즈: "#ef4444",
  실습: "#06b6d4",
  발표: "#22c55e",
};

export const PRIORITIES = ["low", "medium", "high", "urgent"];

export const PRIORITY_LABELS = {
  low: "낮음",
  medium: "보통",
  high: "높음",
  urgent: "긴급",
};

export const PRIORITY_ORDER = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const PRIORITY_COLORS = {
  low: "#6b7280",
  medium: "#3b82f6",
  high: "#f59e0b",
  urgent: "#ef4444",
};

export const SORT_OPTIONS = [
  { id: "dueDate", label: "마감 임박순" },
  { id: "priority", label: "우선순위순" },
  { id: "createdAt", label: "최근 생성순" },
];

let _idCounter = Date.now();

export function generateId() {
  return `card-${_idCounter++}`;
}

export function createCard({
  id,
  lmsId = null,
  title,
  description = "",
  course = "오픈소스 스튜디오",
  dueDate = "",
  submitted,
  lmsUrl = "",
  source = "manual",
  column = "시작 전",
  labels = [],
  priority = "medium",
  createdAt,
}) {
  const normalizedColumn = DEFAULT_COLUMNS.includes(column) ? column : "시작 전";
  const isSubmitted =
    typeof submitted === "boolean" ? submitted : normalizedColumn === "제출 완료";

  return {
    id: id || generateId(),
    lmsId,
    title,
    description,
    course: course || "기타 과목",
    dueDate,
    submitted: isSubmitted,
    lmsUrl,
    source,
    column: isSubmitted ? "제출 완료" : normalizedColumn,
    labels,
    priority,
    createdAt: createdAt || new Date().toISOString(),
  };
}

function relativeDueIso(daysOffset, hour = 23, minute = 59) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function formatDueDate(isoString) {
  if (!isoString) return "마감일 미정";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "마감일 미정";
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAYS[date.getDay()];
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${month}/${day}(${weekday}) ${hh}:${mm}`;
}

export function getDueStatus(dueDate, submitted = false) {
  const formattedDate = formatDueDate(dueDate);
  if (submitted) {
    return {
      label: "제출 완료",
      urgency: "submitted",
      diffHours: Infinity,
      formattedDate,
    };
  }
  if (!dueDate) {
    return {
      label: "마감 미정",
      urgency: "none",
      diffHours: Infinity,
      formattedDate,
    };
  }

  const dueMs = new Date(dueDate).getTime();
  if (Number.isNaN(dueMs)) {
    return {
      label: "마감 미정",
      urgency: "none",
      diffHours: Infinity,
      formattedDate: "마감일 미정",
    };
  }

  const diffMs = dueMs - Date.now();
  const diffHours = diffMs / 3600000;

  if (diffMs < 0) {
    const overdueHours = Math.abs(Math.floor(diffHours));
    return {
      label: overdueHours >= 24 ? `마감 초과 (+${Math.floor(overdueHours / 24)}일)` : "마감 초과",
      urgency: "overdue",
      diffHours,
      formattedDate,
    };
  }

  if (diffHours <= 24) {
    const remainHours = Math.max(1, Math.ceil(diffHours));
    return {
      label: `D-Day (${remainHours}h)`,
      urgency: "urgent",
      diffHours,
      formattedDate,
    };
  }

  if (diffHours <= 48) {
    return {
      label: `D-1 (${Math.ceil(diffHours)}h)`,
      urgency: "soon",
      diffHours,
      formattedDate,
    };
  }

  const remainDays = Math.ceil(diffHours / 24);
  return {
    label: `D-${remainDays}`,
    urgency: remainDays <= 3 ? "soon" : "normal",
    diffHours,
    formattedDate,
  };
}

export function isUrgentCard(card) {
  if (card.submitted) return false;
  const status = getDueStatus(card.dueDate, card.submitted);
  return status.urgency === "overdue" || status.urgency === "urgent" || status.urgency === "soon";
}

export function toDateTimeLocalValue(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function fromDateTimeLocalValue(localValue) {
  if (!localValue) return "";
  const date = new Date(localValue);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export function getDemoLmsItems() {
  return [
    {
      lmsId: "demo-101",
      title: "[예시] MVP 설계 및 기본 기능 PR 제출",
      description: "팀 저장소 PR 상호 리뷰 후 main 병합 및 Vercel 배포 URL 확인",
      course: "오픈소스 스튜디오",
      dueDate: relativeDueIso(1, 23, 59),
      submitted: false,
      lmsUrl: "",
      source: "lms",
      column: "진행 중",
      labels: ["팀프로젝트", "과제"],
      priority: "urgent",
    },
    {
      lmsId: "demo-102",
      title: "[예시] Canvas REST API 호출 테스트 정리",
      description: "요청 URL, HTTP 상태코드, 민감정보가 마스킹된 JSON 응답 예시 작성",
      course: "오픈소스 스튜디오",
      dueDate: relativeDueIso(2, 23, 59),
      submitted: false,
      lmsUrl: "",
      source: "lms",
      column: "시작 전",
      labels: ["실습", "팀프로젝트"],
      priority: "high",
    },
    {
      lmsId: "demo-103",
      title: "[예시] 균형 이진 탐색 트리(AVL) 구현",
      description: "회전 연산 단위 테스트 통과 후 소스코드 및 결과 보고서 제출",
      course: "데이터구조",
      dueDate: relativeDueIso(0, 23, 59),
      submitted: false,
      lmsUrl: "",
      source: "lms",
      column: "진행 중",
      labels: ["과제", "실습"],
      priority: "urgent",
    },
    {
      lmsId: "demo-104",
      title: "[예시] 가상 메모리 페이지 교체 정책 퀴즈",
      description: "LRU / FIFO / Clock 알고리즘 비교 10문항 온라인 퀴즈",
      course: "운영체제",
      dueDate: relativeDueIso(-1, 18, 0),
      submitted: false,
      lmsUrl: "",
      source: "lms",
      column: "시작 전",
      labels: ["퀴즈"],
      priority: "high",
    },
    {
      lmsId: "demo-105",
      title: "[예시] TCP 혼잡 제어 시뮬레이션 분석",
      description: "Wireshark 패킷 캡처 분석표 작성 및 그래프 첨부",
      course: "컴퓨터네트워크",
      dueDate: relativeDueIso(4, 23, 59),
      submitted: false,
      lmsUrl: "",
      source: "lms",
      column: "시작 전",
      labels: ["실습"],
      priority: "medium",
    },
    {
      lmsId: "demo-106",
      title: "[예시] 동적 계획법(DP) 문제 풀이 5선",
      description: "점화식 유도 과정과 시간복잡도 분석 포함",
      course: "알고리즘",
      dueDate: relativeDueIso(6, 23, 59),
      submitted: false,
      lmsUrl: "",
      source: "lms",
      column: "시작 전",
      labels: ["과제"],
      priority: "low",
    },
    {
      lmsId: "demo-107",
      title: "[예시] 1차 오픈소스 탐색 및 선정 보고서",
      description: "후보 오픈소스 비교 및 LMS 칸반 보드 프로젝트 최종 선정 완료",
      course: "오픈소스 스튜디오",
      dueDate: relativeDueIso(-3, 23, 59),
      submitted: true,
      lmsUrl: "",
      source: "lms",
      column: "제출 완료",
      labels: ["팀프로젝트", "발표"],
      priority: "medium",
    },
  ];
}

export function getDemoSyncPayload(syncStep = 1) {
  const base = getDemoLmsItems().map((item) => ({ ...item }));

  // 재동기화 시 기존 과제 상태 변경 시뮬레이션 (제출 완료 자동 반영 + 마감일 갱신)
  const avlIndex = base.findIndex((item) => item.lmsId === "demo-103");
  if (avlIndex !== -1) {
    base[avlIndex] = {
      ...base[avlIndex],
      submitted: true,
      description: "LMS 제출 확인 완료 (재동기화를 통해 제출 완료 컬럼으로 자동 반영됨)",
    };
  }

  const apiIndex = base.findIndex((item) => item.lmsId === "demo-102");
  if (apiIndex !== -1) {
    base[apiIndex] = {
      ...base[apiIndex],
      description:
        "요청 URL, HTTP 상태코드, 민감정보 마스킹 JSON 예시 작성 (재동기화로 안내 문구 갱신됨)",
    };
  }

  // 1차 이상 동기화: 신규 LMS 과제 추가
  base.push({
    lmsId: "demo-108",
    title: "[예시·신규] 14주차 멘토 피드백 반영 체크리스트",
    description: "LMS 재동기화로 새로 수집된 가상 과제 예시 (기존 카드 위치는 그대로 유지)",
    course: "오픈소스 스튜디오",
    dueDate: relativeDueIso(5, 23, 59),
    submitted: false,
    lmsUrl: "",
    source: "lms",
    labels: ["팀프로젝트"],
    priority: "high",
  });

  if (syncStep >= 2) {
    base.push({
      lmsId: "demo-109",
      title: "[예시·신규] 멀티스레드 동기화 실습 과제",
      description: "Mutex/Semaphore 교착 상태 방지 코드 작성 및 실행 캡처 제출",
      course: "운영체제",
      dueDate: relativeDueIso(3, 23, 59),
      submitted: false,
      lmsUrl: "",
      source: "lms",
      labels: ["실습", "과제"],
      priority: "medium",
    });
  }

  return base;
}

export function getDefaultBoard() {
  return {
    columns: DEFAULT_COLUMNS,
    cards: getDemoLmsItems().map((item) => createCard(item)),
    lastSyncedAt: null,
    syncStep: 0,
  };
}
