/** AUTO-GENERATED from openapi — do not edit. */
export const CONTRACT_OPERATIONS = [
  {
    "operationId": "auth_login",
    "method": "POST",
    "path": "/auth/login",
    "secured": false,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-002"
    ],
    "query": []
  },
  {
    "operationId": "auth_set_password",
    "method": "POST",
    "path": "/auth/set-password",
    "secured": false,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-002"
    ],
    "query": []
  },
  {
    "operationId": "users_list",
    "method": "GET",
    "path": "/users",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-001",
      "STORY-003"
    ],
    "query": [
      "q",
      "role"
    ]
  },
  {
    "operationId": "users_create",
    "method": "POST",
    "path": "/users",
    "secured": true,
    "successStatuses": [
      201
    ],
    "storyIds": [
      "STORY-001",
      "STORY-003"
    ],
    "query": []
  },
  {
    "operationId": "users_update",
    "method": "PATCH",
    "path": "/users/{id}",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-001",
      "STORY-003"
    ],
    "query": []
  },
  {
    "operationId": "rooms_list",
    "method": "GET",
    "path": "/rooms",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-004"
    ],
    "query": []
  },
  {
    "operationId": "rooms_create",
    "method": "POST",
    "path": "/rooms",
    "secured": true,
    "successStatuses": [
      201
    ],
    "storyIds": [
      "STORY-004"
    ],
    "query": []
  },
  {
    "operationId": "rooms_list_mine",
    "method": "GET",
    "path": "/rooms/mine",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-002"
    ],
    "query": []
  },
  {
    "operationId": "rooms_list_enrolled",
    "method": "GET",
    "path": "/rooms/enrolled",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-013"
    ],
    "query": []
  },
  {
    "operationId": "rooms_update",
    "method": "PATCH",
    "path": "/rooms/{id}",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-004"
    ],
    "query": []
  },
  {
    "operationId": "rooms_students_list",
    "method": "GET",
    "path": "/rooms/{id}/students",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-005"
    ],
    "query": []
  },
  {
    "operationId": "rooms_students_enroll",
    "method": "POST",
    "path": "/rooms/{id}/students",
    "secured": true,
    "successStatuses": [
      201
    ],
    "storyIds": [
      "STORY-005"
    ],
    "query": []
  },
  {
    "operationId": "rooms_students_remove",
    "method": "DELETE",
    "path": "/rooms/{id}/students/{studentId}",
    "secured": true,
    "successStatuses": [
      204
    ],
    "storyIds": [
      "STORY-005"
    ],
    "query": []
  },
  {
    "operationId": "attendance_get",
    "method": "GET",
    "path": "/rooms/{id}/attendance",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-006"
    ],
    "query": [
      "date"
    ]
  },
  {
    "operationId": "attendance_upsert",
    "method": "PUT",
    "path": "/rooms/{id}/attendance",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-006"
    ],
    "query": []
  },
  {
    "operationId": "attendance_me",
    "method": "GET",
    "path": "/rooms/{id}/attendance/me",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-006",
      "STORY-013"
    ],
    "query": []
  },
  {
    "operationId": "announcements_list",
    "method": "GET",
    "path": "/rooms/{id}/announcements",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-007"
    ],
    "query": []
  },
  {
    "operationId": "announcements_create",
    "method": "POST",
    "path": "/rooms/{id}/announcements",
    "secured": true,
    "successStatuses": [
      201
    ],
    "storyIds": [
      "STORY-007"
    ],
    "query": []
  },
  {
    "operationId": "announcements_delete",
    "method": "DELETE",
    "path": "/announcements/{id}",
    "secured": true,
    "successStatuses": [
      204
    ],
    "storyIds": [
      "STORY-007"
    ],
    "query": []
  },
  {
    "operationId": "announcements_update",
    "method": "PATCH",
    "path": "/announcements/{id}",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-007"
    ],
    "query": []
  },
  {
    "operationId": "assignments_list",
    "method": "GET",
    "path": "/rooms/{id}/assignments",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-008"
    ],
    "query": []
  },
  {
    "operationId": "assignments_create",
    "method": "POST",
    "path": "/rooms/{id}/assignments",
    "secured": true,
    "successStatuses": [
      201
    ],
    "storyIds": [
      "STORY-008"
    ],
    "query": []
  },
  {
    "operationId": "submissions_get_mine",
    "method": "GET",
    "path": "/assignments/{id}/submission",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-009"
    ],
    "query": []
  },
  {
    "operationId": "submissions_upload",
    "method": "POST",
    "path": "/assignments/{id}/submission",
    "secured": true,
    "successStatuses": [
      201
    ],
    "storyIds": [
      "STORY-009"
    ],
    "query": []
  },
  {
    "operationId": "submissions_list",
    "method": "GET",
    "path": "/assignments/{id}/submissions",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-010"
    ],
    "query": []
  },
  {
    "operationId": "submissions_grade",
    "method": "PATCH",
    "path": "/submissions/{id}/grade",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-010"
    ],
    "query": []
  },
  {
    "operationId": "quizzes_list",
    "method": "GET",
    "path": "/rooms/{id}/quizzes",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-011",
      "STORY-013"
    ],
    "query": []
  },
  {
    "operationId": "quizzes_create",
    "method": "POST",
    "path": "/rooms/{id}/quizzes",
    "secured": true,
    "successStatuses": [
      201
    ],
    "storyIds": [
      "STORY-011"
    ],
    "query": []
  },
  {
    "operationId": "quizzes_update",
    "method": "PATCH",
    "path": "/quizzes/{id}",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-011"
    ],
    "query": []
  },
  {
    "operationId": "quizzes_results",
    "method": "GET",
    "path": "/quizzes/{id}/results",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-011"
    ],
    "query": []
  },
  {
    "operationId": "quizzes_attempt_get",
    "method": "GET",
    "path": "/quizzes/{id}/attempt",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-012"
    ],
    "query": []
  },
  {
    "operationId": "quizzes_attempt_save",
    "method": "POST",
    "path": "/quizzes/{id}/attempt",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-012"
    ],
    "query": []
  },
  {
    "operationId": "gradebook_get",
    "method": "GET",
    "path": "/rooms/{id}/gradebook",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-013"
    ],
    "query": []
  },
  {
    "operationId": "gradebook_me",
    "method": "GET",
    "path": "/rooms/{id}/gradebook/me",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-013"
    ],
    "query": []
  },
  {
    "operationId": "result_get",
    "method": "GET",
    "path": "/rooms/{id}/result",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-014"
    ],
    "query": []
  },
  {
    "operationId": "result_publish",
    "method": "PUT",
    "path": "/rooms/{id}/result",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-014"
    ],
    "query": []
  },
  {
    "operationId": "notifications_list",
    "method": "GET",
    "path": "/notifications",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-015"
    ],
    "query": [
      "unreadOnly"
    ]
  },
  {
    "operationId": "notifications_mark_read",
    "method": "POST",
    "path": "/notifications/read",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-015"
    ],
    "query": []
  }
] as const;

export type ContractOperationId = "auth_login" | "auth_set_password" | "users_list" | "users_create" | "users_update" | "rooms_list" | "rooms_create" | "rooms_list_mine" | "rooms_list_enrolled" | "rooms_update" | "rooms_students_list" | "rooms_students_enroll" | "rooms_students_remove" | "attendance_get" | "attendance_upsert" | "attendance_me" | "announcements_list" | "announcements_create" | "announcements_delete" | "announcements_update" | "assignments_list" | "assignments_create" | "submissions_get_mine" | "submissions_upload" | "submissions_list" | "submissions_grade" | "quizzes_list" | "quizzes_create" | "quizzes_update" | "quizzes_results" | "quizzes_attempt_get" | "quizzes_attempt_save" | "gradebook_get" | "gradebook_me" | "result_get" | "result_publish" | "notifications_list" | "notifications_mark_read";
