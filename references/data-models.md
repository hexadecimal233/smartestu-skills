# Data models

Field lists below come from the 作业 object observed in `queryHomeworks`, from the normalizers in `AssignmentDialog.CBcaYc8b.js`, and from `ExerciseObjectiveQuestionDisplay.CHPp7ftx.js` for question structure. Type and meaning claims are marked "inferred" where the client only reads the field.

## Homework object

Returned by `queryHomeworks` and repeated inside `queryExercisesByHomeworkId` as `data.homeworkInfo`.

| Field | Observed example | Meaning |
| --- | --- | --- |
| `id` | `42863` | 作业 id |
| `name` | `两个重要的极限` | 作业 title |
| `startTime` | `2026-10-26T00:56:03.301Z` | open time, UTC |
| `endTime` | `2026-11-02T04:00:03.300Z` | deadline, UTC |
| `teacherId` | `<school id>-<teacher id>` | teacher `schoolUserId` |
| `teacherName` | `<teacher name>` | |
| `type` | `1` | publish form value, meaning not established |
| `totalScore` | `"100"` | string |
| `baseScore` | `"8"` | string, per-exercise base score |
| `enableMark` | `0` | 批改开关 set by the teacher at publish time; the client also reads `enableMark===1` as "result visible" (inferred) |
| `enableAns` | `1` | 1 = 答案可看 (inferred from the publish form toggle and `answerStructure: null` handling) |
| `homeworkType` | `"normal"` | other values unknown |
| `scene` | `"homework"` | `homework`, `online_exam`, `preview` |
| `enableResubmit` | `true` | 订正开关 |
| `resubmitTimes` | `1` | total 订正 quota |
| `subjectiveResubmitTimes` | `1` | quota for subjective exercises |
| `objectiveResubmitTimes` | `0` | quota for objective exercises |
| `resubmitAnswerRevealMode` | `"legacy_any_resubmit"` | answer reveal policy on 订正; other values unknown |
| `customAnswerTime` | `null` | answer release time override |
| `includeInFinalGrade` | `true` | counts toward 总评 |
| `appealDeadlineType` | `1` | `2` selects `customAppealDeadline` (inferred from publish form) |
| `customAppealDeadline` | `null` | ISO string when type is 2 |
| `allowLateSubmission` | `true` | late 交卷 allowed |
| `lateSubmissionScoreRatio` | `100` | percent multiplier for late work |
| `examDurationMinutes` | `null` | online exam length |
| `hideMarkUntilExamEnd` | `false` | online exam score suppression |
| `tieredStudentTierMap` | `null` | 分层作业 tier for this student |
| `score` | `0` | earned score |
| `status` | `0` | homework-level status, enum not established |
| `sharedGradingPending` | `false` | 协作批改 in progress |
| `submission_status` | `"not_submitted"` | `not_submitted`, `submitted`, `completed` |
| `review_status` | `"not_reviewed"` | `not_reviewed`, `need_review` |
| `exercise_status` | see below | per-homework counters |
| `onlineExamStartedAt` | `null` | set by `startOnlineExam` |
| `onlineExamEndedAt` | `null` | |
| `personalLateDeadlineAt` | `null` | per-student extended deadline |
| `personalLateScoreRatio` | `null` | per-student late multiplier |
| `examServerNow` | `2026-10-27T13:00:19.054Z` | server clock, authoritative for deadlines |

`exercise_status`:

```json
{"total":3,"submitted":0,"graded":0,"pending":0,"disputed":0,"image_problem":0,"handwriting_flagged":0,"plagiarism_flagged":0,"total_score":0}
```

## Exercise object

`queryExercisesByHomeworkId` → `data.exercises[]`. The client normalizer reads these fields:

