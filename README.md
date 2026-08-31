# LearnSpace LMS — Full Project Workflow Documentation

> This document is the complete working-flow reference for the **LearnSpace** Learning Management System (LMS) — also referred to internally as "SkillBridge"/"SkillForge" in some mail/legacy strings. Use it as context to understand every feature, API, data flow, and especially the **Certificate GET/Issue flow**.

---

## 1. What the Platform Is

LearnSpace is a full-stack LMS where:

- **Students** register, browse a published course catalog, enroll, learn lessons one-by-one (lessons unlock sequentially by passing each lesson quiz), take a final course quiz, submit a **capstone project** (GitHub repo + live demo link), get it reviewed by an admin, and — after approval — receive an official **completion certificate (PDF)** which they can preview/download.
- **Admins** build courses (4-step wizard: basic info → lessons → quizzes → capstone), manage students (block/activate, adjust reputation points), review & approve/reject capstone submissions, issue/delete certificates, and monitor the platform via a rich dashboard (counters, growth charts, leaderboard, activity feed).
- Both roles get a built-in **AI coding tutor** ("LearnSpace AI") backed by NVIDIA NIM (Nemotron) API.
- Auth is **JWT access token (short-lived) + httpOnly refresh-token cookie (7 days)** with a **tokenVersion** mechanism for logout-all/session invalidation.

Repo layout (Windows, `S:\LMS-Learning Platform`):

```
backend/    Express (ESM) REST API  — port 3000
frontend/   React 19 + Vite + MUI + Tailwind SPA — port 5173 (also 5174 allowed by CORS)
```

---

## 2. Tech Stack

### Backend (`backend/`)
- Node.js + **Express 5** (ES Modules, `import` syntax)
- **Mongoose 9** (MongoDB ODM)
- **JWT** (`jsonwebtoken` 9) — access + refresh tokens
- **bcryptjs** — password hashing
- **cookie-parser** — reads refresh cookie
- **multer** (memory storage) — file uploads (images, markdown, CSV)
- **multer-storage-cloudinary** + **cloudinary** — image hosting (course thumbnails, avatars, etc.)
- **nodemailer** — Gmail SMTP for password-reset emails
- **pdfkit** + **qrcode** — certificate PDF generation (template-image based)
- **csv-parse/sync** + **gray-matter** — CSV/Markdown ingestion for lessons & quizzes
- `dev` script: `node --watch src/server.js`

### Frontend (`frontend/`)
- **React 19** + **Vite**
- **Redux Toolkit 2** (slices + async thunks; no RTK Query)
- **axios** with interceptors (auto token refresh + request queueing)
- **react-router-dom 7** (`createBrowserRouter`)
- **MUI 9**, **Tailwind/shadcn**, **framer-motion**, **gsap** (custom `animation/` components like `TypeWriter`, `Text`, `Seperator`, `Scroll`)
- **chart.js + react-chartjs-2** (dashboard charts)
- **react-markdown + remark-gfm + react-syntax-highlighter** (AI chat rendering)
- **react-hot-toast** (toasts), **jspdf** (client-side PDF helpers)

---

## 3. Environment Variables

Both `.env` files are gitignored; names are read from code:

### Backend (`backend/.env`)
| Variable | Used for |
|---|---|
| `PORT` | API port (default `3000`) |
| `MONGO_URI` | MongoDB connection string (required; checked at boot) |
| `ACCESS_TOKEN_SECRET` | Signs access JWT |
| `REFRESH_TOKEN_SECRET` | Signs refresh JWT |
| `ACCESS_TOKEN_EXPIRY` | e.g. `15m` (default `15m`) |
| `REFRESH_TOKEN_EXPIRY` | e.g. `7d` (default `7d`) |
| `CLIENT_URL` | Frontend base URL for reset links (default `http://localhost:5173`) |
| `FRONTEND_URL` | Used as the certificate **verification QR URL** (see §Certificates) |
| `NVIDIA_API_KEY` | LearnSpace AI (NVIDIA NIM chat completions) |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail + **App Password** for nodemailer |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary uploads |

### Frontend (`frontend/.env`)
| Variable | Used for |
|---|---|
| `VITE_API_URL` | API base URL (default `http://localhost:3000/api`) |

---

## 4. Authentication & Session Flow

Middlewares: `backend/src/middlewares/auth.middleware.js`

- `protect` — validates `Authorization: Bearer <accessToken>`, decodes with `ACCESS_TOKEN_SECRET`, loads the user, rejects if user missing/inactive, and **rejects if `decoded.tokenVersion !== user.tokenVersion`** (immediate revoke after logout-all).
- `authorize(...roles)` — role gate (`ADMIN`, `STUDENT`).

