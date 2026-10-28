# Student assignment flow

Verified bodies come from two HAR captures of `https://smartestu.cn/assignment` taken 2026-10-27, user role `STUDENT`, school `XXXX`. Values that identify the account are redacted as `<...>`.

## Page load order

The `/assignment` page issues these calls in order. Repeating them rebuilds everything the page shows.

| # | Call | Purpose |
| --- | --- | --- |
| 1 | `GET /api/auth/session` | user, role, `csrfToken`, `sessionContext` |
| 2 | `GET /api/config` | login modes, feature flags, footer |
| 3 | `GET /api/roles/student` | UI feature permissions for the role |
| 4 | `GET /api/homework/user/school-info` | school code, feature switches |
| 5 | `POST /api/homework/student/course/query` | courses with 作业 |
| 6 | `POST /api/homework/student/mark/queryHomeworks` | 作业 list per scene |
| 7 | `POST /api/homework/student/portal-summary` | badge counts |
| 8 | `GET /api/practice/daily-question/courses` | 每日一题 courses |
| 9 | `GET /api/course-contents/student/courses` | course materials |
| 10 | `GET /api/user/knowledge-framework/check-access`, `GET /api/student-tutor/access` | optional features |

## Session

```
GET /api/auth/session
```

```json
{
  "user": {
    "_id": "<object id>",
    "schoolId": "<object id>",
    "schoolUserId": "<school id>-<学号>",
    "schoolUserLocalId": "<学号>",
    "name": "<name>",
    "username": "<name>",
    "email": "<email>",
    "emailVerified": true,
    "provider": "local",
    "role": "STUDENT",
    "authMethod": "local",
    "termsAccepted": false,
    "plugins": [],
    "knowledgeRelations": [{"endpoint": "DeepSeek", "channels": []}],
    "wechat": {"isSubscriber": false},
    "capabilityProfile": {
      "hasDelegatedCapability": false,
      "studentCourses": [{"courseId": 7283, "courseName": "数学分析B", "teacherName": "<teacher name>"}],
      "assistantProfile": {"hasCapability": false, "courses": []},
      "classRepProfile": {"hasCapability": false, "courses": []}
    }
  },
  "sessionContext": "<hex>",
  "csrfToken": "<token>"
}
```

`role` values seen in the client: `USER`, `STUDENT`, plus teacher and dean consoles. `capabilityProfile` decides which extra consoles a user receives: 助教 (`assistantProfile`), 学委 (`classRepProfile`).

A call without a valid session cookie answers HTTP 401:

```json
{"code":"AUTH_UNAUTHENTICATED","message":"无法确认登录状态，请重试"}
```

This was reproduced against the live server on 2026-10-27 with no cookie present; every other observed call carried a valid cookie.

## Deployment config

```
GET /api/config
```

```json
{
  "appTitle": "数你最灵",
  "serverDomain": "https://smartestu.cn",
  "emailLoginEnabled": false,
  "schoolUserIdLoginEnabled": true,
  "registrationEnabled": true,
  "socialLoginEnabled": false,
  "emailEnabled": true,
  "passwordResetEnabled": true,
  "checkBalance": false,
  "onlineExamEnabled": true,
  "onlineExamSchoolCodes": "",
  "workbookHideQuestionStemSchools": "hit,hitsz,hitwh",
  "smartQuestionBankSchoolCodes": "zzz,hubu,csu",
  "personalQuestionBankHiddenSchoolCodes": "hitwh",
  "questionExportSchoolCodes": "zzz",
  "deanConsoleEnabled": true,
  "deanConsoleSchoolCodes": "zjou",
  "diagnosisChatImageUploadEnabled": false,
  "customFooter": "内容由AI生成，请仔细甄别",
  "interface": {"endpointsMenu": true, "modelSelect": true, "parameters": false, "presets": false, "sidePanel": true, "bookmarks": true, "prompts": false, "multiConvo": false, "agents": false, "temporaryChat": true}
}
```

