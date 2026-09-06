import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { toast } from "react-toastify";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import {
  oneLight,
  oneDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";

import {
  fetchCourseLearningData,
  fetchLessonQuiz,
  submitLessonQuiz,
} from "../../features/student/studentCourseThunks";

import {
  clearLessonQuiz,
  clearStudentCourseError,
  clearStudentCourseSuccess,
} from "../../features/student/studentCourseSlice";

import styles from "./LessonLearn.module.css";

const normalizeCodeExample = (content) => {
  if (!content) return "";

  const lines = content.split("\n");

  if (lines[0] && /^[xX]$/.test(lines[0].trim())) {
    lines.shift();
  }

  return lines.join("\n").trim();
};

const resolveNotesUrl = (notesPdfUrl) => {
  if (!notesPdfUrl) return "";

  const trimmed = String(notesPdfUrl).trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const filename = trimmed.split(/[\\/]/).pop();

  return `/uploads/notes/${encodeURIComponent(filename)}`;
};

/* markdown renderer: headings, code, lists, tables, highlighted fenced blocks */
const CodeBlock = ({ language, children }) => {
  const code = String(children).replace(/\n$/, "");

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeBlockHeader}>
        <span className={styles.codeBlockLabel}>
          {language ? `💻 ${language}` : "💻 Code"}
        </span>

        <button
          type="button"
          className={styles.copyBtn}
          onClick={() => {
            navigator.clipboard.writeText(code);
          }}
        >
          📋 Copy
        </button>
      </div>

      <SyntaxHighlighter
        style={oneLight}
        language={language || "plaintext"}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: "transparent",
          fontSize: "13.5px",
          lineHeight: "1.8",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

const MarkdownContent = ({ text, className }) => {
  if (!text) return null;

  const trimmed = String(text).trim();

  if (!trimmed) return null;

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className: codeClassName, children, ...props }) {
            if (!inline && (codeClassName || String(children).includes("\n"))) {
              const match = /language-(\w+)/.exec(codeClassName || "");

              return (
                <CodeBlock language={match ? match[1] : ""}>
                  {children}
                </CodeBlock>
              );
            }

            return (
              <code className={styles.richInlineCode} {...props}>
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p>{children}</p>;
          },
          ul({ children }) {
            return <ul className={styles.pointList}>{children}</ul>;
          },
          ol({ children }) {
            return <ol className={styles.pointList}>{children}</ol>;
          },
          li({ children }) {
            return (
              <li>
                <span className={styles.pointBullet}>▹</span>
                <span>{children}</span>
              </li>
            );
          },
          strong({ children }) {
            return <strong className={styles.richBold}>{children}</strong>;
          },
          h1({ children }) {
            return <h3>{children}</h3>;
          },
          h2({ children }) {
            return <h3>{children}</h3>;
          },
          h3({ children }) {
            return <h3>{children}</h3>;
          },
          blockquote({ children }) {
            return (
              <blockquote className={styles.richBlockquote}>
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className={styles.tableWrapper}>
                <table>{children}</table>
              </div>
            );
          },
        }}
      >
        {trimmed}
      </ReactMarkdown>
    </div>
  );
};

