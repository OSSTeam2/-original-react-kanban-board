import { useState, useMemo, useCallback } from "react";
import Board from "./components/Board";
import FilterBar from "./components/FilterBar";
import CardModal from "./components/CardModal";
import LmsSummaryBar from "./components/LmsSummaryBar";
import ConfirmDialog from "./components/ConfirmDialog";
import { useLocalStorage } from "./hooks/useLocalStorage";
import {
  getDefaultBoard,
  getDemoSyncPayload,
  createCard,
  COURSES,
  PRIORITY_ORDER,
  isUrgentCard,
} from "./utils/data";
import { syncLmsCards } from "./utils/lmsSync";

const INITIAL_FILTERS = {
  search: "",
  course: "all",
  labels: [],
  priority: [],
  onlyUnsubmitted: false,
  onlyUrgent: false,
  sortBy: "dueDate",
};

export default function App() {
  const [board, setBoard, resetBoard] = useLocalStorage("lms-kanban-board-v1", getDefaultBoard);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [modal, setModal] = useState(null); // { mode: "add" | "edit", column?, card? }
  const [confirmState, setConfirmState] = useState(null);
  const [syncFeedback, setSyncFeedback] = useState(null);

  // ── Available courses (default + user-added) ───────────────
  const availableCourses = useMemo(() => {
    const set = new Set(COURSES);
    board.cards.forEach((card) => {
      if (card.course) set.add(card.course);
    });
    return Array.from(set);
  }, [board.cards]);

  // ── Filtering & Sorting (F1 + F3) ──────────────────────────
  const filteredCards = useMemo(() => {
    const matched = board.cards.filter((card) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const inTitle = card.title.toLowerCase().includes(q);
        const inDesc = (card.description || "").toLowerCase().includes(q);
        const inCourse = (card.course || "").toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inCourse) {
          return false;
        }
      }
      if (filters.course && filters.course !== "all") {
        if (card.course !== filters.course) {
          return false;
        }
      }
      if (filters.onlyUnsubmitted && (card.submitted || card.column === "제출 완료")) {
        return false;
      }
      if (filters.onlyUrgent && !isUrgentCard(card)) {
        return false;
      }
      if (filters.labels?.length > 0) {
        if (!card.labels.some((l) => filters.labels.includes(l))) {
          return false;
        }
      }
      if (filters.priority?.length > 0) {
        if (!filters.priority.includes(card.priority)) {
          return false;
        }
      }
      return true;
    });

    return [...matched].sort((a, b) => {
      if (filters.sortBy === "priority") {
        const diff = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
        if (diff !== 0) return diff;
      }
      if (filters.sortBy === "createdAt") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      // 기본 정렬: 마감 임박순 (마감일 없는 항목은 뒤로 배치)
      const timeA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const timeB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return timeA - timeB;
    });
  }, [board.cards, filters]);

  // ── Card operations ────────────────────────────────────────
  const handleCardMove = useCallback(
    (cardId, targetColumn) => {
      setBoard((prev) => ({
        ...prev,
        cards: prev.cards.map((c) =>
          c.id === cardId
            ? {
                ...c,
                column: targetColumn,
                submitted: targetColumn === "제출 완료",
              }
            : c
        ),
      }));
    },
    [setBoard]
  );

  const handleAddCard = useCallback((column) => {
    setModal({ mode: "add", column });
  }, []);

  const handleEditCard = useCallback((card) => {
    setModal({ mode: "edit", card });
  }, []);

  const handleDeleteCard = useCallback(
    (cardId) => {
      setBoard((prev) => ({
        ...prev,
        cards: prev.cards.filter((c) => c.id !== cardId),
      }));
    },
    [setBoard]
  );

  const handleRequestDelete = useCallback(
    (card) => {
      setConfirmState({
        title: "과제 카드 삭제",
        message: `"${card.title}" 과제를 보드에서 삭제하시겠습니까?`,
        confirmText: "삭제",
        onConfirm: () => {
          handleDeleteCard(card.id);
          setConfirmState(null);
        },
      });
    },
    [handleDeleteCard]
  );

  const handleSaveCard = useCallback(
    (cardData) => {
      setBoard((prev) => {
        if (cardData.id) {
          return {
            ...prev,
            cards: prev.cards.map((c) => (c.id === cardData.id ? { ...c, ...cardData } : c)),
          };
        }
        return {
          ...prev,
          cards: [...prev.cards, createCard(cardData)],
        };
      });
    },
    [setBoard]
  );

  // ── F3 기능 1: LMS 과제 예시 동기화 (사용자 배치 위치 보존) ───
  const handleDemoSync = useCallback(() => {
    const nextStep = (board.syncStep || 0) + 1;
    const incomingItems = getDemoSyncPayload(nextStep);
    const { cards: syncedCards, stats } = syncLmsCards(board.cards, incomingItems);
    const syncedAt = new Date().toISOString();

    setBoard((prev) => ({
      ...prev,
      cards: syncedCards,
      lastSyncedAt: syncedAt,
      syncStep: nextStep,
    }));
    setSyncFeedback({ ...stats, syncedAt });
  }, [board.cards, board.syncStep, setBoard]);

  const handleRequestReset = useCallback(() => {
    setConfirmState({
      title: "보드 초기화",
      message: "모든 변경 사항을 되돌리고 초기 예시 과제 보드로 복원할까요?",
      confirmText: "초기화",
      onConfirm: () => {
        resetBoard();
        setFilters(INITIAL_FILTERS);
        setSyncFeedback(null);
        setConfirmState(null);
      },
    });
  }, [resetBoard]);

  const handleToggleUrgentFilter = useCallback(() => {
    setFilters((prev) => ({ ...prev, onlyUrgent: !prev.onlyUrgent }));
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title-group">
          <h1>📚 LMS 과제 칸반 보드</h1>
          <span className="demo-badge" title="공개 배포용 가상 예시 데이터 모드">
            Demo Mode · 예시 데이터
          </span>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-sync"
            onClick={handleDemoSync}
            title="예시 LMS 과제를 동기화하며 기존 시작 전/진행 중 위치를 보존합니다"
          >
            🔄 LMS 예시 동기화
          </button>
          <button
            type="button"
            className="btn-reset"
            onClick={handleRequestReset}
            title="보드를 초기 예시 상태로 되돌립니다"
          >
            보드 초기화
          </button>
        </div>
      </header>

      <LmsSummaryBar
        cards={board.cards}
        lastSyncedAt={board.lastSyncedAt}
        syncFeedback={syncFeedback}
        isUrgentFilterActive={filters.onlyUrgent}
        onToggleUrgentFilter={handleToggleUrgentFilter}
        onDismissFeedback={() => setSyncFeedback(null)}
      />

      <FilterBar
        filters={filters}
        courses={availableCourses}
        onFilterChange={setFilters}
        totalCount={board.cards.length}
        filteredCount={filteredCards.length}
      />

      <Board
        columns={board.columns}
        cards={filteredCards}
        onCardMove={handleCardMove}
        onAddCard={handleAddCard}
        onEditCard={handleEditCard}
        onDeleteCard={handleRequestDelete}
      />

      {modal && (
        <CardModal
          card={modal.mode === "edit" ? modal.card : null}
          column={modal.column}
          courses={availableCourses}
          onSave={handleSaveCard}
          onClose={() => setModal(null)}
        />
      )}

      {confirmState && (
        <ConfirmDialog
          title={confirmState.title}
          message={confirmState.message}
          confirmText={confirmState.confirmText}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
}