Values differ per school deployment; the `*SchoolCodes` fields gate features by `schoolCode`.

## Courses

```
POST /api/homework/student/course/query
{}
```

```json
{
  "code": 200,
  "msg": "成功",
  "data": [{
    "id": 7283,
    "name": "数学分析B",
    "subjectType": "math",
    "teacherId": "<school id>-<teacher id>",
    "teacherName": "<teacher name>",
    "semesterId": 4,
    "semesterName": "26年秋季学期",
    "semesterIsCurrent": true,
    "taxonomyAvailable": false,
    "knowledgeTaxonomyId": null,
    "unavailableReason": "班级暂未开通知识图谱",
    "createdAt": "2026-10-06T13:36:47.104Z",
    "updatedAt": "2026-10-06T13:36:47.104Z"
  }],
  "success": true
}
```

`GET /api/course-contents/student/courses` returns the same courses in a lighter shape with a `message` envelope:

```json
{"code":200,"message":"成功","data":[{"courseId":7283,"courseName":"数学分析B","semesterName":"26年秋季学期"}]}
```

## 作业 list

```
POST /api/homework/student/mark/queryHomeworks
{"courseIds":[7283],"scene":"homework","pageSize":20,"pageNo":1}
```

`courseIds` must hold real course ids. An empty array answers an empty list even when open homework exists; verified live on 2026-10-28, where `portal-summary` reported 10 pending while `courseIds: []` returned none. `scene` is `homework` or `online_exam`. Paging fields are `pageNo` and `pageSize`; the client reads `pageTotal` from the reply to decide whether to fetch the next page.

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "courseHomeworkDTOList": [{
      "courseId": 7283,
      "courseName": "数学分析B",
      "studentCourseHomeworkDTOList": [{
        "id": 42863,
        "name": "两个重要的极限",
        "startTime": "2026-10-26T00:56:03.301Z",
        "endTime": "2026-11-02T04:00:03.300Z",
        "teacherId": "<school id>-<teacher id>",
        "teacherName": "<teacher name>",
        "type": 1,
        "totalScore": "100",
        "enableMark": 0,
        "enableAns": 1,
        "baseScore": "8",
        "homeworkType": "normal",
        "scene": "homework",
        "enableResubmit": true,
        "resubmitTimes": 1,
        "subjectiveResubmitTimes": 1,
        "objectiveResubmitTimes": 0,
        "resubmitAnswerRevealMode": "legacy_any_resubmit",
        "customAnswerTime": null,
        "includeInFinalGrade": true,
        "appealDeadlineType": 1,
        "customAppealDeadline": null,
        "allowLateSubmission": true,
        "lateSubmissionScoreRatio": 100,
        "examDurationMinutes": null,
        "hideMarkUntilExamEnd": false,
        "tieredStudentTierMap": null,
        "score": 0,
        "status": 0,
        "sharedGradingPending": false,
        "submission_status": "not_submitted",
        "review_status": "not_reviewed",
        "exercise_status": {
          "total": 3,
          "submitted": 0,
          "graded": 0,
          "pending": 0,
          "disputed": 0,
          "image_problem": 0,
          "handwriting_flagged": 0,
          "plagiarism_flagged": 0,
          "total_score": 0
        },
        "onlineExamStartedAt": null,
        "onlineExamEndedAt": null,
        "personalLateDeadlineAt": null,
        "personalLateScoreRatio": null,
        "examServerNow": "2026-10-27T13:00:19.054Z"
      }]
    }],
    "pageTotal": 1,
    "totalCount": 5,
    "pageNo": 1,
    "pageSize": 20
  }
}
```

`totalScore` and `baseScore` arrive as strings. `status` at homework level is a separate small enum from the exercise-level one.

## Portal summary

```
POST /api/homework/student/portal-summary
{}
```

```json
{"code":200,"msg":"成功","data":{"pendingHomeworkCount":9,"dailyQuestion":{"hasTodayPlan":false,"completed":false}},"success":true}
```

## School info

```
GET /api/homework/user/school-info
```

```json
{"code":200,"msg":"获取成功","data":{"schoolCode":"<school id>","schoolName":"上海XXXX大学","questionBankScoringEnabled":false,"smartCourseEnabled":false,"smartCourseCourseIds":[],"smartCourseDiagnosisCourseIds":[],"smartCourseIncompleteCourseIds":[]}}
```

## Feature gates

```
GET /api/user/knowledge-framework/check-access  ->  {"hasAccess": false}
GET /api/student-tutor/access                   ->  {"code":200,"message":"OK","data":{"eligible":false}}
GET /api/practice/daily-question/courses        ->  {"code":200,"msg":"成功","data":{"list":[]},"success":true}
```

An empty 每日一题 list means no course has that feature bound; the client treats it as "no 每日一题" rather than an error.

## 作业 detail

```
POST /api/homework/student/mark/queryExercisesByHomeworkId
{"homeworkId":42863}
```

Observed live on 2026-10-28, and identical to the normalizer in `AssignmentDialog.CBcaYc8b.js`. `data` holds exactly `homeworkInfo` and `exercises`. Exercise fields returned for one 数学分析B 作业: `id, name, questionNum, displayNum, score, sourceType, questionType, questionDifficulty, submissionHints, pageNumber, questionStructure, objectiveOutcomeReveal, answerStructure, images, studentAnswerRaw, initialAnswerRaw, answerImages, annotations, status, resubmitTimes, markPayload, markScore, showMarkResult, imageProblemType, handwriting_flag, plagiarism_flag, studentSubExercise, isLateSubmitted, lateSubmissionRecord, returnedCount, returnedAtList, returnedRecords, hideQuestionStem, sharedGradingPending`.

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "homeworkInfo": { "...": "the homework object plus scene, hideMarkUntilExamEnd, submission_status" },
    "exercises": [{
      "id": 123456,
      "name": "第一题",
      "questionNum": 1,
      "displayNum": 1,
      "score": 8,
      "status": 1,
      "markScore": 8,
      "markPayload": null,
      "questionStructure": "{\"mainQuestion\":{...}}",
      "answerStructure": "{\"mainQuestion\":{...}}",
      "studentAnswerRaw": "",
      "answerImages": ["https://..."],
      "answerImageIndexes": [0],
      "annotations": [],
      "studentSubExercise": [],
      "resubmitTimes": 1,
      "returnedCount": 0,
      "imageProblemType": null,
      "handwriting_flag": false,
      "plagiarism_flag": false,
      "sharedGradingPending": false,
      "objectiveOutcomeReveal": null,
      "pageNumber": null
    }]
  }
}
```

