import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import toast from "react-hot-toast";

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

  /* ============================================
     LOAD COURSE
  ============================================ */

  useEffect(() => {
    dispatch(fetchCourseLearningData(courseId));

    return () => {
      dispatch(clearLessonQuiz());
    };
  }, [dispatch, courseId]);

  /* ============================================
     SUCCESS
  ============================================ */

  useEffect(() => {
    if (!success) return;

    toast.success(message || "Success");

    dispatch(clearStudentCourseSuccess());
  }, [success, message, dispatch]);

  /* ============================================
     ERROR
  ============================================ */

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

  /*
  ==============================================
  SECURITY

  USER URL manually change karke
  locked lesson access nahi kar sakta
  ==============================================
  */

  if (!lesson?.isUnlocked) {
    return (
      <div className={styles.lockedPage}>
        <h2>🔒 Lesson Locked</h2>

        <p>Complete the previous lesson first.</p>

        <Link to={`/student/courses/${courseId}/learn`}>Back to Course</Link>
      </div>
    );
  }

  /*
  ==============================================
  FIND NEXT LESSON
  ==============================================
  */

  const currentIndex = lessons.findIndex((item) => item._id === lessonId);

  const nextLesson = lessons[currentIndex + 1];

  /* ============================================
     QUIZ
  ============================================ */

  const openQuiz = () => {
    setQuizAnswers({});

    dispatch(fetchLessonQuiz(lesson._id));
  };

  const handleAnswer = (questionId, selectedIndex) => {
    setQuizAnswers((prev) => ({
      ...prev,

      [questionId]: selectedIndex,
    }));
  };

  const submitQuiz = () => {
    if (!lessonQuiz) return;

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

  /*
  ============================================
  NEXT LESSON

  Quiz pass hone ke baad hi
  button active hoga
  ============================================
  */

  const handleNextLesson = async () => {
    /*
    Fresh course data fetch karo
    taki backend se updated unlock
    status aa jaye
    */

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
      {/* ======================================
          BACK
      ====================================== */}

      <Link
        to={`/student/courses/${courseId}/learn`}
        className={styles.backButton}
      >
        ← Back to Lessons
      </Link>

      {/* ======================================
          LESSON TITLE
      ====================================== */}

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
            <span className={styles.metaChip}>📚 {learningData.course.title}</span>
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

      {/* ======================================
          VIDEO
      ====================================== */}

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

      {/* ======================================
          THEORY
      ====================================== */}

      <section className={styles.contentCard}>
        {lesson.topicHeading && <h2>{lesson.topicHeading}</h2>}

        {lesson.definition && (
          <div>
            <h3>📖 Definition</h3>

            <RichText text={lesson.definition} />
          </div>
        )}

        {lesson.detailedMeaning && (
          <div>
            <h3>🧠 Detailed Meaning</h3>

            <RichText text={lesson.detailedMeaning} />
          </div>
        )}
      </section>

      {/* ======================================
          EXAMPLE
      ====================================== */}

      {lesson.example && (
        <section className={styles.contentCard}>
          <h2>💡 Example</h2>

          <p>{lesson.example}</p>
        </section>
      )}

      {/* ======================================
          CODE
      ====================================== */}

      {lesson.codeExample && (
        <section className={styles.contentCard}>
          <h2>💻 Code Example</h2>

          <pre>
            <code>{lesson.codeExample}</code>
          </pre>

          {lesson.codeExampleExplanation && (
            <p>{lesson.codeExampleExplanation}</p>
          )}
        </section>
      )}

      {/* ======================================
          NOTES
      ====================================== */}

      {lesson.notesPdfUrl && (
        <section className={styles.contentCard}>
          <h2>📄 Lesson Notes</h2>

          <a href={lesson.notesPdfUrl} target="_blank" rel="noreferrer">
            View Notes
          </a>
        </section>
      )}

      {/* ======================================
          QUIZ
      ====================================== */}

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
          />
        )}

        {/* ==================================
            NEXT LESSON
        ================================== */}

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

/* ==============================================
   RICH TEXT

   Bade paragraphs ko "." (sentence) pe split karta
   hai — shuru ke sentences <p> me aur baaki points
   <li> bullets me render hote hain
================================================ */

const RichText = ({ text }) => {
  if (!text) return null;

  const trimmed = String(text).trim();

  if (!trimmed) return null;

  const sentences = trimmed
    .split(/\.\s+|\.$/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (sentences.length === 0) {
    return <p>{trimmed}</p>;
  }

  /* Chhota text -> single paragraph jaisa pehle tha */

  if (sentences.length <= 2) {
    return (
      <>
        {sentences.map((sentence, index) => (
          <p key={`p-${index}`}>{sentence}.</p>
        ))}
      </>
    );
  }

  /* Bada text -> pehle 1-2 sentences <p>, baaki <li> bullets */

  const paragraphCount = sentences.length >= 4 ? 2 : 1;

  const paragraphs = sentences.slice(0, paragraphCount);

  const bulletPoints = sentences.slice(paragraphCount);

  return (
    <>
      {paragraphs.map((sentence, index) => (
        <p key={`p-${index}`}>{sentence}.</p>
      ))}

      {bulletPoints.length > 0 && (
        <ul className={styles.pointList}>
          {bulletPoints.map((point, index) => (
            <li key={`li-${index}`}>
              <span className={styles.pointBullet}>▹</span>

              <span>{point}.</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

/* ==============================================
   QUIZ COMPONENT
================================================ */

const QuizView = ({
  quiz,
  answers,
  result,
  submitting,
  onAnswer,
  onSubmit,
}) => {
  const questions = quiz.questions || [];

  if (result) {
    const passed = result?.result?.passed;

    return (
      <div>
        <h3>{passed ? "🎉 Quiz Passed" : "❌ Quiz Failed"}</h3>

        {!passed && (
          <button type="button" onClick={() => window.location.reload()}>
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

/* ==============================================
   YOUTUBE URL
================================================ */

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
