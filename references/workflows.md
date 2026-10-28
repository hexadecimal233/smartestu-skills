# Workflows

Each workflow starts from a phrase a user actually says. Tags per step: **verified** (observed on the wire), **inferred** (derived from the client bundle), **unknown** (not established; capture it before relying on it).

Writes happen only in workflows 3 to 8 and 10 to 11, and only when the user asked for that exact action. Every other workflow is read-only.

| User says | Workflow | Writes |
| --- | --- | --- |
| 我还有哪些作业没交 / 今天要交什么 | 1. Open work list | no |
| 打开第 N 次作业 / 这次作业有几题 | 2. Open one 作业 | no |
| 帮我把选择题做了 | 3. Objective answers | yes |
| 帮我交作业（拍照/手写） | 4. Picture answers | yes |
| 交卷 / 提交整份作业 | 5. Finalize | yes |
| 我要订正第 N 题 | 6. Resubmit one exercise | yes |
| 看看批改结果 / 错在哪 | 7. Graded review | no |
| 我要申诉 | 8. Appeal | yes |
| 错题本里有什么 / 复习错题 | 9. Wrong-question book | partly |
| 今日一题 | 10. Daily question | yes |
| 在线考试还来得及吗 | 11. Online exam window | yes |
| 签到 | 12. Check-in | yes |

## Shared preconditions

Run these before any write. They decide whether the write is possible at all, and they answer the user's "来得及吗" question without guessing.

1. `POST /api/homework/student/mark/queryExercisesByHomeworkId {"homeworkId":N}` gives `data.homeworkInfo` and `data.exercises[]`.
2. Read `examServerNow` from `homeworkInfo`. Treat it as the current time.
3. Open when `examServerNow <= endTime` or `personalLateDeadlineAt` is later, or `allowLateSubmission` is true (late work scores `lateSubmissionScoreRatio` percent).
4. Answerable exercises have `pageNumber == null` or `< 0`. An exercise with `pageNumber >= 0` is a 整页扫描 sheet: no per-exercise answer form, teacher grades the page.
5. `homeworkInfo.scene` decides the API family: `homework` and `online_exam` share endpoints; `preview` is read-only material.

Refuse the write and report the reason when: the deadline passed with `allowLateSubmission: false`; the exercise is a 整页扫描 sheet; `submission_status` is `completed` and `enableResubmit` is false.

Writes also follow the confirmation protocol in `SKILL.md`: show the payload and the cost, wait for an explicit yes, and treat 交卷 as its own question. 「帮我完成作业」 covers saving answers; it does not authorise filing.

## 1. Open work list

Goal: what is unanswered, sorted by deadline.

1. **verified** `POST /api/homework/student/portal-summary {}` returns `pendingHomeworkCount`.
2. **verified** Resolve course ids from `POST /api/homework/student/course/query {}`, then for `scene` in `homework` and `online_exam`: `POST /api/homework/student/mark/queryHomeworks {"courseIds":[7283],"scene":"homework","pageSize":20,"pageNo":1}`, following `pageTotal`. An empty `courseIds` array answers an empty list even when work is open; verified live.
3. Keep rows whose `submission_status` is not `completed`. Sort by `endTime`.
4. For each row report `name`, `courseName`, `endTime`, `exercise_status.submitted/total`, `exercise_status.pending`, and whether it is past `examServerNow` with `allowLateSubmission`.

Helper: `node scripts/smartestu-api.mjs pending` prints this table for both scenes.

Report `submitted` rather than `graded`: a student asking "what is left" cares about unanswered work, and `graded` lags behind.

## 2. Open one 作业

Goal: list the questions, the answer format per question, and whether the reference answer is visible.

1. **inferred** `POST /api/homework/student/mark/queryExercisesByHomeworkId {"homeworkId":N}`.
2. **inferred** Parse each `questionStructure`. Group by `questionType`: `mcq_single`, `mcq_multi`, `tf_multi`, `objective_group`, `subjective`.
3. **inferred** `answerStructure` non-null means the reference answer is released. Null means at least one gate is closed (`enableAns`, `hideMarkUntilExamEnd`, `resubmitAnswerRevealMode`, `objectiveOutcomeReveal`). Say "答案未公布" instead of guessing.
4. Skip 整页扫描 exercises when reporting questions to answer.

## 3. Objective answers

Goal: fill multiple choice and true/false, store them without filing the 作业.

1. Preconditions above, plus `questionType` in {`mcq_single`, `mcq_multi`, `tf_multi`, `objective_group`}.
2. **inferred** Build the answer value: `["A"]` for single, `["A","C"]` for multi (sorted), `{"1":true,"2":false}` keyed by `tfSpec.statements[].id` for true/false, one value per 小题 for a group.
3. **inferred** Encode with `JSON.stringify` into `answer`. The client does this in `fp`.
4. **inferred** `POST /api/homework/student/homework/submit {"homeworkId":N,"exercises":[{"exerciseId":M,"answer":"[\"A\"]"}],"finalize":false}`.
5. **inferred** Read `data.exercises.results[]`. Report failures per `exerciseId` with `message`; retry only those.
6. Stop here unless the user also asked to 交卷, and confirm before sending anything. Saving answers and filing the 作业 are separate actions with separate confirmations.

## 4. Picture answers

Goal: upload handwritten work.