`questionStructure` and `answerStructure` are JSON strings on the wire and get parsed by the client; both may also arrive as objects. `pageNumber >= 0` marks a 整页扫描 exercise (one picture covering several questions); those cannot be answered through the exercise-level form.

`answerStructure` holds the reference answer. It is null while withheld, which the client reads as "答案未公布" when `enableAns` is 0 or an online exam has not ended.

## Answer submission

### Image upload

```
POST /api/homework/files/exercise/upload
Content-Type: multipart/form-data

file=<binary>
exerciseId=123456
type=0
```

Reply used by the client: `{"code":200,"data":{"url":"https://..."}}`. `type` is always `0` in the client for answer pages. The client caps answer pages at 8 images per exercise.

### Submit answers

```
POST /api/homework/student/homework/submit
{"homeworkId":42863,"exercises":[{"exerciseId":123456,"answer":"[\"A\"]"}],"finalize":false}
```

Client-side payload construction, quoted from `fp` in `AssignmentDialog.CBcaYc8b.js`:

```js
exercises: (e.exercises || []).map(r => ({...r, answer: r.answer ?? (r.objectiveAnswer !== undefined ? JSON.stringify(r.objectiveAnswer) : undefined)}))
```

Consequences:

- `answer` is a JSON string. For `mcq_single` and `mcq_multi` the parsed value is an array of option ids (`["A"]`, `["A","C"]`). For `tf_multi` it is an object keyed by statement id (`{"1":true,"2":false}`).
- Other keys in each `exercises[]` element pass through untouched, so image URLs and sub-question indexes ride along with the same request.
- `finalize: false` stores answers. Finalizing sends `{"homeworkId":N,"exercises":[],"finalize":true}`.

