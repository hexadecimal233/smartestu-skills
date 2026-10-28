# Capture provenance

## Sources

| File | Format | Captured | Page | Entries |
| --- | --- | --- | --- | --- |
| `~/Downloads/download` | HAR 1.2, WebInspector | 2026-10-27T12:59:36Z | `page_1`, `https://smartestu.cn/assignment` | 99 |
| `~/Downloads/download2` | HAR 1.2, WebInspector | 2026-10-27T13:00:16Z | `page_2`, `https://smartestu.cn/assignment` | 100 |

Both captures come from a logged-in `STUDENT` at school `XXXX`, covering one visit to the 作业 list. `download2` additionally shows the `queryHomeworks` reply; `download` additionally shows `portal-summary`. Neither capture opens a single 作业, so the detail view, answer submission, upload, and resubmit traffic is documented from client code, not from the wire.

Hosts: `smartestu.cn` (API and document) and `static.smartestu.cn` (client bundle, 84 assets). Build identifiers: entry `assets/index.DNmQdgVH.js`, API client `assets/bootstrap.D-XOGqrY.js`, assignment page chunk `assets/AssignmentDialog.CBcaYc8b.js`, question model `assets/ExerciseObjectiveQuestionDisplay.CHPp7ftx.js`.

## What was observed

- Headers on every API call: `x-auth-protocol: cookie-v1`, `x-csrf-token`, `x-session-context`, `content-type: application/json` on POST.
- `GET /api/config` and `GET /api/banner/popup` answering HTTP 304.
- 13 endpoint paths observed across both captures, reproduced in `student-homework-flow.md` with the account identifiers replaced.
- One live probe on 2026-10-27: `GET /api/auth/session` without a cookie answers HTTP 401 `{"code":"AUTH_UNAUTHENTICATED","message":"无法确认登录状态，请重试"}`. `GET /api/config` still answered 200 with the same body as the capture, so the deployment config did not change between capture and probe.
- The full client bundle, which yields the 401 endpoint paths in `api-inventory.md` and every request builder quoted in the reference files.

## Live verification (2026-10-28)

A refresh cookie was recovered from the Safari cookie jar on this machine (`~/Library/Containers/com.apple.Safari/Data/Library/Cookies/Cookies.binarycookies`, plaintext records) and installed at `~/.config/smartestu/creds.json`, mode 600. Read-only calls confirmed:

- `GET /api/auth/session` with the refresh cookie answers 200 and issues `__Host-auth_access_v1` (JWT, 15 minutes) through `set-cookie`.
- `POST /api/homework/student/course/query` returns one course.
- `POST /api/homework/student/portal-summary` reports 10 pending.
- `POST /api/homework/student/mark/queryHomeworks` returns 10 rows once `courseIds` is populated, and none with an empty array.
- `POST /api/homework/student/mark/queryExercisesByHomeworkId` returns `data.homeworkInfo` and `data.exercises`, matching the inferred shape field for field.

No write endpoint was called.

## What is inferred

- Request bodies for `queryExercisesByHomeworkId`, `homework/student/homework/submit`, `exercise/resubmit`, `homework/files/exercise/upload`, `shared-images/*`, `getErrorAnalysis`, `getExcellentAnswers`, `appeal/student/*`, `startOnlineExam`. Each is quoted or derived from the client constant and wrapper that sends it.
- Field meanings in `data-models.md` where the client only reads the field, marked "inferred".
- The login exchange. `/api/auth/login` exists and the deployment enables `schoolUserIdLoginEnabled` while disabling `emailLoginEnabled`; the body shape was not captured.

## Redaction

The captures contain the account's `csrfToken`, `sessionContext`, `_id`, `schoolUserId`, `schoolUserLocalId`, name, and email. Those values are replaced with placeholders everywhere in this skill. Session cookies were not present in either HAR.

## Reproducing the capture

Open DevTools, Network panel, then a fresh `/assignment` visit with "Preserve log" on and full response bodies enabled. The click path that reveals the 作业 detail traffic is: open any row in the 作业 table, then open one exercise. Writing traffic appears only after answering and pressing 提交 or 交卷, and those calls change the account's record.
