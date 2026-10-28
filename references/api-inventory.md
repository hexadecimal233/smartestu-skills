# API inventory: smartestu.cn

401 endpoint paths recovered from the client bundle `static.smartestu.cn/assets/bootstrap.D-XOGqrY.js`, plus `AssignmentDialog.CBcaYc8b.js` for the assignment page.

Marked "verified" means the path also appeared on the wire in one of the two HAR captures. Unmarked paths are callable by the client; their request bodies were not observed.

Path syntax is normalized: `${id}` stands for a path segment, `<query>` stands for a client-built query string. All paths are relative to `https://smartestu.cn`.

## School platform areas

### `admin/dashboard` (4)

- `/api/admin/dashboard/exercise/${id}/details`
- `/api/admin/dashboard/export`
- `/api/admin/dashboard/filters`
- `/api/admin/dashboard/matrix`

### `appeal/student` (3)

- `/api/appeal/student/info`
- `/api/appeal/student/submit`
- `/api/appeal/student/withdraw`

### `attendance/student` (4)

- `/api/attendance/student/active`
- `/api/attendance/student/all`
- `/api/attendance/student/checkin`
- `/api/attendance/student/records`

### `attendance/teacher` (8)

- `/api/attendance/teacher/close`
- `/api/attendance/teacher/create`
- `/api/attendance/teacher/delete`
- `/api/attendance/teacher/detail`
- `/api/attendance/teacher/export`
- `/api/attendance/teacher/list`
- `/api/attendance/teacher/updateGPS`
- `/api/attendance/teacher/updateStatus`

### `auth` (9)