Endpoints (`routes/auth.routes.js`, controller `controllers/authController.js`):
1. `POST /api/auth/register` — students only. Admin role rejected on public route. Lowercases email, bcrypt-hashes password.
2. `POST /api/auth/login` — verifies credentials + `isActive`; on success calls `generateTokens(user, res)`.
3. `POST /api/auth/refresh` — reads `refreshToken` **cookie**, verifies with `REFRESH_TOKEN_SECRET` + tokenVersion, issues a fresh pair.
4. `POST /api/auth/logout` (protect) — clears the refresh cookie.
5. `POST /api/auth/logout-all` (protect) — `$inc tokenVersion` (kills all sessions immediately) + clears cookie.
6. `POST /api/auth/forgot-password` — if email exists, creates 32-byte hex token, stores `sha256(token)` + 15-min expiry, emails `CLIENT_URL/reset-password/<token>`. **Always returns the same "sent" message** (no user enumeration).
7. `POST /api/auth/reset-password/:token` — validates hashed token + expiry, rehashes password, **increments tokenVersion** (logs out all sessions), clears reset fields.

`utils/generateTokens.js`:
- Access token payload: `{ userId, role, tokenVersion }`, expiry `ACCESS_TOKEN_EXPIRY` (default 15m).
- Refresh token payload: `{ userId, tokenVersion }`, expiry `REFRESH_TOKEN_EXPIRY` (default 7d).
- Refresh token set as **httpOnly cookie** `refreshToken`, `sameSite: lax`, 7-day maxAge.
- Response JSON: `{ success, accessToken, user: { id, name, email, role } }`.

### Frontend auth wiring
- `services/axios.js` — axios instance `baseURL = VITE_API_URL || http://localhost:3000/api`, `withCredentials: true`. Request interceptor attaches `Bearer` token from Redux. Response interceptor on **401** (excluding login/register/refresh): single-flight refresh via `POST /auth/refresh`, queues concurrent requests (`refreshSubscribers`), dispatches `auth/setAccessToken`, retries original request; on refresh failure dispatches `auth/logoutLocal`.
- `features/auth/` — `authSlice` (state: user, accessToken, isAuthenticated, rehydrating, loading, error, success, message), `authThunks` (`registerUser`, `loginUser`, `refreshUser`, `logoutUser`, `logoutAllDevices`, `forgotPassword`, `resetPassword`), `authApi`.
- `App.jsx` dispatches `refreshUser()` on mount (rehydrates session from cookie).
- Guards: `ProtectedRoute` (waits for `rehydrating`, redirects anonymous to `/`), `RoleRoute` (role-based; else `/unauthorized`), `RootRedirect` (landing → `/admin/dashboard`, `/student/dashboard`, or `/company/dashboard` by role).
- Login/Register pages: `pages/auth/*`.

---

## 5. Data Models (`backend/src/models/*`)

| Model | Key fields |
|---|---|
| **User** | `name, email (unique), password (hashed), role (STUDENT/ADMIN), isActive, tokenVersion, resetPasswordToken, resetPasswordExpires`. `toJSON` strips secrets. |
| **StudentProfile** | `userId (unique), bio, githubProfile, linkedinProfile, avatar, verifiedSkills[] (array of course categories), reputationPoints, completedCoursesCount, completedProjectsCount`. |
| **Course** | `title, category, description, thumbnailUrl, quiz[] (final quiz: {question, options[4], correctOptionIndex}), passingPercentage (default 70), lessonQuizPassingPercentage (default 70), quizTimeLimitMinutes (default 45), capstoneProject {title, description, submissionRequirements}, isPublished, publishedAt, createdBy`. |
| **Lesson** | `courseId, lessonNumber, title, topicHeading, definition, detailedMeaning, example, codeExample, codeExampleExplanation, videoUrl, notesPdfUrl, markdownSource, isPublished`. Content comes from markdown upload (see §7). |
| **LessonQuizQuestion** | `lessonId, questionNumber, question, options[4], correctOptionIndex`. |
| **CourseProgress** | `studentId, courseId, enrolledAt, lastAccessedLessonId, completedLessons[], lessonProgress[] {lessonId, quizScore, quizAttempts, isQuizPassed, isCompleted, lastAccessedAt}, progressPercentage, quizScore, isQuizPassed, finalQuizAttempts, isCapstoneUnlocked, isCompleted, courseCompletedAt`. |
| **QuizAttempt** | `studentId, courseId, lessonId, quizType (LESSON/FINAL_COURSE), score, totalQuestions, correctAnswers, percentage, passingPercentage, passed, startedAt, submittedAt, timeTakenSeconds`. |
| **CapstoneSubmission** | `studentId, courseId, githubRepoUrl, liveDemoUrl, status (PENDING/APPROVED/REJECTED), adminFeedback, reviewedBy, reviewedAt, submissionVersion, certificateIssued (bool), certificateIssuedAt`. |
| **Certificate** | `studentId, studentName, studentEmail, certificateType (COURSE_COMPLETION / COMPANY_PROJECT; app only issues COURSE_COMPLETION today), status (SENT/REVOKED), issuerType (ADMIN), issuedBy, courseId, capstoneSubmissionId, projectId (legacy), title, websiteName, description, metadata {studentName, entityName, subtitle, companyName, score}, pdfUrl (e.g. /uploads/certificates/SBF-2026-XXXX.pdf), certificateCode, issueDate, createdAt`. |

