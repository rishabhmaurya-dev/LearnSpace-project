import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast"; // 1. Toast Import Karein

import styles from "./steps.module.css";

const MCQ_CSV_TEMPLATE = `question,optionA,optionB,optionC,optionD,correctOptionIndex
"What is React?","Library","Database","OS","Language",0
"What is JSX?","Syntax","Database","Server","Compiler",0`;

const LESSON_MARKDOWN_TEMPLATE = `# Lesson Title

## Topic
React JS Fundamentals

## Definition
A concise definition of the topic.

## Detailed Meaning
A thorough explanation covering key concepts, use cases, and underlying principles.

## Example
A practical example illustrating the concept in action.

## Code Example
\`\`\`jsx
// Your code example here
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

## Code Explanation
Step-by-step explanation of what the code does.

## Video
https://www.youtube.com/watch?v=example

## Notes
https://example.com/notes.pdf
`;

const LessonsStep = ({
  course,
  lessons,
  loading,
  uploading,
  error,
  success,
  message,
  onFetchLessons,
  onUploadSingle,
  onUploadMultiple,
  onDeleteLesson,
  onUploadMcq,
  onDeleteMcqs,
}) => {
  const [lessonFiles, setLessonFiles] = useState([]);
  const [mcqFiles, setMcqFiles] = useState({});

  const lessonRef = useRef(null);
  const multipleRef = useRef(null);

  /* -----------------------------------------------------
     FETCH LESSONS ON MOUNT
  ----------------------------------------------------- */

  useEffect(() => {
    if (course?._id) {
      onFetchLessons(course._id);
    }
  }, [course?._id]);

  /* -----------------------------------------------------
     TOAST ALERTS TRIGGER
  ----------------------------------------------------- */

  // 2. Success Alert ke liye Toast
  useEffect(() => {
    if (success && message) {
      toast.success(message);
    }
  }, [success, message]);

  // 3. Error Alert ke liye Toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  /* -----------------------------------------------------
     HANDLERS
  ----------------------------------------------------- */

  const handleLessonFiles = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length) setLessonFiles(files);
  };

  const handleUploadLessons = () => {
    if (!lessonFiles.length || !course?._id) return;

    if (lessonFiles.length === 1) {
      onUploadSingle(course._id, lessonFiles[0]);
    } else {
      onUploadMultiple(course._id, lessonFiles);
    }

    setLessonFiles([]);

    if (lessonRef.current) lessonRef.current.value = "";
    if (multipleRef.current) multipleRef.current.value = "";
  };

  const handleMcqFile = (lessonId, e) => {
    const file = e.target.files?.[0];

    if (file) {
      setMcqFiles((prev) => ({ ...prev, [lessonId]: file }));
    }
  };

  const handleUploadMcq = (lesson) => {
    const file = mcqFiles[lesson._id];

    if (!file) return;

    onUploadMcq(lesson._id, file);

    setMcqFiles((prev) => ({ ...prev, [lesson._id]: undefined }));
  };

  const downloadTemplate = () => {
    const blob = new Blob([MCQ_CSV_TEMPLATE], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "lesson-mcq-template.csv";

    link.click();

    URL.revokeObjectURL(url);
  };

  const downloadMarkdownTemplate = () => {
    const blob = new Blob([LESSON_MARKDOWN_TEMPLATE], {
      type: "text/markdown;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "lesson-template.md";

    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 className={styles.stepTitle}>Lessons</h2>

      <p className={styles.stepSubtitle}>
        Upload lesson content as Markdown files. You can choose one or multiple
        files at once. The system parses headings like <code># Title</code>,{" "}
        <code>## Definition</code>, <code>## Detailed Meaning</code>, and{" "}
        <code>## Example</code>.
      </p>

      {/* Static alert divs Yahan se hata diye gaye hain */}

      {/* =========================================
          UPLOAD LESSONS (.md)
      ========================================= */}

      <div className={styles.uploadSection}>
        <h4>📄 Upload Lesson (.md)</h4>

        <div className={styles.uploadArea}>
          <div
            className={styles.fileDrop}
            onClick={() => lessonRef.current?.click()}
          >
            <span className={styles.fileDropIcon}>📄</span>

            <strong>Choose Markdown file(s)</strong>

            <span>Select one or multiple .md files · Max 2MB each</span>

            <input
              ref={lessonRef}
              type="file"
              accept=".md,text/markdown,text/plain"
              multiple
              onChange={handleLessonFiles}
            />
          </div>

          {lessonFiles.length > 0 && (
            <div className={styles.fileList}>
              {lessonFiles.map((file, index) => (
                <div key={index} className={styles.fileName}>
                  <span>{file.name}</span>

                  <button onClick={() => setLessonFiles([])}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.headerActions}>
            <button
              className={styles.primaryBtn}
              disabled={lessonFiles.length === 0 || uploading}
              onClick={handleUploadLessons}
            >
              {uploading ? (
                <>
                  <span className={styles.spinner}></span>
                  Uploading...
                </>
              ) : (
                `Upload ${lessonFiles.length || ""} Lesson${
                  lessonFiles.length === 1 ? "" : "s"
                }`
              )}
            </button>

            <button
              type="button"
              className={styles.ghostBtn}
              onClick={downloadMarkdownTemplate}
            >
              ⬇ Markdown Template
            </button>
          </div>
        </div>
      </div>

      {/* =========================================
          MARKDOWN FORMAT GUIDE
      ========================================= */}

      <div className={styles.uploadSection}>
        <h4>📝 Markdown Format Guide</h4>

        <div className={styles.csvHint}>
          <span>ℹ️</span>

          <div>
            <p>
              Use the following headings in your <code>.md</code> file. Only{" "}
              <code># Title</code>, <code>## Definition</code>,{" "}
              <code>## Detailed Meaning</code>, and <code>## Example</code> are
              required.
            </p>

            <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
              <li>
                <code># Title</code> — Lesson title (required)
              </li>
              <li>
                <code>## Topic</code> — Topic heading (defaults to title)
              </li>
              <li>
                <code>## Definition</code> — Concise definition (required)
              </li>
              <li>
                <code>## Detailed Meaning</code> — In-depth explanation
                (required)
              </li>
              <li>
                <code>## Example</code> — Practical example (required)
              </li>
              <li>
                <code>## Code Example</code> — Code block (optional)
              </li>
              <li>
                <code>## Code Explanation</code> — Code walkthrough (optional)
              </li>
              <li>
                <code>## Video</code> — YouTube URL (optional)
              </li>
              <li>
                <code>## Notes</code> — PDF URL (optional)
              </li>
            </ul>

            <button
              className={styles.ghostBtn}
              onClick={downloadMarkdownTemplate}
            >
              ⬇ Download Markdown Template
            </button>
          </div>
        </div>
      </div>

      {/* =========================================
          LESSON LIST WITH MCQ UPLOAD
      ========================================= */}

      <div className={styles.uploadSection}>
        <div className={styles.uploadSectionHeader}>
          <h4>📖 Lesson List</h4>

          <span className={styles.sectionCount}>{lessons.length} lessons</span>
        </div>

        {loading ? (
          <div className={styles.stateBox}>Loading lessons...</div>
        ) : lessons.length === 0 ? (
          <div className={styles.stateBox}>
            No lessons yet. Upload Markdown files above to get started.
          </div>
        ) : (
          <div className={styles.lessonList}>
            {lessons.map((lesson) => (
              <div key={lesson._id} className={styles.lessonItem}>
                <div className={styles.lessonNum}>{lesson.lessonNumber}</div>

                <div className={styles.lessonInfo}>
                  <strong>{lesson.title}</strong>

                  <small>{lesson.topicHeading}</small>
                </div>

                <span
                  className={`${styles.mcqBadge} ${
                    lesson.mcqCount > 0 ? styles.mcqOk : styles.mcqMissing
                  }`}
                >
                  {lesson.mcqCount > 0 ? `${lesson.mcqCount} MCQs` : "No MCQs"}
                </span>

                <button
                  className={styles.deleteBtn}
                  onClick={() => onDeleteLesson(lesson._id, course._id)}
                >
                  Delete
                </button>

                {/* =====================================
                    LESSON MCQ CSV UPLOAD
                ===================================== */}
                <div className={styles.mcqUploadRow}>
                  <div className={styles.mcqInfo}>
                    <strong>Lesson MCQ Quiz (CSV)</strong>

                    <small>
                      {lesson.mcqCount > 0
                        ? `${lesson.mcqCount} question${
                            lesson.mcqCount > 1 ? "s" : ""
                          } uploaded`
                        : "No MCQs yet — every lesson needs 1+ MCQ to publish"}
                    </small>
                  </div>

                  <input
                    type="file"
                    accept=".csv"
                    id={`mcq-${lesson._id}`}
                    onChange={(e) => handleMcqFile(lesson._id, e)}
                  />

                  <label
                    htmlFor={`mcq-${lesson._id}`}
                    className={styles.fileBtn}
                  >
                    {mcqFiles[lesson._id]
                      ? "✓ CSV Selected"
                      : "⬆ Upload MCQ CSV"}
                  </label>

                  {mcqFiles[lesson._id] && (
                    <span className={styles.mcqCsvName}>
                      {mcqFiles[lesson._id].name}
                    </span>
                  )}

                  {mcqFiles[lesson._id] && (
                    <button
                      className={styles.primaryBtn}
                      disabled={uploading}
                      onClick={() => handleUploadMcq(lesson)}
                    >
                      {uploading ? (
                        <>
                          <span className={styles.spinner}></span>
                          Uploading...
                        </>
                      ) : (
                        "Upload"
                      )}
                    </button>
                  )}

                  {lesson.mcqCount > 0 && (
                    <button
                      className={styles.ghostBtn}
                      onClick={() => onDeleteMcqs(lesson._id, course._id)}
                    >
                      Clear MCQs
                    </button>
                  )}

                  <button
                    type="button"
                    className={styles.ghostBtn}
                    onClick={downloadTemplate}
                    title="Download lesson MCQ CSV template"
                  >
                    ⬇ Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================
          MCQ CSV TEMPLATE INFO
      ========================================= */}

      <div className={styles.uploadSection}>
        <h4>❓ Lesson MCQ CSV Format</h4>

        <div className={styles.csvHint}>
          <span>ℹ️</span>

          <div>
            <p>
              Each lesson requires a CSV with the exact columns:{" "}
              <code>question</code>, <code>optionA</code>, <code>optionB</code>,{" "}
              <code>optionC</code>, <code>optionD</code>,{" "}
              <code>correctOptionIndex</code> (0-3).
            </p>

            <button className={styles.ghostBtn} onClick={downloadTemplate}>
              ⬇ Download CSV Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonsStep;