- `/api/auth`
- `/api/auth/bindEmail/verify`
- `/api/auth/checkEmailById`
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/register`
- `/api/auth/requestVerificationCode`
- `/api/auth/resetPasswordWithBinding`
- `/api/auth/session` (verified: GET observed in capture)

### `class-representatives` (9)

- `/api/class-representatives/add`
- `/api/class-representatives/check-eligibility`
- `/api/class-representatives/courses/query`
- `/api/class-representatives/homework/delete`
- `/api/class-representatives/homework/publish`
- `/api/class-representatives/homework/query`
- `/api/class-representatives/homework/update`
- `/api/class-representatives/remove`
- `/api/class-representatives/update-permissions`

### `classes/${id}` (8)

- `/api/classes/${id}`
- `/api/classes/${id}/addStudent`
- `/api/classes/${id}/students`
- `/api/classes/${id}/students/${id}`
- `/api/classes/${id}/students/export?format=${id}`
- `/api/classes/${id}/students/import`
- `/api/classes/${id}/teachers`
- `/api/classes/${id}/teachers/${id}`

### `classes/create` (1)

- `/api/classes/create`

### `classes/teachers` (1)

- `/api/classes/teachers`

### `config` (1)

- `/api/config` (verified: GET observed in capture)

### `course-contents/contents` (6)

- `/api/course-contents/contents/${id}`
- `/api/course-contents/contents/${id}/complete`
- `/api/course-contents/contents/${id}/courses`
- `/api/course-contents/contents/${id}/presign-part`
- `/api/course-contents/contents/${id}/signed-url`
- `/api/course-contents/contents/init`

### `course-contents/student` (3)

- `/api/course-contents/student/contents/${id}/signed-url?<query>`
- `/api/course-contents/student/contents?<query>`
- `/api/course-contents/student/courses` (verified: GET observed in capture)

### `course-contents/teacher` (7)

- `/api/course-contents/teacher/content-course-links/batch`
- `/api/course-contents/teacher/contents`
- `/api/course-contents/teacher/folders`
- `/api/course-contents/teacher/folders/${id}`
- `/api/course-contents/teacher/folders/${id}/contents`
- `/api/course-contents/teacher/folders/${id}/move`
- `/api/course-contents/teacher/sharing-courses`

### `course-knowledge-framework` (4)

- `/api/course-knowledge-framework/associate`
- `/api/course-knowledge-framework/courses/${id}/knowledge-frameworks`
- `/api/course-knowledge-framework/courses/${id}/knowledge-frameworks/${id}`
- `/api/course-knowledge-framework/teacher/knowledge-frameworks`

### `courses` (2)

- `/api/courses/${id}/learning-warning/dashboard`
- `/api/courses/${id}/learning-warning/settings`

### `dean/dashboard` (8)

- `/api/dean/dashboard/college/${id}`
- `/api/dean/dashboard/course/${id}/homework-scores`
- `/api/dean/dashboard/export`
- `/api/dean/dashboard/filters`
- `/api/dean/dashboard/overview`
- `/api/dean/dashboard/score-distribution`
- `/api/dean/dashboard/students`
- `/api/dean/dashboard/teacher/${id}`

### `diagnosis/homework` (2)

- `/api/diagnosis/homework/${id}/sessions/${id}/teacher-close`
- `/api/diagnosis/homework/${id}/sessions/${id}/teacher-turns`

### `diagnosis/sessions` (8)

- `/api/diagnosis/sessions`
- `/api/diagnosis/sessions/${id}`
- `/api/diagnosis/sessions/${id}/messages`
- `/api/diagnosis/sessions/${id}/messages?<query>`
- `/api/diagnosis/sessions/${id}/resource-interactions`
- `/api/diagnosis/sessions/${id}/resources/${id}/url`
- `/api/diagnosis/sessions/${id}/teacher-handoff`
- `/api/diagnosis/sessions/${id}/turns`

### `diagnosis/sessions?<query>` (1)

- `/api/diagnosis/sessions?<query>`

### `exam` (1)

- `/api/exam`

### `exam/${id}` (42)

- `/api/exam/${id}`
- `/api/exam/${id}/abnormal-papers`
- `/api/exam/${id}/abnormal-papers/${id}/process`
- `/api/exam/${id}/abnormal-papers/count`
- `/api/exam/${id}/ai-grading/blocks`
- `/api/exam/${id}/ai-grading/items`
- `/api/exam/${id}/ai-grading/items/${id}/score`
- `/api/exam/${id}/ai-grading/ocr-items`
- `/api/exam/${id}/ai-grading/ocr-items/${id}`
- `/api/exam/${id}/ai-grading/ocr-items/${id}/retry`
- `/api/exam/${id}/ai-grading/start`
- `/api/exam/${id}/all-grading-progress`
- `/api/exam/${id}/arbitration-items`
- `/api/exam/${id}/arbitration-items/${id}/score`
- `/api/exam/${id}/arbitration-items/${id}/submit`
- `/api/exam/${id}/choice-doubts/${id}/resolve`
- `/api/exam/${id}/choice-doubts/${id}/skip`
- `/api/exam/${id}/doubt-items`
- `/api/exam/${id}/doubt-items/${id}/resolve`
- `/api/exam/${id}/doubt-items/${id}/skip`
- `/api/exam/${id}/export-scores`
- `/api/exam/${id}/files/presigned`
- `/api/exam/${id}/finish-grading`
- `/api/exam/${id}/finish-uploading`
- `/api/exam/${id}/grading-assignments`
- `/api/exam/${id}/grading-assignments/validate`
- `/api/exam/${id}/grading-tasks/${id}/reset-for-regrade`
- `/api/exam/${id}/needs-arbitration/count`
- `/api/exam/${id}/standard-answers`
- `/api/exam/${id}/stats`
- `/api/exam/${id}/student/${id}/original?<query>`
- `/api/exam/${id}/subjective-questions`
- `/api/exam/${id}/submissions`
- `/api/exam/${id}/submissions/${id}/original`
- `/api/exam/${id}/submissions/${id}/retry`
- `/api/exam/${id}/submissions/batch-delete`
- `/api/exam/${id}/submissions/presigned`
- `/api/exam/${id}/submissions/upload-complete`
- `/api/exam/${id}/template`
- `/api/exam/${id}/template-pdf`
- `/api/exam/${id}/template/validate/objective`
- `/api/exam/${id}/template/validate/student-id`

### `exam/arbitration-exams` (1)

- `/api/exam/arbitration-exams`

### `exam/files` (1)

- `/api/exam/files/presigned`

### `exam/grading` (5)

- `/api/exam/grading/save-answer-annotation`
- `/api/exam/grading/submit`
- `/api/exam/grading/tasks`
- `/api/exam/grading/tasks/${id}/confirm-complete`
- `/api/exam/grading/tasks/${id}/questions`

### `exam/grading-exams` (1)

- `/api/exam/grading-exams`

### `exam/list` (1)

- `/api/exam/list`

### `exam/teachers` (1)

- `/api/exam/teachers`

### `exam/tos` (1)

- `/api/exam/tos/presigned`

### `homework/deleteTeacherAssistant` (1)

- `/api/homework/deleteTeacherAssistant`

### `homework/exercise` (4)

- `/api/homework/exercise/manualMarkDelete`
- `/api/homework/exercise/manualMarkInsert`
- `/api/homework/exercise/saveAnnotation`
- `/api/homework/exercise/updateFlags`

### `homework/files` (5)

- `/api/homework/files/exercise/upload`
- `/api/homework/files/presign`
- `/api/homework/files/presign/batch`
- `/api/homework/files/resolve-view-url?<query>`
- `/api/homework/files/upload-diagnostics`

### `homework/getTeacherAssistants` (1)

- `/api/homework/getTeacherAssistants`

### `homework/homework` (4)

- `/api/homework/homework/${id}/generated-questions`
- `/api/homework/homework/exportReportPdf`
- `/api/homework/homework/getHomeworkExerciseReport`
- `/api/homework/homework/getHomeworkReport`

### `homework/returns` (2)

- `/api/homework/returns/execute`
- `/api/homework/returns/preview`

### `homework/student` (21)

- `/api/homework/student/compensation-resources/${id}/signed-url`
- `/api/homework/student/course-overview`
- `/api/homework/student/course-overview/atomic/${id}/questions?<query>`
- `/api/homework/student/course-overview/resources/${id}/signed-url?<query>`
- `/api/homework/student/course/query` (verified: POST observed in capture)
- `/api/homework/student/exercise/getErrorAnalysis`
- `/api/homework/student/exercise/getExcellentAnswers`
- `/api/homework/student/exercise/resubmit`
- `/api/homework/student/homework/startOnlineExam`
- `/api/homework/student/homework/submit`
- `/api/homework/student/knowledge-preview-resources/${id}/signed-url`
- `/api/homework/student/mark/queryExercisesByHomeworkId`
- `/api/homework/student/mark/queryHomeworks` (verified: POST observed in capture)
- `/api/homework/student/portal-summary` (verified: POST observed in capture)
- `/api/homework/student/preview-contents`
- `/api/homework/student/preview-material-progress/heartbeat`
- `/api/homework/student/preview-material-progress/open`
- `/api/homework/student/preview-material-progress?<query>`
- `/api/homework/student/shared-images`
- `/api/homework/student/shared-images/capabilities?<query>`
- `/api/homework/student/shared-images/presign`

### `homework/teacher` (43)

- `/api/homework/teacher/class/homeworkDetails`
- `/api/homework/teacher/class/query`
- `/api/homework/teacher/class/score-rank-setting`
- `/api/homework/teacher/class/singleStudentHomework`
- `/api/homework/teacher/compensation-resources/${id}/signed-url`
- `/api/homework/teacher/content-check-default`
- `/api/homework/teacher/course/query`
- `/api/homework/teacher/course/queryForPublish`
- `/api/homework/teacher/exercise/query`
- `/api/homework/teacher/homework/${id}/check-submissions`
- `/api/homework/teacher/homework/${id}/diagnosis-overview?<query>`
- `/api/homework/teacher/homework/delete`
- `/api/homework/teacher/homework/publish`
- `/api/homework/teacher/homework/publish-preferences`
- `/api/homework/teacher/homework/query`
- `/api/homework/teacher/homework/toggleEnableAns`
- `/api/homework/teacher/homework/update`
- `/api/homework/teacher/ideological-graph/structure`
- `/api/homework/teacher/knowledge-graph/structure`
- `/api/homework/teacher/knowledge-stats`
- `/api/homework/teacher/knowledge-stats/by-course`
- `/api/homework/teacher/knowledge-taxonomy/binding`
- `/api/homework/teacher/knowledge-taxonomy/catalog`
- `/api/homework/teacher/knowledge-taxonomy/teacher-scope`
- `/api/homework/teacher/mark/clearPersonalLateByStudents`
- `/api/homework/teacher/mark/exportStudentHomeworksPdf`
- `/api/homework/teacher/mark/exportStudentHomeworksPdfTask/${id}`
- `/api/homework/teacher/mark/extendOnlineExamDurationByStudents`
- `/api/homework/teacher/mark/query`
- `/api/homework/teacher/mark/queryReturnedExercises`
- `/api/homework/teacher/mark/queryStudentsByHomework`
- `/api/homework/teacher/mark/remindDeadlineByStudents`
- `/api/homework/teacher/mark/remindDeadlineForUnsubmitted`
- `/api/homework/teacher/mark/setPersonalLateByStudents`
- `/api/homework/teacher/markStudent/query`
- `/api/homework/teacher/pending-summary`
- `/api/homework/teacher/preview-material-progress?<query>`
- `/api/homework/teacher/problem-graph/catalog`
- `/api/homework/teacher/problem-graph/structure`
- `/api/homework/teacher/question-exports/${id}`
- `/api/homework/teacher/question-exports/prepare`
- `/api/homework/teacher/tiered-homework/${id}/tier-snapshots`
- `/api/homework/teacher/tiered-homework/student-tiers`

### `homework/textbookBank` (11)

- `/api/homework/textbookBank/bindTextbook`
- `/api/homework/textbookBank/deleteQuestions`
- `/api/homework/textbookBank/getAllTextbooksForBinding`
- `/api/homework/textbookBank/getBoundTextbooks`
- `/api/homework/textbookBank/getSectionQuestions`
- `/api/homework/textbookBank/getTextbookWithFullData`
- `/api/homework/textbookBank/questions/${id}/feedback`
- `/api/homework/textbookBank/requestNewTextbook`
- `/api/homework/textbookBank/subQuestions/${id}/feedback`
- `/api/homework/textbookBank/unbindTextbook`
- `/api/homework/textbookBank/updateQuestions`

### `homework/updateTeacherAssistantPermissions` (1)

- `/api/homework/updateTeacherAssistantPermissions`

### `homework/user` (1)

- `/api/homework/user/school-info` (verified: GET observed in capture)

### `knowledge-framework/comments` (3)

- `/api/knowledge-framework/comments`
- `/api/knowledge-framework/comments/${id}`
- `/api/knowledge-framework/comments/${id}/pin`

### `knowledge-framework/frameworks` (4)

- `/api/knowledge-framework/frameworks/${id}/comment-counts`
- `/api/knowledge-framework/frameworks/${id}/nodes/${id}/comments`
- `/api/knowledge-framework/frameworks/${id}/nodes/${id}/mark-read`
- `/api/knowledge-framework/frameworks/${id}/unread-counts-by-node`

### `practice/daily-question` (3)

- `/api/practice/daily-question/${id}/submit`
- `/api/practice/daily-question/all`
- `/api/practice/daily-question/courses` (verified: GET observed in capture)

### `practice/teacher` (6)

- `/api/practice/teacher/daily-question/bank-bindings`
- `/api/practice/teacher/daily-question/bank-bindings/${id}`
- `/api/practice/teacher/daily-question/class-bindings`
- `/api/practice/teacher/daily-question/class-bindings/${id}`
- `/api/practice/teacher/daily-question/courses`
- `/api/practice/teacher/daily-question/statistics`

### `question-bank/personal` (18)

- `/api/question-bank/personal`
- `/api/question-bank/personal/folders`
- `/api/question-bank/personal/folders/${id}`
- `/api/question-bank/personal/folders/${id}/move`
- `/api/question-bank/personal/peer-share/colleagues`
- `/api/question-bank/personal/peer-share/folder`
- `/api/question-bank/personal/peer-share/questions`
- `/api/question-bank/personal/peer-share/section`
- `/api/question-bank/personal/question-set/${id}`
- `/api/question-bank/personal/question-sets`
- `/api/question-bank/personal/question-sets/${id}`
- `/api/question-bank/personal/question-sets/${id}/move`
- `/api/question-bank/personal/questions/copy`
- `/api/question-bank/personal/questions/copy-from-smart`
- `/api/question-bank/personal/questions/copy-from-textbook`
- `/api/question-bank/personal/questions/move`
- `/api/question-bank/personal/section/${id}/files`
- `/api/question-bank/personal/sections/${id}/questions`

### `question-bank/smart` (10)

- `/api/question-bank/smart/banks`
- `/api/question-bank/smart/banks/${id}/questions/${id}/difficulty`
- `/api/question-bank/smart/domains`
- `/api/question-bank/smart/domains/${id}/directory`
- `/api/question-bank/smart/favorites`
- `/api/question-bank/smart/favorites/domains`
- `/api/question-bank/smart/favorites/domains/${id}/directory`
- `/api/question-bank/smart/favorites/questions`
- `/api/question-bank/smart/questions`
- `/api/question-bank/smart/questions/${id}/feedback`

### `realtime-dialog/config` (1)

- `/api/realtime-dialog/config`

### `realtime-dialog/stats` (1)

- `/api/realtime-dialog/stats`

### `realtime-dialog/ws` (1)

- `/api/realtime-dialog/ws`

### `search?<query>` (1)

- `/api/search?<query>`

### `self-test/books` (6)

- `/api/self-test/books`
- `/api/self-test/books/${id}`
- `/api/self-test/books/${id}/course-questions`
- `/api/self-test/books/${id}/questions/${id}`
- `/api/self-test/books/${id}/questions/delete`
- `/api/self-test/books/empty`

### `self-test/folders` (2)

- `/api/self-test/folders`
- `/api/self-test/folders/${id}`

### `self-test/questions` (2)

- `/api/self-test/questions/copy`
- `/api/self-test/questions/move`

### `self-test/rounds` (3)

- `/api/self-test/rounds`
- `/api/self-test/rounds/${id}`
- `/api/self-test/rounds/${id}/answers`

### `self-test/structure` (1)

- `/api/self-test/structure`

### `self-test/tasks` (1)

- `/api/self-test/tasks`

### `student-tutor/access` (1)

- `/api/student-tutor/access` (verified: GET observed in capture)

### `student-tutor/conversations` (3)

- `/api/student-tutor/conversations/${id}/exercise-attempts/status`
- `/api/student-tutor/conversations/${id}/messages/${id}/exercise-items/${id}/answer`
- `/api/student-tutor/conversations/${id}/messages/${id}/exercise-items/${id}/attempt`

### `student-tutor/resources` (1)

- `/api/student-tutor/resources/${id}/url?<query>`

### `student/knowledge-frameworks` (2)

- `/api/student/knowledge-frameworks`
- `/api/student/knowledge-frameworks/${id}`

### `student/product-feedback` (1)

- `/api/student/product-feedback`

### `teacher-assistants/${id}` (1)

- `/api/teacher-assistants/${id}/courses`

### `teacher-assistants/add` (1)

- `/api/teacher-assistants/add`

### `teacher-assistants/check` (1)

- `/api/teacher-assistants/check`

### `teacher-assistants/class` (1)

- `/api/teacher-assistants/class/query`

### `teacher-assistants/homework` (1)

- `/api/teacher-assistants/homework/publish`

### `teacher/compensation-resources` (11)

- `/api/teacher/compensation-resources`
- `/api/teacher/compensation-resources/${id}`
- `/api/teacher/compensation-resources/${id}/clone-atomics`
- `/api/teacher/compensation-resources/${id}/complete`
- `/api/teacher/compensation-resources/${id}/presign-part`
- `/api/teacher/compensation-resources/${id}/signed-url`
- `/api/teacher/compensation-resources/exercises`
- `/api/teacher/compensation-resources/exercises/${id}`
- `/api/teacher/compensation-resources/from-preview`
- `/api/teacher/compensation-resources/init`
- `/api/teacher/compensation-resources/knowledge-card`

### `teacher/diagnosis` (7)

- `/api/teacher/diagnosis/classes/${id}/learning-profile`
- `/api/teacher/diagnosis/records`
- `/api/teacher/diagnosis/records/${id}`
- `/api/teacher/diagnosis/records/options`
- `/api/teacher/diagnosis/records/summary`
- `/api/teacher/diagnosis/resources/behavior-usage`
- `/api/teacher/diagnosis/students/${id}/learning-profile`

### `teacher/diagnosis-resources` (2)

- `/api/teacher/diagnosis-resources`
- `/api/teacher/diagnosis-resources/dictionaries`

### `teacher/knowledge-preview-resources` (9)

- `/api/teacher/knowledge-preview-resources`
- `/api/teacher/knowledge-preview-resources/${id}`
- `/api/teacher/knowledge-preview-resources/${id}/clone-atomics`
- `/api/teacher/knowledge-preview-resources/${id}/complete`
- `/api/teacher/knowledge-preview-resources/${id}/presign-part`
- `/api/teacher/knowledge-preview-resources/${id}/signed-url`
- `/api/teacher/knowledge-preview-resources/course-overview`
- `/api/teacher/knowledge-preview-resources/from-compensation`
- `/api/teacher/knowledge-preview-resources/init`

### `teacher/student-tutor` (1)

- `/api/teacher/student-tutor`

### `user/delete` (1)

- `/api/user/delete`

### `user/email` (4)

- `/api/user/email/rebind/confirm`
- `/api/user/email/rebind/identity/send-code`
- `/api/user/email/rebind/identity/verify`
- `/api/user/email/rebind/new/send-code`

### `user/knowledge-framework` (4)

- `/api/user/knowledge-framework`
- `/api/user/knowledge-framework/${id}`
- `/api/user/knowledge-framework/check-access` (verified: GET observed in capture)
- `/api/user/knowledge-framework/upload`

### `user/knowledge-frameworks` (1)

- `/api/user/knowledge-frameworks`

### `user/plugins` (1)

- `/api/user/plugins`

### `user/terms` (2)

- `/api/user/terms`
- `/api/user/terms/accept`

### `user/userEndpoints` (1)

- `/api/user/userEndpoints`

### `user/verify` (2)

- `/api/user/verify`
- `/api/user/verify/resend`

### `wechat/bind` (2)

- `/api/wechat/bind/confirm`
- `/api/wechat/bind/start`

### `wechat/jssdk-config?${id}).toString()}` (1)

- `/api/wechat/jssdk-config?${id}).toString()}`

### `wrong-question-book` (1)

- `/api/wrong-question-book`

### `wrong-question-book/${id}` (2)

- `/api/wrong-question-book/${id}/practice-attempts`
- `/api/wrong-question-book/${id}/practice-attempts/${id}`

### `wrong-question-book/batch` (2)

- `/api/wrong-question-book/batch`
- `/api/wrong-question-book/batch/restore`

## Inherited AI chat endpoints (upstream LibreChat)

The backend keeps the LibreChat API surface. These paths belong to the chat feature, not the assignment pages.

- `/api/${id}/chat`

`/api/${id}/chat` is the generated route: the bundle builds `/api/${v.agents}/chat` and `/api/${v.bedrock}/chat`, both collapsing into one entry, listed here as `/api/${id}/chat`.

### `agents` (1)

- `/api/agents`

### `ask` (1)

- `/api/ask/${id}`

### `assistants` (3)

- `/api/assistants/v${id}`
- `/api/assistants/v1/chat`
- `/api/assistants/v2/chat`

### `balance` (1)

- `/api/balance`

### `banner` (2)

- `/api/banner`
- `/api/banner/popup` (verified: GET observed in capture)

### `categories` (1)

- `/api/categories`

### `convos` (1)

- `/api/convos`

### `endpoints` (1)

- `/api/endpoints`

### `files` (1)

- `/api/files`

### `keys` (1)

- `/api/keys`

### `messages` (2)

- `/api/messages/${id}`
- `/api/messages/artifact/${id}`

### `models` (1)

- `/api/models`

### `notices` (1)

- `/api/notices/teacher-billing`

### `notifications` (3)

- `/api/notifications/health`
- `/api/notifications/sse`
- `/api/notifications/status`

### `plugins` (1)

- `/api/plugins`

### `presets` (2)

- `/api/presets`
- `/api/presets/delete`

### `prompts` (1)

- `/api/prompts`

### `roles` (1)

- `/api/roles`

### `school-access` (3)

- `/api/school-access/${id}/claim`
- `/api/school-access/${id}/meta`
- `/api/school-access/${id}/recovery-email`

### `schools` (1)

- `/api/schools`

### `search` (1)

- `/api/search/enable`

### `semesters` (1)

- `/api/semesters`

### `share` (1)

- `/api/share`

### `tags` (1)

- `/api/tags`
