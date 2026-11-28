# 📚 LMS 과제 칸반 보드 (OSS Team 2)

> 오픈소스 [`leriuz/react-kanban-board`](https://github.com/leriuz/react-kanban-board) (MIT License)를 기반으로, 여러 과목의 LMS 과제를 한 화면에서 마감일·진행 상태·제출 여부 중심으로 관리할 수 있도록 확장한 React 웹 애플리케이션입니다.

## 배포 및 팀 정보

- **팀명**: 오픈소스 스튜디오 02분반 2조 (**차원준**, **신태현**)
- **GitHub 저장소**: https://github.com/OSSTeam2/-original-react-kanban-board
- **Vercel 배포 URL**: *(main 병합 및 배포 확인 후 공개 `.vercel.app` URL 최종 기입)*

---

## MVP 기능 구성 (13~14주차)

| 구분 | 기능명 | 13주차 (현재) | 14주차 (예정) |
| --- | --- | --- | --- |
| **F1 (기존 핵심)** | 칸반 보드 기본 기능 | 3컬럼(`시작 전` / `진행 중` / `제출 완료`) 드래그 앤 드롭, 카드 CRUD(삭제 확인 모달 포함), 검색·필터, `localStorage` 영속화 유지 | 유지·개선 |
| **F2 (Open API)** | Canvas LMS REST API 연동 | API 탐색·선정 및 마스킹 테스트 스크립트 준비 ([docs/OPEN_API_TEST.md](docs/OPEN_API_TEST.md)) | 실제 LMS API 연동 완성 |
| **F3 기능 1 (신규)** | **LMS 과제 동기화 및 대시보드 관리** | 과목·마감일(D-Day)·제출 상태 카드 UI, 진행률 요약 바(`LmsSummaryBar`), 과목 필터·마감 임박순 정렬·미제출 토글, **예시 데이터 동기화 시 사용자 배치 위치 보존(`syncLmsCards`)** 구현 | 실제 Canvas API 데이터로 동기화 연결 |
| **F3 기능 2 (신규)** | **제출 완료 이동 제어 및 자동 반영** | 1차 설계 반영 및 상태 모델 준비 | 미제출 카드 `제출 완료` 수동 드래그 잠금·제출 안내 UI + LMS 제출 확인 시 자동 이동 완성 |

---

## 로컬 실행 방법

```bash
git clone https://github.com/OSSTeam2/-original-react-kanban-board.git
cd -original-react-kanban-board
npm install
npm run dev
```

브라우저에서 **http://localhost:5173** 을 열면 공개 시연용 가상 예시 데이터(Demo Mode)로 바로 동작을 확인할 수 있습니다.

### 주요 스크립트

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | Vite 개발 서버 실행 |
| `npm run build` | 프로덕션 번들 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과 로컬 미리보기 |
| `npm run api:test` | Canvas LMS REST API 호출 및 자동 마스킹 테스트 (로컬 `.env.local` 필요) |

---

## Canvas LMS Open API 테스트 (보안 주의)

- 실제 액세스 토큰, 학번, 개인 과제 데이터는 절대 저장소에 커밋하지 않습니다.
- 프로젝트 루트에 `.env.local` 파일을 직접 생성해(`CANVAS_BASE_URL`, `CANVAS_API_TOKEN` 입력) 로컬에서만 테스트하고, 자동 마스킹된 출력 결과만 [docs/OPEN_API_TEST.md](docs/OPEN_API_TEST.md)에 기록합니다.

---

## 프로젝트 구조

```text
├── docs/
│   └── OPEN_API_TEST.md        # Canvas LMS Open API 선정 및 마스킹 호출 테스트 기록
├── scripts/
│   └── test-canvas-api.mjs     # 민감정보 자동 마스킹 API 호출 테스트 스크립트
├── src/
│   ├── components/
│   │   ├── Board.jsx           # 3컬럼 칸반 보드 레이아웃
│   │   ├── Column.jsx          # 드롭 대상 컬럼 (시작 전 / 진행 중 / 제출 완료)
│   │   ├── Card.jsx            # 과목·마감일 D-Day·제출 상태가 표시되는 과제 카드
│   │   ├── CardModal.jsx       # 과제 추가/수정 모달 (과목·마감일·링크·제출 여부)
│   │   ├── ConfirmDialog.jsx   # 카드 삭제 및 보드 초기화 확인 모달
│   │   ├── FilterBar.jsx       # 검색 + 과목/라벨/우선순위/미제출/마감임박 필터 + 정렬
│   │   └── LmsSummaryBar.jsx   # 전체/미제출/마감임박/제출률 요약 및 동기화 결과 배너
│   ├── hooks/
│   │   ├── useLocalStorage.js  # 브라우저 LocalStorage 영속화 훅
│   │   └── useDragAndDrop.js   # HTML5 네이티브 DnD 로직 훅
│   ├── utils/
│   │   ├── data.js             # 3컬럼 정의, D-Day 계산, 가상 예시 LMS 데이터
│   │   └── lmsSync.js          # 재동기화 위치 보존 병합 로직 및 Canvas API 매핑 어댑터
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## License

MIT License (원본 오픈소스: `leriuz/react-kanban-board`)
