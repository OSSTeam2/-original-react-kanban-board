#!/usr/bin/env node
/**
 * Canvas LMS REST API 호출 테스트 및 자동 마스킹 스크립트 (Node 18+ 내장 fetch 사용)
 *
 * 보안 원칙:
 * - 액세스 토큰은 환경변수(CANVAS_API_TOKEN) 또는 .env.local에서만 읽습니다.
 * - 출력 결과에서 실제 토큰, 학번, 사용자 ID, 과목명, 과제명, URL 등 개인/실제 데이터를
 *   자동으로 익명화(마스킹)하여 문서(docs/OPEN_API_TEST.md)에 안전하게 붙여 넣을 수 있습니다.
 *
 * 실행 예시:
 *   CANVAS_BASE_URL=https://lms.handong.edu CANVAS_API_TOKEN=<토큰> npm run api:test
 *   또는 .env.local 작성 후 npm run api:test
 */

import fs from "node:fs";
import path from "node:path";

function loadDotEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    const val = line.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !(key in process.env)) {
      process.env[key] = val;
    }
  }
}

loadDotEnvLocal();

const baseUrl = (process.env.CANVAS_BASE_URL || "https://lms.handong.edu").replace(/\/+$/, "");
const token = process.env.CANVAS_API_TOKEN;

if (!token || token === "your_canvas_personal_access_token_here") {
  console.error(
    [
      "[오류] CANVAS_API_TOKEN이 설정되지 않았습니다.",
      "1) .env.example을 복사해 .env.local 파일을 만든 뒤 실제 토큰을 입력하거나,",
      "2) CANVAS_API_TOKEN=... npm run api:test 형태로 실행해 주세요.",
      "※ .env.local은 .gitignore에 포함되어 있어 Git에 올라가지 않습니다.",
    ].join("\n")
  );
  process.exit(1);
}

async function fetchCanvasJson(endpointPath) {
  const url = `${baseUrl}${endpointPath}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { rawPreview: text.slice(0, 120) };
  }

  return {
    endpointPath,
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    json,
  };
}

function maskCourse(course, index) {
  return {
    id: `<COURSE_ID_${index + 1}>`,
    name: `<MASKED_COURSE_NAME_${index + 1}>`,
    course_code: `<MASKED_COURSE_CODE_${index + 1}>`,
    enrollment_term_id: typeof course.enrollment_term_id === "number" ? "<TERM_ID>" : null,
    workflow_state: course.workflow_state ?? "available",
  };
}

function maskAssignment(assignment, index) {
  return {
    id: `<ASSIGNMENT_ID_${index + 1}>`,
    course_id: "<COURSE_ID_1>",
    name: `<MASKED_ASSIGNMENT_TITLE_${index + 1}>`,
    due_at: assignment.due_at ? "<ISO_DUE_DATE_MASKED>" : null,
    points_possible: typeof assignment.points_possible === "number" ? assignment.points_possible : null,
    published: Boolean(assignment.published),
    html_url: "https://<LMS_HOST>/courses/<COURSE_ID_1>/assignments/<ASSIGNMENT_ID>",
    submission: assignment.submission
      ? {
          workflow_state: assignment.submission.workflow_state ?? "unsubmitted",
          submitted_at: assignment.submission.submitted_at ? "<ISO_SUBMITTED_AT_MASKED>" : null,
          late: Boolean(assignment.submission.late),
          missing: Boolean(assignment.submission.missing),
        }
      : null,
  };
}

async function main() {
  const testedAt = new Date().toISOString();

  // 1) 수강 중 과목 목록 조회
  const coursesEndpoint = "/api/v1/courses?enrollment_state=active&per_page=5";
  const coursesResult = await fetchCanvasJson(coursesEndpoint);

  const rawCourses = Array.isArray(coursesResult.json) ? coursesResult.json : [];
  const maskedCourses = rawCourses.slice(0, 2).map(maskCourse);

  console.log("=== Canvas LMS Open API 호출 테스트 결과 (민감정보 마스킹 완료) ===\n");
  console.log(`테스트 시각 (UTC): ${testedAt}`);
  console.log("\n### 1. 수강 과목 목록 조회");
  console.log("```http");
  console.log(`GET ${baseUrl}${coursesEndpoint}`);
  console.log("Authorization: Bearer <REDACTED_TOKEN>");
  console.log("Accept: application/json");
  console.log("```");
  console.log(`- HTTP 상태: \`${coursesResult.status} ${coursesResult.statusText}\``);
  console.log(`- 응답 과목 수(샘플 요청): ${rawCourses.length}건`);
  console.log("```json");
  console.log(JSON.stringify(maskedCourses, null, 2));
  console.log("```");

  if (!coursesResult.ok || rawCourses.length === 0) {
    console.log("\n[안내] 과목 목록 응답이 비어 있거나 오류가 발생해 과제 목록 호출을 건너뜁니다.");
    process.exit(coursesResult.ok ? 0 : 1);
  }

  // 2) 첫 번째 과목의 과제 및 제출 상태 조회
  const firstCourseId = rawCourses[0].id;
  const assignmentsEndpoint = `/api/v1/courses/${firstCourseId}/assignments?include[]=submission&per_page=5`;
  const maskedAssignmentsEndpoint =
    "/api/v1/courses/<COURSE_ID_1>/assignments?include[]=submission&per_page=5";

  const assignmentsResult = await fetchCanvasJson(assignmentsEndpoint);
  const rawAssignments = Array.isArray(assignmentsResult.json) ? assignmentsResult.json : [];
  const maskedAssignments = rawAssignments.slice(0, 2).map(maskAssignment);

  console.log("\n### 2. 과목별 과제 및 제출 상태 조회");
  console.log("```http");
  console.log(`GET ${baseUrl}${maskedAssignmentsEndpoint}`);
  console.log("Authorization: Bearer <REDACTED_TOKEN>");
  console.log("Accept: application/json");
  console.log("```");
  console.log(`- HTTP 상태: \`${assignmentsResult.status} ${assignmentsResult.statusText}\``);
  console.log(`- 응답 과제 수(샘플 요청): ${rawAssignments.length}건`);
  console.log("```json");
  console.log(JSON.stringify(maskedAssignments, null, 2));
  console.log("```");
}

main().catch((err) => {
  console.error("[호출 실패]", err?.message || err);
  process.exit(1);
});