| Field | Meaning |
| --- | --- |
| `id` | exercise id, used by submit and resubmit |
| `name` | short label, falls back to `第N题` |
| `questionNum`, `displayNum` | numbering shown to the student |
| `score` | full score for the exercise |
| `markScore` | earned score, present once graded |
| `markPayload` | grading detail blob |
| `status` | exercise status enum, see below |
| `questionStructure` | stem, options, statements; JSON string or object |
| `answerStructure` | reference answer, same shape; null while withheld |
| `studentAnswerRaw` | raw objective answer text |
| `answerImages` | array of image URLs the student uploaded |
| `answerImageIndexes` | page order for `answerImages` |
| `annotations` | teacher pen annotations |
| `studentSubExercise` | earlier attempts for 小题, each with `id`, `status`, `answer[]`, `annotations` |
| `resubmitTimes` | remaining 订正 count |
| `returnedCount`, `returnedAtList`, `returnedRecords` | 打回 history |
| `imageProblemType` | set when `status` is `-2` |
| `handwriting_flag`, `plagiarism_flag` | detection flags |
| `sharedGradingPending` | |
| `objectiveOutcomeReveal` | `partial` shortens what is shown before 交卷 |
| `pageNumber` | `>= 0` marks a 整页扫描 exercise |
| `hideQuestionStem` | 学校 hides the stem (`workbookHideQuestionStemSchools`) |

## Exercise status enum

Signed values, identical to the teacher console badge enum.

| Value | Name | Label |
| --- | --- | --- |
| `-2` | IMAGE_PROBLEM | 图片问题, needs a new upload |
| `-1` | GRADING_FAILED | 批改失败 |
| `0` | SUBMITTED | 批改中 |
| `1` | GRADED | 已批改 |
| `3` | DISPUTED | 有异议 |
| `4` | NOT_HANDWRITING | 非手写, final |
| `5` | PLAGIARISM_SUSPECTED | 抄袭 |
| `6` | SUSPECTED_NOT_HANDWRITING_OR_PLAGIARISM | 疑似非手写或抄袭 |
| `7` | APPEAL_PROCESSED | 申诉已处理 |

Status `2` is absent from the enum; gaps are real, not extraction errors.

## Question structure

`questionStructure` parses to one of these shapes.

Plain single question:

```json
{
  "mainQuestion": {
    "id": 9001,
    "questionNum": "1",
    "questionType": "mcq_single",
    "questionMd": "题干 Markdown，含 LaTeX",
    "mcqSpec": {"options": [{"id": "A", "text": "..."}, {"id": "B", "text": "..."}]},
    "tfSpec": null
  }
}
```

`questionType` values seen in the client: `subjective`, `mcq_single`, `mcq_multi`, `tf_multi`, `objective_group`.

| Type | Answer shape | Spec |
| --- | --- | --- |
| `mcq_single` | array with one option id | `mcqSpec.options[].id`, `.text` |
| `mcq_multi` | sorted array of option ids | same |
| `tf_multi` | object `{statementId: true|false}` | `tfSpec.statements[].id`, `.text` |
| `subjective` | uploaded images | none |
| `objective_group` | one answer per 小题 | `subQuestions[]`, each with its own `questionType`, `mcqSpec`, `tfSpec` |

Merged multi-question group (several questions sharing one stem):

```json
{
  "_metadata": {"isMerged": true},
  "questions": [{"mainQuestion": {"questionType": "mcq_single", "questionMd": "..."}}]
}
```

The client treats a merged block with two or more objective sub-questions as one `objective_group` exercise and renders the sub-questions in sequence.

## Reveal rules

The reference answer reaches the client only when every gate allows it. Gates are `enableAns`, `hideMarkUntilExamEnd` (online exam not finished), `resubmitAnswerRevealMode`, `objectiveOutcomeReveal === "partial"`, and the per-school `workbookHideQuestionStemSchools` list. A null `answerStructure` means at least one gate is closed.

## Student-visible endpoints for these models

Read-only, verified envelope, safe to call repeatedly:

- `POST /api/homework/student/course/query`
- `POST /api/homework/student/mark/queryHomeworks`
- `POST /api/homework/student/mark/queryExercisesByHomeworkId`
- `POST /api/homework/student/portal-summary`
- `GET /api/homework/user/school-info`
- `GET /api/course-contents/student/courses`
- `GET /api/wrong-question-book/?<query>`
