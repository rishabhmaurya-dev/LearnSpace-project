import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify"; // 1. Toast Import Karein

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
introduction-to-react.pdf
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

  const lessonRef = useRef(null);
  const multipleRef = useRef(null);

  /* fetch lessons on mount */

  useEffect(() => {
    if (course?._id) {
      onFetchLessons(course._id);
    }
  }, [course?._id]);

  /* toast alerts trigger */

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

  /* handlers */

  const handleLessonFiles = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length || !course?._id) return;

    setLessonFiles(files);

    if (files.length === 1) {
      onUploadSingle(course._id, files[0]).then(() => {
        setLessonFiles([]);
        if (lessonRef.current) lessonRef.current.value = "";
      });
    } else {
      onUploadMultiple(course._id, files).then(() => {
        setLessonFiles([]);
        if (lessonRef.current) lessonRef.current.value = "";
      });
    }
  };

  const handleMcqFile = (lessonId, e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    onUploadMcq(lessonId, file);
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

      {/* upload lessons (.md) */}

      <div className={styles.uploadSection}>
        <h4>📄 Upload Lesson (.md)</h4>

        <div className={styles.uploadArea}>
          <div
            className={styles.fileDrop}
            onClick={() => lessonRef.current?.click()}
          >
            <span className={styles.fileDropIcon}>📄</span>

            <strong>Select Markdown file(s)</strong>

            <span>Select one or multiple .md files — uploads automatically</span>

            <input
              ref={lessonRef}
              type="file"
              accept=".md,text/markdown,text/plain"
              multiple
              onChange={handleLessonFiles}
            />
          </div>

          {uploading && (
            <div className={styles.hint}>
              <span className={styles.spinner}></span> Uploading...
            </div>
          )}

          <div className={styles.headerActions}>
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

      {/* markdown format guide */}

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

      {/* lesson list with mcq upload */}

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

                {/* lesson mcq csv upload */}
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
                    {uploading ? "Uploading..." : "⬆ Upload MCQ CSV"}
                  </label>

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

      {/* mcq csv template info */}

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