const LessonLearn = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { courseId, lessonId } = useParams();

  const {
    learningData,
    learningLoading,
    lessonQuiz,
    lessonQuizResult,
    submitting,
    error,
    success,
    message,
  } = useSelector((state) => state.studentCourse);

  const [quizAnswers, setQuizAnswers] = useState({});
  const [codeCopied, setCodeCopied] = useState(false);

  // load course
  useEffect(() => {
    dispatch(fetchCourseLearningData(courseId));
  }, [dispatch, courseId]);

  // Reset quiz state whenever lesson changes (component stays mounted on
  // in-course navigation), so the previous lesson's result isn't shown.
  useEffect(() => {
    return () => {
      dispatch(clearLessonQuiz());
    };
  }, [dispatch, lessonId]);

  // success toast
  useEffect(() => {
    if (!success) return;

    toast.success(message || "Success");

    dispatch(clearStudentCourseSuccess());
  }, [success, message, dispatch]);

  // error toast
  useEffect(() => {
    if (!error) return;

    toast.error(error);

    dispatch(clearStudentCourseError());
  }, [error, dispatch]);

  if (learningLoading && !learningData) {
    return <div className={styles.loading}>Loading lesson...</div>;
  }

  if (!learningData) {
    return null;
  }

  const lessons = learningData.lessons || [];

  const lesson = lessons.find((item) => item._id === lessonId);

  if (!lesson?.isUnlocked) {
    return (
      <div className={styles.lockedPage}>
        <h2>🔒 Lesson Locked</h2>

        <p>Complete the previous lesson first.</p>

        <Link to={`/student/courses/${courseId}/learn`}>Back to Course</Link>
      </div>
    );
  }

  const currentIndex = lessons.findIndex((item) => item._id === lessonId);

  const nextLesson = lessons[currentIndex + 1];

  // quiz
  const openQuiz = () => {
    setQuizAnswers({});

    dispatch(fetchLessonQuiz(lesson._id));
  };

  const handleRetryQuiz = () => {
    setQuizAnswers({});
    dispatch(clearLessonQuiz());
    dispatch(fetchLessonQuiz(lesson._id));
  };

  const submitQuiz = () => {
    if (!lessonQuiz || submitting || lesson?.isQuizPassed) return;

    const answers = Object.entries(quizAnswers).map(
      ([questionId, selectedIndex]) => ({
        questionId,

        selectedIndex: Number(selectedIndex),
      }),
    );

    dispatch(
      submitLessonQuiz({
        lessonId: lesson._id,

        answers,
      }),
    );
  };

  const handleAnswer = (questionId, selectedIndex) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: selectedIndex }));
  };

  const handleCopyCode = () => {
    if (!lesson?.codeExample) return;

    navigator.clipboard.writeText(normalizeCodeExample(lesson.codeExample));

    setCodeCopied(true);

    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleNextLesson = async () => {
    const result = await dispatch(fetchCourseLearningData(courseId)).unwrap();

    const updatedLessons = result.lessons || [];

    const updatedIndex = updatedLessons.findIndex(
      (item) => item._id === lessonId,
    );

    const next = updatedLessons[updatedIndex + 1];

    if (next?.isUnlocked) {
      navigate(`/student/courses/${courseId}/learn/${next._id}`);
    } else {
      toast.error("Complete the quiz first.");
    }
  };

  return (
    <div className={styles.lessonPage}>
      <Link
        to={`/student/courses/${courseId}/learn`}
        className={styles.backButton}
      >
        ← Back to Lessons
      </Link>

      <header className={styles.lessonHeader}>
        <span>LESSON {lesson.lessonNumber}</span>

        <h1>{lesson.title}</h1>

        <div className={styles.lessonProgressTrack}>
          <div
            className={styles.lessonProgressFill}
            style={{
              width: `${Math.round(
                ((currentIndex + 1) / Math.max(lessons.length, 1)) * 100,
              )}%`,
            }}
          />
        </div>

        <div className={styles.headerMeta}>
          {learningData.course?.title && (
            <span className={styles.metaChip}>
              📚 {learningData.course.title}
            </span>
          )}

          <span className={styles.metaChip}>
            ▤ Lesson {currentIndex + 1} of {lessons.length}
          </span>

          {lesson.mcqCount > 0 && (
            <span className={styles.metaChip}>📝 {lesson.mcqCount} MCQs</span>
          )}

          {typeof learningData.course?.lessonQuizPassingPercentage ===
            "number" && (
            <span className={styles.metaChip}>
              🎯 Pass: {learningData.course.lessonQuizPassingPercentage}%
            </span>
          )}

          {lesson.isCompleted ? (
            <span className={`${styles.metaChip} ${styles.metaDone}`}>
              ✓ Completed
            </span>
          ) : (
            <span className={`${styles.metaChip} ${styles.metaProgress}`}>
              ⏳ In Progress
            </span>
          )}

          {lesson.isQuizPassed && (
            <span className={`${styles.metaChip} ${styles.metaPassed}`}>
              🏅 Quiz: {lesson.quizScore}%
            </span>
          )}

          {!lesson.isQuizPassed && lesson.quizAttempts > 0 && (
            <span className={styles.metaChip}>
              🔁 Attempts: {lesson.quizAttempts}
            </span>
          )}
        </div>
      </header>

      {lesson.videoUrl && (
        <section className={styles.contentCard}>
          <h2>🎥 Video Lesson</h2>

          <div className={styles.videoWrapper}>
            <iframe
              src={getYouTubeEmbedUrl(lesson.videoUrl)}
              title={lesson.title}
              allowFullScreen
            />
          </div>
        </section>
      )}

      <section className={styles.theorySection}>
        {lesson.topicHeading && <h2>{lesson.topicHeading}</h2>}

        <div className={styles.theoryBlocks}>
          {lesson.definition && (
            <div className={styles.definitionBlock}>
              <h3>📖 Definition</h3>

              <MarkdownContent text={lesson.definition} />
            </div>
          )}

          {lesson.detailedMeaning && (
            <div className={styles.meaningBlock}>
              <h3>🧠 Detailed Meaning</h3>

              <MarkdownContent text={lesson.detailedMeaning} />
            </div>
          )}
        </div>
      </section>

      {lesson.example && (
        <section className={styles.exampleBlock}>
          <h2>💡 Example</h2>

          <MarkdownContent text={lesson.example} />
        </section>
      )}

      {lesson.codeExample && (
        <section className={styles.contentCard}>
          <div className={styles.codeBlock}>
            <div className={styles.codeBlockHeader}>
              <span className={styles.codeBlockLabel}>
                {lesson.codeLanguage
                  ? `💻 Code Example (${lesson.codeLanguage})`
                  : "💻 Code Example"}
              </span>

              <button
                type="button"
                className={styles.copyBtn}
                onClick={handleCopyCode}
              >
                {codeCopied ? "✓ Copied!" : "📋 Copy"}
              </button>
            </div>

            <SyntaxHighlighter
              style={oneDark}
              language={lesson.codeLanguage || "plaintext"}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                background: "transparent",
                fontSize: "13.5px",
                lineHeight: "1.8",
              }}
            >
              {normalizeCodeExample(lesson.codeExample)}
            </SyntaxHighlighter>
          </div>

          {lesson.codeExampleExplanation && (
            <div className={styles.codeExplanation}>
              <h3>📝 Explanation</h3>

              <MarkdownContent text={lesson.codeExampleExplanation} />
            </div>
          )}
        </section>
      )}

      {lesson.notesPdfUrl && (
        <section className={styles.contentCard}>
          <h2>📄 Lesson Notes</h2>

          <a
            href={resolveNotesUrl(lesson.notesPdfUrl)}
            target="_blank"
            rel="noreferrer"
          >
            View Notes
          </a>
        </section>
      )}

      <section className={styles.quizCard}>
        <h2>📝 Lesson Quiz</h2>

        {lesson.isQuizPassed ? (
          <div className={styles.completedQuiz}>
            <h3>✓ Quiz Completed</h3>

            <p>Score: {lesson.quizScore}%</p>
          </div>
        ) : !lessonQuiz ? (
          <button type="button" onClick={openQuiz}>
            Start Quiz
          </button>
        ) : (
          <QuizView
            quiz={lessonQuiz}
            answers={quizAnswers}
            result={lessonQuizResult}
            submitting={submitting}
            onAnswer={handleAnswer}
            onSubmit={submitQuiz}
            onRetry={handleRetryQuiz}
          />
        )}

        {lesson.isQuizPassed &&
          (nextLesson ? (
            <button
              type="button"
              className={styles.nextLessonBtn}
              onClick={handleNextLesson}
            >
              Next Lesson →
            </button>
          ) : (
            <Link
              to={`/student/courses/${courseId}/final`}
              className={styles.nextLessonBtn}
            >
              Go to Final Assessment →
            </Link>
          ))}
      </section>
    </div>
  );
};

