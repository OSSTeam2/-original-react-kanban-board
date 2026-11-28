import { mapCanvasAssignmentToLmsItem } from "./utils/lmsSync.js";

export async function fetchMyLmsAssignments() {
    const coursesRes = await fetch("/canvas-api/courses?enrollment_state=active&per_page=50");
    if (!coursesRes.ok) {
        throw new Error(`과목 조회 실패 (HTTP ${coursesRes.status})`);
    }
    const courses = await coursesRes.json();
    const validCourses = courses.filter((c) => c?.id && c?.name);

    const assignmentLists = await Promise.all(
        validCourses.map(async (course) => {
            const res = await fetch(
                `/canvas-api/courses/${course.id}/assignments?include[]=submission&per_page=50`
            );
            if (!res.ok) return [];
            const assignments = await res.json();
            return assignments.map((a) => mapCanvasAssignmentToLmsItem(course, a));
        })
    );

    return assignmentLists.flat();
}