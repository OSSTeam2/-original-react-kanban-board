# F2. Open API 탐색·선정 및 호출 테스트 기록 (Canvas LMS REST API)

> **보안 및 개인정보 보호 원칙**
> - 개인 액세스 토큰(`CANVAS_API_TOKEN`), 실제 학번, 사용자 ID, 실제 수강 과목명, 실제 과제명·제출물은 **절대 저장소나 문서에 공개하지 않습니다.**
> - 모든 테스트 출력은 [scripts/test-canvas-api.mjs](../scripts/test-canvas-api.mjs)를 통해 자동 마스킹된 형태만 기록합니다.

---

## 1. Open API 선정 요약

| 항목 | 내용 |
| --- | --- |
| 선정 API | **Canvas LMS REST API (v1)** |
| 공식 문서 | https://canvas.instructure.com/doc/api/ |
| 선정 이유 | 한동대 LMS가 Canvas 기반이므로 수강 과목·과제 마감일·제출 상태(`submission.workflow_state`)를 표준 REST JSON으로 직접 조회할 수 있음. |
| 인증 방식 | `Authorization: Bearer <PERSONAL_ACCESS_TOKEN>` (로컬 `.env.local` 관리, 공개 Vercel 배포에서는 예시 데이터 모드 사용) |
| 핵심 엔드포인트 | 1) `GET /api/v1/courses?enrollment_state=active`<br>2) `GET /api/v1/courses/:course_id/assignments?include[]=submission` |
| 카드 데이터 매핑 | `course.name` → `course`, `assignment.name` → `title`, `assignment.due_at` → `dueDate`, `submission.workflow_state` → `submitted`, `assignment.html_url` → `lmsUrl` ([lmsSync.js](../src/utils/lmsSync.js)) |

---

## 2. 로컬 테스트 실행 방법 (두 팀원 공통)

```bash
cp .env.example .env.local
# .env.local 파일에 CANVAS_BASE_URL 및 본인의 CANVAS_API_TOKEN 입력 (.gitignore 처리됨)

npm run api:test
```

출력된 마스킹 결과를 아래 본인 섹션에 붙여 넣습니다.

---

## 3. 팀원별 실제 호출 테스트 기록

### 3.1 신태현 테스트 결과 (작성 예정)

- **테스트 일시**: *(실행 후 기입)*
- **테스트 환경**: Node.js `fetch` (`scripts/test-canvas-api.mjs`)

#### 요청 1: 수강 과목 목록 조회
```http
GET https://lms.handong.edu/api/v1/courses?enrollment_state=active&per_page=5
Authorization: Bearer <REDACTED_TOKEN>
Accept: application/json
```
- **HTTP 상태**: *(예: `200 OK` — 실제 호출 후 기입)*
- **마스킹된 응답 JSON 예시**:
```json
[
  {
    "id": "<COURSE_ID_1>",
    "name": "<MASKED_COURSE_NAME_1>",
    "course_code": "<MASKED_COURSE_CODE_1>",
    "enrollment_term_id": "<TERM_ID>",
    "workflow_state": "available"
  }
]
```

#### 요청 2: 과목별 과제 및 제출 상태 조회
```http
GET https://lms.handong.edu/api/v1/courses/<COURSE_ID_1>/assignments?include[]=submission&per_page=5
Authorization: Bearer <REDACTED_TOKEN>
Accept: application/json
```
- **HTTP 상태**: *(예: `200 OK` — 실제 호출 후 기입)*
- **마스킹된 응답 JSON 예시**:
```json
[
  {
    "id": "<ASSIGNMENT_ID_1>",
    "course_id": "<COURSE_ID_1>",
    "name": "<MASKED_ASSIGNMENT_TITLE_1>",
    "due_at": "<ISO_DUE_DATE_MASKED>",
    "points_possible": 100,
    "published": true,
    "html_url": "https://<LMS_HOST>/courses/<COURSE_ID_1>/assignments/<ASSIGNMENT_ID>",
    "submission": {
      "workflow_state": "submitted",
      "submitted_at": "<ISO_SUBMITTED_AT_MASKED>",
      "late": false,
      "missing": false
    }
  }
]
```

---

### 3.2 차원준 테스트 결과 (작성 예정)

- **테스트 일시**: *(실행 후 기입)*
- **테스트 환경**: Node.js `fetch` (`scripts/test-canvas-api.mjs`) 또는 개인 검증 환경

#### 요청 1: 수강 과목 목록 조회
```http
GET https://lms.handong.edu/api/v1/courses?enrollment_state=active&per_page=5
Authorization: Bearer <REDACTED_TOKEN>
Accept: application/json
```
- **HTTP 상태**: *(실제 호출 후 기입)*
- **마스킹된 응답 JSON 예시**:
```json
[]
```

#### 요청 2: 과목별 과제 및 제출 상태 조회
```http
GET https://lms.handong.edu/api/v1/courses/<COURSE_ID_1>/assignments?include[]=submission&per_page=5
Authorization: Bearer <REDACTED_TOKEN>
Accept: application/json
```
- **HTTP 상태**: *(실제 호출 후 기입)*
- **마스킹된 응답 JSON 예시**:
```json
[]
```

---

## 4. 14주차 연동 계획 (F2 완성)

- `src/utils/lmsSync.js`의 `mapCanvasAssignmentToLmsItem`과 `syncLmsCards`를 실제 API 응답과 연결합니다.
- 공개 배포 환경(Vercel)에서는 토큰 없이도 동작을 확인할 수 있는 **Demo Mode(가상 예시 데이터)**를 기본 제공하고, 로컬/프록시 환경에서 개인 Canvas 토큰 연동을 지원합니다.