/* quiz view */
const QuizView = ({
  quiz,
  answers,
  result,
  submitting,
  onAnswer,
  onSubmit,
  onRetry,
}) => {
  const questions = quiz.questions || [];

  if (result) {
    const passed = result?.result?.passed;

    return (
      <div>
        <h3>{passed ? "🎉 Quiz Passed" : "❌ Quiz Failed"}</h3>

        {!passed && (
          <button type="button" onClick={onRetry}>
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {questions.map((question, index) => (
        <div key={question._id}>
          <h3>
            Q{index + 1}. {question.question}
          </h3>

          {question.options.map((option, optionIndex) => (
            <label key={optionIndex}>
              <input
                type="radio"
                name={question._id}
                checked={answers[question._id] === optionIndex}
                onChange={() => onAnswer(question._id, optionIndex)}
              />

              {option}
            </label>
          ))}
        </div>
      ))}

      <button type="button" disabled={submitting} onClick={onSubmit}>
        {submitting ? "Submitting..." : "Submit Quiz"}
      </button>
    </div>
  );
};

/* youtube url helper */
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);

    let videoId = null;

    if (
      parsedUrl.hostname === "www.youtube.com" ||
      parsedUrl.hostname === "youtube.com"
    ) {
      videoId = parsedUrl.searchParams.get("v");
    }

    if (parsedUrl.hostname === "youtu.be") {
      videoId = parsedUrl.pathname.split("/")[1];
    }

    if (!videoId) return null;

    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
};

export default LessonLearn;