---

## 6. Student Experience (End-to-End)

Routes: `routes/student.routes.js` + `routes/student/studentCertificate.routes.js`. All guarded `[protect, authorize("STUDENT")]`. Base: `/api/student`.

### 6.1 Profile
- `GET /profile/me` — creates the StudentProfile on first hit (`createOrGetStudentProfile`).
- `PUT /profile/me` — multipart (`avatar` image → Cloudinary folder `student-avatars`) + fields `bio, githubProfile, linkedinProfile`.

### 6.2 Dashboard — `GET /dashboard`
Computes and returns:
- `stats`: enrolledCourses, overallProgress (mean of `progressPercentage`), completedCourses, certificatesCount, totalLessonsCompleted, avgQuizScore, reputationPoints, verifiedSkillsCount, capstoneSummary {PENDING, APPROVED, REJECTED}.
- `recentCourses` (last 6 touched), `progressDistribution` (6 buckets: Not Started/1–25/26–50/51–75/76–99/Completed), `learningActivity` (per-month lesson completions, last 6 months), `recentCertificates` (up to 4).
- Sources: `CourseProgress` (populated with course title/category/thumbnail), `Certificate`, and an aggregate of `CapstoneSubmission` grouped by status.

### 6.3 Course Catalog — `GET /courses`
Returns published courses (`isPublished: true`) enriched with `lessonCount` and `isEnrolled` (set membership against the student's `CourseProgress`).

### 6.4 Enroll — `POST /courses/:courseId/enroll`
- Only published courses. If no `CourseProgress` exists, creates one (0% progress). Idempotent: already-enrolled → 200 with existing progress.

### 6.5 My Courses — `GET /my/courses`
Returns all `CourseProgress` populated with course info, newest enrollment first.

### 6.6 Learn — `GET /courses/:courseId/learn`
Gate: course must be published **and** student enrolled. Returns:
- `course` (title, category, description, thumbnail, passingPercentage, lessonQuizPassingPercentage, quizTimeLimitMinutes, capstoneProject),
- `progress` snapshot (progressPercentage, completed/total lessons, isQuizPassed, quizScore, isCapstoneUnlocked, isCompleted, lastAccessedLessonId),
- `lessons[]` sorted by lessonNumber, each with full content + `mcqCount`, `isUnlocked`, `isCompleted`, `isQuizPassed`, `quizScore`, `quizAttempts`.
- **Unlock rule**: lesson 1 is always unlocked; each subsequent lesson unlocks only when all prior lessons are completed. A lesson is completed when its lesson quiz is passed.

### 6.7 Lesson Quiz
- `GET /lessons/:lessonId/quiz` — returns question text + options (never `correctOptionIndex`) + lesson meta; requires enrollment.
- `POST /lessons/:lessonId/quiz/submit` — body `{ answers: [{ questionId, selectedIndex }] }`. Grades against the DB questions, passes if `percentage >= course.lessonQuizPassingPercentage` (default 70).
  - Records a `QuizAttempt` (`quizType: "LESSON"`).
  - Updates per-lesson `lessonProgress` entry (`quizScore`, `quizAttempts++`, `isQuizPassed`); on pass marks lesson complete.
  - Recomputes `progressPercentage = completedLessons.length / totalLessons * 100`.

### 6.8 Final Course Quiz
- `GET /courses/:courseId/quiz` — **requires 100% lesson completion** (`progressPercentage === 100`). Returns final quiz questions (no answers), time limit, passing %.
- `POST /courses/:courseId/quiz/submit` — body `{ answers: [...] }`. Grades against `course.quiz`. On pass sets `isQuizPassed`, `quizScore`, and **`isCapstoneUnlocked = true`**. Records `QuizAttempt` (`quizType: "FINAL_COURSE"`), increments `finalQuizAttempts`.

### 6.9 Capstone
- `GET /courses/:courseId/capstone` — returns the student's submission for that course (or null).
- `POST /courses/:courseId/capstone/submit` — body `{ githubRepoUrl, liveDemoUrl }` (both required). Gates: enrolled + `isCapstoneUnlocked`.
  - If previous submission exists & is APPROVED → blocked (cannot resubmit).
  - Otherwise resubmission updates URLs, resets to PENDING, clears feedback/reviewer, **increments `submissionVersion`**. New submissions start at `PENDING` version 1.

### 6.10 Certificates (student side)
- `GET /student/certificates` — returns `{ courseCompletion: [], companyProject: [] }`; course column = `COURSE_COMPLETION` records with `status != REVOKED`, populated with `courseId`. The **companyProject column is currently always empty** (no project flow exists yet).
- `GET /student/certificates/:certificateId/pdf` — ownership-checked ✓, streams the stored PDF from `uploads/certificates/<name>.pdf` as `attachment; filename="<certificateCode>.pdf"`.
- Frontend `pages/student/Certificates.jsx` — fetches list, and each card offers **"Download PDF"** (blob → temp `<a download>`) and **"View Online"** (`http://localhost:3000/uploads/certificates/<certificateCode>.pdf` — note: **hardcoded localhost:3000**, see §Known Issues).

---

## 7. Admin Experience (End-to-End)

All admin routes `[protect, authorize("ADMIN")]`. Bases: `/api/admin/...`.

### 7.1 Dashboard (`adminDashboardController.js`)
- `GET /api/admin/dashboard/stats` — counters: students (total/new-this-week/new-this-month), courses (total/active/draft/new-this-month), lessons (total/published), capstones (pending/approved/rejected), certificates (total/new-this-month/revoked). Plus 6-month **growth series** (students, courses, certificates) and top-6 **category distribution**.
- `GET /api/admin/dashboard/pending` — up to 10 pending capstones (oldest first).
- `GET /api/admin/dashboard/activity` — merged recent feed (course created, certificate issued, capstone submitted/approved/rejected), newest 10.
- `GET /api/admin/dashboard/leaderboard?limit=` — top students by `reputationPoints` → `completedCoursesCount` → `completedProjectsCount`.
- `GET /api/admin/dashboard/courses` — per-course overview incl. lesson counts + capstone submission counts.

### 7.2 Students (`adminStudentController.js`)
- `GET /api/admin/students` — search (name/email regex), `skill` filter on `profile.verifiedSkills`, `status` filter (ACTIVE/BLOCKED), sort, pagination.
- `GET /api/admin/students/leaderboard` — paginated ranked list (`rank` computed from offset), search/skill filters.
- `GET /api/admin/students/:studentId` — full audit: profile, course progress (populated), quiz attempts (populated), capstone submissions (populated), `leaderboardRank`, summary counters.
- `PATCH /api/admin/students/:studentId/status` — `{ isActive: boolean }` activate/block.
- `PATCH /api/admin/students/:studentId/reputation` — `{ points, operation: ADD|SUBTRACT|SET, reason<=500 }`.
- `GET /api/admin/students/:studentId/course-progress` and `.../quiz-history` — per-student audits.
- *(Badge endpoints removed; `skillBadges` fields removed from code.)*

### 7.3 Courses (`adminCourseController.js`)
- `POST /api/admin/courses` — create draft. Required: `title, category, description` + thumbnail image file (`thumbnail` field → Cloudinary `skillforge/courses/thumbnails`). Optional: `passingPercentage, quizTimeLimitMinutes, lessonQuizPassingPercentage`. Duplicate title → 409.
- `GET /api/admin/courses` — search/category/status(PUBLISHED|DRAFT)/pagination.
- `GET /api/admin/courses/:courseId` — course + lessons (with `mcqCount` each).
- `PUT /api/admin/courses/:courseId` — edit fields/thumbnail.
- `PATCH /api/admin/courses/:courseId/capstone` — `{ capstoneTitle, capstoneDescription, submissionRequirements }`.
- `DELETE /api/admin/courses/:courseId` — only unpublished courses; deletes lessons too.
- `PATCH /api/admin/courses/:courseId/publish` — **publish gate**: ≥1 lesson, every lesson has ≥1 MCQ, final quiz between **10–50 MCQs**, capstone title+description complete. Sets `isPublished: true, publishedAt`.
- `PATCH /api/admin/courses/:courseId/unpublish`.

### 7.4 Lessons (`adminLessonController.js`) — `POST/GET/DELETE`
- `POST /api/admin/lessons/course/:courseId/markdown` — single `.md` (field `lessonFile`) parsed by `utils/parseMarkdown.js`. **Markdown format required** (`# Title` + `## Topic`, `## Definition`, `## Detailed Meaning`, `## Example`, `## Code Example` (optional fenced block), `## Code Explanation`, `## Video`, `## Notes`). Definition/Detailed Meaning/Example are **required**. `lessonNumber` auto-increments from existing max. Errors => 400 with message. Rejects if course is published.
- `POST /api/admin/lessons/course/:courseId/markdown-with-mcq` — single request: fields `lessonFile` (.md) + `lessonMcqCsv` (.csv). Creates lesson THEN parses CSV (columns `question, optionA, optionB, optionC, optionD, correctOptionIndex`); invalid CSV **rolls back the lesson**.
- `POST /api/admin/lessons/course/:courseId/markdown/bulk` — up to 50 `.md` files (field `lessonFiles`) in one request; sequential numbering; duplicate title aborts entire batch.
- `GET /api/admin/lessons/course/:courseId` — lessons with mcq counts.
- `DELETE /api/admin/lessons/:lessonId` — deletes lesson + its MCQs; blocked for published courses.

### 7.5 Quizzes
- Lesson MCQs: `POST /api/admin/lesson-quizzes/lesson/:lessonId/csv` (field `csvFile`; **replaces** existing MCQs), `GET .../:lessonId`, `DELETE .../:lessonId` (blocked when course published). CSV same column contract as above.
- Final quiz: `POST /api/admin/course-quizzes/course/:courseId/final-quiz/csv` — parses CSV onto `course.quiz`; hard gate **10 ≤ rows ≤ 50**.

### 7.6 Capstone Review (`adminCapstoneController.js`)
- `GET /api/admin/capstones/stats` — total/pending/approved/rejected counts.
- `GET /api/admin/capstones/pending?page&limit` — pending queue (oldest first), populated student + course.
- `GET /api/admin/capstones?search&status&page&limit` — aggregation pipeline with `$lookup` on users+ courses; searches `student.name`, `student.email`, `course.title`; status whitelist PENDING/APPROVED/REJECTED. **Calls `reconcileCertificateIssuedStates()` first** (self-healing — see §8.5).
- `GET /api/admin/capstones/:submissionId` — detail: submission + `studentProfile` + `courseProgress` (fields for quiz/capstone flags).
- `PATCH /api/admin/capstones/:submissionId/approve` — body `{ feedback? }`. Requires: submission not already APPROVED, real student, `progress` exists, `isCapstoneUnlocked` true. Sets status=APPROVED, `reviewedBy`, `reviewedAt`; **marks course progress `isCompleted=true, courseCompletedAt`**; increments profile `completedCoursesCount`. → **This is the trigger that makes a certificate issuable.**
- `PATCH /api/admin/capstones/:submissionId/reject` — feedback **required** (≤2000 chars). Cannot reject an approved capstone.

### 7.7 Certificates (`adminCertificateController.js`) — see next section (the star feature).

---

## 8. ⭐ The Certificate GET / ISSUE Process (Detailed)

This is the exact flow for generating and issuing a completion certificate.

### 8.0 Concept
A certificate is generated server-side with **PDFKit** from the official template image `backend/src/utils/certificate.png` (1492 × 1054 px, A4 landscape). Dynamic data (student name, course title, issue date, certificate code, score, issuer) is drawn over template anchors; the **legacy QR code on the template is covered up and replaced** by a freshly generated QR linking to the platform website. Signature names are drawn in a handwriting font (Kalam). The PDF is streamed to the admin for a WYSIWYG preview, then persisted as `<certificateCode>.pdf` under `backend/uploads/certificates/`.

### 8.1 Ready-to-issue conditions (admin viewpoint)
A submission shows the **"🎓 Issue Certificate"** button only when:
1. Capstone status === `APPROVED` (via `/approve`), AND
2. `capstone.certificateIssued === false`.

### 8.2 Step 1 — Preview (no persistence)
**`POST /api/admin/certificates/preview`** — body `{ capstoneSubmissionId }`.

1. `loadCapstoneContext(id)`:
   - `CapstoneSubmission.findOne({ _id, status: "APPROVED" })` — **must be APPROVED**, else 404.
   - Loads `student` (User), `course` (Course). Returns `score` = `progress.quizScore` **only if** `progress.isQuizPassed`.
2. Builds dynamic data:
   - `studentName = student.name`
   - `courseTitle = course.title`
   - `certificateCode = makeCertificateCode()` = `SBF-<YEAR>-<8 chars from "ABCDEFGHJKLMNPQRSTUVWXYZ23456789">` (no 0/O/1/I — human-friendly).
   - `issueDate = formatDate(new Date())` → `Intl.DateTimeFormat("en-GB", {day:"2-digit", month:"short", year:"numeric"})` e.g. `29 Aug 2026`.
   - `preview = buildCertificatePreviewData({ studentName, courseTitle, courseDescription: course.description || "", certificateCode, issueDate, score: score != null ? score+"%" : "" })` (truncation/sizing logic).
3. `generateCertificateFromTemplate({ studentName, courseTitle, certificateCode, issueDate, score, companyName: CERT_ISSUER, verificationUrl: PLATFORM_BRAND.website })` → PDF buffer.
4. Streams back as `application/pdf`, `Content-Disposition: inline; filename="certificate-preview-<code>.pdf"`.
5. **Nothing is written to the DB or disk.**

**Frontend path:** admin clicks "Issue Certificate" → dispatches `previewCertificate(submission._id)` (`adminCertificateThunks`). API called with `responseType: "blob"`, the blob is turned into `URL.createObjectURL(blob)`, slice stores `preview = { url }`. `CapstoneReview.jsx` renders `<iframe src={certPreview.url}>` inside the "Certificate Preview" modal. The **"Issue & Send"** button is disabled until `certPreview?.url` exists. Object URLs are revoked in the slice on clear / re-preview / rejection.

### 8.3 Step 2 — Send / Issue (persists)
**`POST /api/admin/certificates/send`** — body `{ capstoneSubmissionId }`.

1. Same `loadCapstoneContext` (must be APPROVED).
2. **Duplicate guard:** if `capstone.certificateIssued` → 409 "already been issued".
3. Recomputes code/date/preview identically to preview (so the sent PDF matches what was previewed).
4. `generateCertificateFromTemplate(...)` with `companyName: CERT_ISSUER` and `verificationUrl: PLATFORM_BRAND.website`.
5. `fs.mkdirSync(CERT_STORAGE_DIR, { recursive: true })`; writes `<certificateCode>.pdf`.
6. `pdfUrl = "http://localhost:3000/uploads/certificates/<fileName>"` (**hardcoded host — see Known Issues**).
7. **Creates the `Certificate` record:**
   - `studentId, studentName, studentEmail`
   - `certificateType: "COURSE_COMPLETION"`, `status: "SENT"`
   - `issuerType: "ADMIN"`, `issuedBy: req.user._id`
   - `courseId`, `capstoneSubmissionId`
   - `title: "Certificate of Completion - <courseTitle>"`
   - `websiteName: CERT_ISSUER`  (≡ **"LearnSpace"**)
   - `description: preview.courseDescription || ""` ← (previously a bug referenced an undefined `courseDescription`; **fixed** to use the preview payload)
   - `metadata: { studentName, entityName: courseTitle, subtitle: "", companyName: CERT_ISSUER, score }`
   - `pdfUrl`, `certificateCode`, `issueDate: now`.
8. **Verified skill badge:** takes `course.category`, and `$addToSet`s it into `StudentProfile.verifiedSkills` (upsert w/ defaults).
9. Marks `capstone.certificateIssued = true; certificateIssuedAt = now`.
10. Returns `201 { success, message, certificate }`.

**Frontend path:** `handleSendCertificate()` in `CapstoneReview.jsx` dispatches `sendCertificate(certificateTarget._id)` → success toast → closes modal → calls `refreshData()` so `certificateIssued` shows "🎓 Certificate Issued" badge. Admin Certificates page (`/admin/certificates`) then lists it.

### 8.4 Certificate listing & deletion
- `GET /api/admin/certificates?type=COURSE_COMPLETION` — newest first, populated course + issuer; also calls `reconcileCertificateIssuedStates()` first.
- `DELETE /api/admin/certificates/:certificateId` — **cascade delete**:
  1. removes the PDF from disk (`removePdfFile`),
  2. resets linked capstone: `certificateIssued=false, certificateIssuedAt=null` (button reappears),
  3. deletes the Certificate record,
  4. **removes the verified skill** (course category pulled from `StudentProfile.verifiedSkills`) **only if no other certificate remains for that student+course**.

### 8.5 Reconciliation self-healing — `utils/certificateSync.js`
`reconcileCertificateIssuedStates()` (called on capstone list, certificate list — so it runs before admin opens these pages) does:
1. **Orphan cleanup:** any COURSE_COMPLETION cert whose capstone is neither APPROVED-subbed nor exists → PDF removed + cert deleted.
2. **Dedupe:** multiple certs per capstone → keep oldest, delete others + their PDFs.
3. **Flag fix:** for each APPROVED capstone, `certificateIssued`, `certificateIssuedAt` synced to whether a cert exists for it (so manual DB edits show correctly in UI).

### 8.6 Template geometry (`utils/certificateGenerator.js`)
- Template: `certificate.png` 1492×1054, A4 landscape (`841.89 × 595 pt`), scale `IMG_TO_PT = 841.89 / 1492 ≈ 0.564269`.
- Colors: paper `#F9F7F3`, greenDark `#032A18`, green `#0B3B27`, ink `#122A1E`.
- Dynamic-value anchor lines (template px): **name y=504, course y=626, issue date y=456, issued-by y=574, code y=690, score y=808**; value column x 180–366 (center ≈273). Text is auto-fitted with a fallback chain (must stay within the area; oversized names shrink).
- **QR replacement:** legacy QR block occupies x1232–1374 y532–676; a cover rect (x1190–1410 y498–694, paper color) hides it; a fresh QR is drawn centered at **(1309, 605)**, size `px(142)`, encoding `PLATFORM_BRAND.website` (== `FRONTEND_URL` env; fallback `https://skillbridge-lms.example.com`).
- **Do not cover:** gold ornament (y≈695–705) and its caption (y≈725–760).
- **Issuer:** `CERT_ISSUER = "LearnSpace"` — used for the issuer line, Certificate `websiteName`, `metadata.companyName`, and generator default company name.
- **Signatures:** `DEFAULT_ADMINISTRATORS = ["Anish", "Rishabh", "Raj"]`. Template already prints `ADMINISTRATOR` role labels at y≈987–1000; three signature line anchors: `(cx=292, y=947, angle=-5°)`, `(cx=616, y=949, angle=3°)`, `(cx=1030, y=947, angle=-2°)`. Names drawn in **Kalam-Regular.ttf** (`backend/src/utils/fonts/`):
  - Kalam metrics: em=1000, ascent=1063 (ratio 1.063), descent=531 (ratio 0.531); per-char GDI width ratios: Anish 3.66, Rishabh 5.00, Raj 2.24.
  - A single uniform `signatureSize = 24` is computed from the **widest** name constrained to `maxWidth px(240)`; the width of the widest name at that size must fit the line. Baseline placed exactly on the line by vertically offsetting the top by `-1.063 * size`; horizontal centering uses PDFKit's `widthOfString` (`x = -width/2`) around the anchor `cx`.
  - **Font caveat (important):** PDFKit does **not** apply OpenType shaping/GSUB, so script fonts (e.g. Great Vibes — previously tried) render scattered/incorrect glyphs; a **self-contained handwriting font** (Kalam) must be used. (There are leftover unused files `Satisfy-Regular.ttf`, `Satisfy.zip`, `Satisfy/LICENSE.txt` in `backend/src/utils/` — not in use.)

### 8.7 Verification URL
`PLATFORM_BRAND = { website: process.env.FRONTEND_URL || "https://skillbridge-lms.example.com" }` (exported from `certificateGenerator.js`). Printed QR + used as `verificationUrl`.

---

## 9. AI Assistant ("LearnSpace AI")

- Backend: `controllers/ai.controller.js` + `routes/ai.routes.js` → **`POST /api/ai/chat`** body `{ message (≤5000 chars), conversation[] }`.
- Forwards to NVIDIA NIM: `https://integrate.api.nvidia.com/v1/chat/completions`, model `nvidia/nemotron-3.5-lightning-30b-a3b`, `temperature 0.4`, `max_tokens 7000`, `stream:false`, Bearer `NVIDIA_API_KEY`. Uses a keep-alive axios client (60s timeout).
- System prompt makes it **LearnSpace AI**, an expert coding tutor: explain *what → why → how → runnable code*; full content for guides; detects English/Hindi/Hinglish (Hinglish = Hindi logic with English technical terms); **outputs ONLY clean GitHub-flavored Markdown**, never internal reasoning.
- History kept to last 6 messages (backend) / last 10 (frontend), each clamped to 1500 chars.
- Error mapping: 429 → busy; 401/403 → config key error; timeout → 504; else 500.
- Frontend: `components/AI/LearnSpaceAi.jsx` — floating chat widget (bot button ⇄ window) with quick questions, copy buttons, Prism code blocks (oneDark theme), GFM tables via react-markdown; "Open full AI" navigates to **`/ai`** (`pages/AI/AiChat.jsx`) which hosts the same component; both inside `ProtectedRoute`. `services/ai.service.js` wraps the API.

---

## 10. Uploads & Static Storage

- `app.js` serves `backend/uploads` statically at **`/uploads`** (this is where certificate PDFs live and are downloadable).
- Old convenience endpoint `GET /api/files/download` streams `uploads/notes/proj.pdf` as `react-components-notes.pdf`.
- **Cloudinary** (`config/cloudinary.js`, `utils/uploadToCloudinary.js`) handles course thumbnails (`skillforge/courses/thumbnails`) and student avatars (`student-avatars`).
- Multer middlewares (`middlewares/upload.middleware.js`): course images (JPG/PNG/WEBP, 5MB), lesson markdown (2MB single / array≤50), combined `.md` + `.csv`, generic CSV (5MB), company profile files (legacy), student avatar (5MB).

---

## 11. Frontend Routing & State Map

`app/router.jsx` (all under `ProtectedRoute`):
- **Public:** `/`, `/login`, `/register`, `/forgot-password`, `/reset-password/:token`.
- **Admin (`/admin` under `RoleRoute ADMIN` + AdminLayout):** dashboard, students, students/leaderboard, students/:studentId, courses, courses/new, courses/:courseId, courses/:courseId/edit, capstones, certificates.
- **Student (`/student` under StudentLayout):** dashboard, courses (My Courses), catalog, courses/:courseId/learn, courses/:courseId/learn/:lessonId, courses/:courseId/final, certificates, profile.
- **Shared:** `/ai` (full-page AI chat), `/unauthorized`, `*` → NotFound.

`app/store.js` reducers: `auth`, `adminDashboard`, `adminStudent`, `adminCapstone`, `adminCourse` (= `features/courses/courseSlice`), `adminCertificate`, `studentProfile`, `studentCourse`, `studentCertificate`.

Feature folders (each: `*Api.js` + `*Thunks.js` + `*Slice.js`):
- `features/auth/*`, `features/courses/*` (course wizard state), `features/admin/{dashboard,student,capstone,certificate}/*`, `features/student/{studentProfile,studentCourse,studentCertificate}/*`.

---

## 12. Known Issues / Gotchas (be careful)

1. **Hardcoded localhost URLs:** `pdfUrl` written as `http://localhost:3000/uploads/certificates/<code>.pdf` (adminCertificateController), and student "View Online" link hardcodes `http://localhost:3000/...` (studentCertificates.jsx). Both should come from env/`req` host in production.
2. **PDFKit no OpenType shaping** → must use self-contained fonts (Kalam). Do not reintroduce Great Vibes/Satisfy for signatures.
3. `studentProfile.avatar` shows up on leaderboards but avatars are only uploaded via profile update.
4. `companyProject` certificate column is always empty (no company/project issuer flow wired up; QR-verification + COMPANY_PROJECT schema columns exist but are not used by the admin UI).
5. `sendEmail.js` still brands "SkillForge Platform" / "Security Team" (legacy naming) & `adminCompanyVerification` is unused (company feature removed).
6. RootRedirect still routes `role === "COMPANY"` to `/company/dashboard` (no such route exists).
7. Some UI strings elsewhere still say "SkillBridge" (e.g. `SBF-` certificate prefix, QR fallback domain).
8. Frontend `authSlice` logs debug console lines (refresh fulfilled etc.) — harmless.
9. Certificate codes are unique per issue (random), student-visible as `Credential ID`.

---

## 13. Quick File Reference Map

| Concern | File |
|---|---|
| Certificate generation (template, fonts, QR, signatures) | `backend/src/utils/certificateGenerator.js` |
| Certificate template image | `backend/src/utils/certificate.png` |
| Certificate sync/reconcile + PDF removal | `backend/src/utils/certificateSync.js` |
| Admin certificate endpoints | `backend/src/controllers/admin/adminCertificateController.js`, `routes/admin/adminCertificate.routes.js` |
| Student certificate endpoints | `backend/src/controllers/student/studentCertificateController.js`, `routes/student/studentCertificate.routes.js` |
| Capstone review (approve unlocks certificate) | `backend/src/controllers/admin/adminCapstoneController.js` |
| Student learning/quiz/capstone | `backend/src/controllers/studentController.js` |
| Auth | `backend/src/controllers/authController.js`, `utils/generateTokens.js`, `middlewares/auth.middleware.js` |
| Courses / lessons / quizzes (admin) | `controllers/admin/adminCourseController.js`, `adminLessonController.js`, `adminLessonQuizController.js`, `adminCourseQuizController.js` |
| Students admin + dashboard | `controllers/admin/adminStudentController.js`, `adminDashboardController.js` |
| AI | `controllers/ai.controller.js`, `routes/ai.routes.js`, `components/AI/LearnSpaceAi.jsx`, `pages/AI/AiChat.jsx` |
| Markdown lesson parser | `backend/src/utils/parseMarkdown.js` |
| Emails | `backend/src/utils/sendEmail.js` |
| Axios auth interceptor | `frontend/src/services/axios.js` |
| Admin capstone UI + cert modal | `frontend/src/pages/admin/capstones/CapstoneReview.jsx` (+ `.module.css`) |
| Admin certificates list | `frontend/src/pages/admin/certificates/Certificates.jsx` |
| Student certificates | `frontend/src/pages/student/Certificates.jsx` |
| Routes | `frontend/src/app/router.jsx`; backend `backend/src/app.js` |

---

## 14. One-Paragraph Summary (the "TL;DR" to give your AI)

LearnSpace is a JWT-secured, role-based LMS: students progress through published courses one lesson at a time (each lesson quiz gates the next), must hit 100% lesson completion to take a 10–50 question final quiz, and passing it unlocks a capstone submission (GitHub repo + demo URL). An admin approves the capstone, which marks the course complete; the admin can then **Preview** a PDF certificate (rendered by PDFKit from `certificate.png` with the name/course/date/code/score drawn onto measured anchors, the legacy QR covered and replaced with a website-QR, and three administrator names — Anish, Rishabh, Raj — drawn in Kalam handwriting on their signature lines, issued under "LearnSpace") and hit **Issue & Send**, which writes the PDF to `uploads/certificates/`, creates a `Certificate` record (status SENT, code `SBF-YEAR-RANDOM`), adds the course category to the student's verified skills, and flags the capstone as issued. The student then sees the certificate in their dashboard and can download/view it. A background reconcile step self-cleans orphans/duplicates and keeps capstone flags in sync with manual DB edits.