Reply shape, quoted from the same file:

```js
const N = await d().submitOrdinary({homeworkId:r, exercises:m, finalize:false});
const f = N.data.exercises.results;
f.filter(y => y.success).map(y => String(y.exerciseId));
```

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "finalized": false,
    "exercises": {
      "results": [
        {"exerciseId": 123456, "success": true, "message": ""},
        {"exerciseId": 123457, "success": false, "message": "答案格式错误"}
      ]
    }
  }
}
```

A failed finalize reports `data.finalized: false` and the client shows `msg` to the student.

### Resubmit one exercise (订正)

```
POST /api/homework/student/exercise/resubmit
{"exerciseId":123456,"objectiveAnswer":["A"]}
```

or

```
POST /api/homework/student/exercise/resubmit
{"exerciseId":123456,"subQuestionNumbers":[1,2],"subQuestionIndexes":[0,1],"answerUrls":["https://..."]}
```

Both bodies come from `sl(...)` call sites in the assignment chunk. `subQuestionNumbers` addresses 小题 inside a composite exercise. Each accepted call consumes one of `resubmitTimes`, `subjectiveResubmitTimes`, or `objectiveResubmitTimes` depending on `questionType`.

### Shared picture submission

Flags first:

```
GET /api/homework/student/shared-images/capabilities?homeworkId=42863
```

Then a presigned upload, then the attach call:

```
POST /api/homework/student/shared-images/presign
{"homeworkId":42863,"originalName":"page-1.jpg","contentType":"image/jpeg"}

POST /api/homework/student/shared-images
{"homeworkId":42863,"clientRequestId":"<uuid>","selectedExercises":[{"exerciseId":123456}],"images":[{"fileId":"<id>"}]}
```

This path attaches one uploaded picture set to several exercises at once. It is the client's default for mobile 拍照交作业 when the server reports the capability.

## Graded work and extra material

| Endpoint | Body | Purpose |
| --- | --- | --- |
| `POST /api/homework/student/exercise/getErrorAnalysis` | `{"homeworkId":N,"exerciseId":N}` | 错因分析 for one exercise |
| `POST /api/homework/student/exercise/getExcellentAnswers` | `{"homeworkId":N}` | 优秀答案 for the 作业 |
| `GET /api/wrong-question-book/?<query>` | query `courseIds`, page | 错题本 list |
| `POST /api/wrong-question-book/{id}/practice-attempts` | attempt body | record a 错题 practice attempt |
| `GET /api/appeal/student/info` | query `homeworkId`, `exerciseId` | 申诉 state and deadline |

Bodies above are inferred from the client; only the paths were observed.

## Daily practice

```
GET  /api/practice/daily-question/courses
GET  /api/practice/daily-question/all?<query>
POST /api/practice/daily-question/{id}/submit
```

The student workspace hook lives in `useDailyQuestionStudentWorkspace.DSeAU3EH.js`.

## Online exam

`scene: "online_exam"` reuses the 作业 endpoints with extra state:

- `POST /api/homework/student/homework/startOnlineExam` starts the clock, returning `onlineExamStartedAt` and enforcing `examDurationMinutes`.
- `hideMarkUntilExamEnd: true` hides scores and answers until `endTime`.
- Deadline arithmetic must use `examServerNow` rather than the local clock.

Body shape for `startOnlineExam` was not captured.