1. **inferred** `POST /api/homework/files/exercise/upload`, multipart `file`, `exerciseId`, `type=0`. Repeat per page, up to 8 pages per exercise.
2. **inferred** Collect the returned `data.url` values per exercise.
3. **unknown** The per-exercise key that carries image URLs inside `exercises[]` was not established. The client spreads its draft object and only guarantees `answer`. Capture one real submit in DevTools before writing this call from scratch, or use the shared-picture path below.
4. Alternative, when `GET /api/homework/student/shared-images/capabilities?homeworkId=N` reports the feature: **inferred** `POST /api/homework/student/shared-images/presign`, upload, then `POST /api/homework/student/shared-images {"homeworkId":N,"clientRequestId":"<uuid>","selectedExercises":[{"exerciseId":M}],"images":[{"fileId":"<id>"}]}`. This attaches one picture set to several exercises.
5. **inferred** Verify by re-reading `queryExercisesByHomeworkId` and checking `exercise_status.submitted` grew.
6. Typeset images count as 非手写. `handwriting_flag` and status `4` are final and block 订正, so upload a rendered card only when the user confirms the teacher accepts it. See `references/math-rendering.md`.

## 5. Finalize

Goal: 交卷 the whole 作业.

1. Preconditions above. Ask before sending: name the 作业, the exercise count already saved, and the late ratio. There is no undo.
2. **inferred** `POST /api/homework/student/homework/submit {"homeworkId":N,"exercises":[],"finalize":true}`.
3. **inferred** Success means `data.finalized == true`. On `data.finalized == false` show `msg` and do not claim success.
4. **verified** `submission_status` moves to `submitted`, then `completed` after grading catches up. Re-read the 作业 row to confirm.

An empty `exercises` array with `finalize: true` is the whole 交卷 operation. Sending answers and finalizing in one call is possible but leaves no way to tell which answers failed before the 作业 was filed.

## 6. Resubmit one exercise

Goal: 订正 a graded answer.

1. Preconditions above, plus `enableResubmit: true` and a remaining quota: `resubmitTimes`, `subjectiveResubmitTimes` (subjective), `objectiveResubmitTimes` (objective).
2. Status gates from the enum: `4` NOT_HANDWRITING and `5` PLAGIARISM carry `allowResubmit: false`. Do not retry those.
3. **inferred** Objective: `POST /api/homework/student/exercise/resubmit {"exerciseId":M,"objectiveAnswer":["A"]}`.
4. **inferred** Image: `POST /api/homework/student/exercise/resubmit {"exerciseId":M,"subQuestionNumbers":[],"subQuestionIndexes":[],"answerUrls":["https://..."]}`.
5. Each accepted call consumes one quota unit. Report the remaining count from the refreshed `resubmitTimes`.

## 7. Graded review

Goal: what the teacher marked and why.

1. **inferred** `queryExercisesByHomeworkId`, keep exercises with `status == 1`.
2. Report `markScore` against `score`, `markPayload` detail when present, and any `annotations`.
3. **inferred** Per-exercise 错因: `POST /api/homework/student/exercise/getErrorAnalysis {"homeworkId":N,"exerciseId":M}`.
4. **inferred** 优秀答案 for the whole 作业: `POST /api/homework/student/exercise/getExcellentAnswers {"homeworkId":N}`.
5. Statuses `-2` and `-1` mean the student must act: `-2` needs a new upload, `-1` is a grading failure the teacher retries. Neither is a scored result.

## 8. Appeal

Goal: challenge one 批改 result.

1. **inferred** `GET /api/appeal/student/info?homeworkId=N&exerciseId=M` for the current 申诉 state and remaining deadline.
2. **inferred** Deadline comes from `appealDeadlineType`; type `2` uses `customAppealDeadline`. Refuse when the deadline passed.
3. **unknown** Body for `POST /api/appeal/student/submit`. Capture it before calling.
4. **inferred** `POST /api/appeal/student/withdraw` pulls an appeal back.

## 9. Wrong-question book

Goal: what to review.

1. **inferred** `GET /api/wrong-question-book/?courseIds=7283&pageNo=1&pageSize=20`. The client joins `courseIds` with commas and repeats `pageNo`/`pageSize`.
2. **inferred** Practice attempt: `POST /api/wrong-question-book/{id}/practice-attempts`, then `GET` the same path for the attempt history.
3. Reading is free; each attempt adds a record.

## 10. Daily question

Goal: 每日一题.

1. **verified** `GET /api/practice/daily-question/courses`. An empty `list` means this deployment or course has no 每日一题 plan. Report that and stop.
2. **inferred** `GET /api/practice/daily-question/all?<query>` for the question set.
3. **inferred** `POST /api/practice/daily-question/{id}/submit`.

## 11. Online exam window

Goal: "还来得及吗" for a 限时考试.

1. `scene` is `online_exam`. **inferred** Start: `POST /api/homework/student/homework/startOnlineExam`, which sets `onlineExamStartedAt`.
2. **inferred** Client-side window math: deadline = `onlineExamStartedAt + examDurationMinutes` (default 120), capped by `endTime` and `personalLateDeadlineAt`. The client refuses interaction once `examServerNow` passes it.
3. `hideMarkUntilExamEnd: true` hides scores and answers until `endTime`. Do not tell the student their score during that window even when `markScore` is present.
4. 交卷 uses the same finalize call as workflow 5, and the server clock decides lateness.

## 12. Check-in

Goal: 签到.

1. **inferred** `GET /api/attendance/student/active` for the open session, `GET /api/attendance/student/records` for history.
2. **unknown** Body for `POST /api/attendance/student/checkin`. The client also sends GPS through `attendance/teacher/updateGPS` on the teacher side; the student side body was not captured.
3. Capture one check-in before automating it. Geo-fenced sessions fail silently in ways that look like a network error.

## Filling the unknown bodies

The unknown entries above need one real request each. DevTools, Network panel, "Preserve log", then perform the action once by hand. Both HAR files that produced this skill were captured that way; `references/capture-provenance.md` records the click path.
