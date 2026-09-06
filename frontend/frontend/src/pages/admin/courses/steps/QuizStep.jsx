import { useRef, useState, useEffect } from "react";

import toast from "react-hot-toast";

import styles from "./steps.module.css";

const QUIZ_CSV_TEMPLATE = `question,optionA,optionB,optionC,optionD,correctOptionIndex
"What does CSS stand for?","Cascading Style Sheets","Computer Style Sheets","Creative Style System","Coded Style Sheets",0
"Which HTML tag is used for a hyperlink?","<a>","<link>","<href>","<url>",0
"Which JavaScript keyword declares a constant?","const","let","var","static",0
"Which property controls the space inside an element?","padding","margin","border","gap",0
"What does API stand for?","Application Programming Interface","Applied Program Interface","Automated Process Integration","Advanced Programming Interface",0
"Which method adds an element to the end of an array?","push()","pop()","shift()","unshift()",0
"What is the output of typeof null?","object","null","undefined","number",0
"Which CSS property makes a layout flexible?","display","position","float","overflow",0
"Which HTTP status code means 'Not Found'?","404","200","500","301",0
"Which React hook is used for side effects?","useEffect","useState","useMemo","useRef",0`;

const QuizStep = ({
  course,
  uploading,
  error,
  success,
  message,
  onUploadQuiz,
}) => {
  const [quizFile, setQuizFile] = useState(null);

  const fileRef = useRef(null);

  const quizCount = course?.quiz?.length || 0;

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQuizFile(file);

    // Auto-upload immediately on file selection
    if (course?._id) {
      onUploadQuiz(course._id, file).then(() => {
        setQuizFile(null);
        if (fileRef.current) fileRef.current.value = "";
      });
    }
  };

  useEffect(() => {
    if (success && message) {
      toast.success(message);
    }
  }, [success, message]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const downloadTemplate = () => {
    const blob = new Blob([QUIZ_CSV_TEMPLATE], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "final-quiz-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.stepForm}>
      <h2 className={styles.stepTitle}>Final Quiz</h2>

      <p className={styles.stepSubtitle}>
        Upload the course final quiz as a CSV file. It must contain between 10
        and 50 MCQs. Select the file and it uploads automatically.
      </p>
      {/* =========================================
          CURRENT QUIZ STATUS
      ========================================= */}

      <div className={styles.uploadSection}>
        <h4>📊 Current Quiz Status</h4>

        <div className={styles.metaGrid}>
          <div className={styles.metaCard}>
            <strong>{quizCount}</strong>
            <span>Questions</span>
          </div>

          <div className={styles.metaCard}>
            <strong>{course?.passingPercentage || 70}%</strong>
            <span>Passing %</span>
          </div>

          <div className={styles.metaCard}>
            <strong>{course?.quizTimeLimitMinutes || 45}m</strong>
            <span>Time Limit</span>
          </div>
        </div>
      </div>

      {/* =========================================
          UPLOAD FINAL QUIZ — DIRECT
      ========================================= */}

      <div className={styles.uploadSection}>
        <h4>⬆ Upload Final Quiz CSV</h4>

        <div className={styles.uploadArea}>
          <div
            className={styles.fileDrop}
            onClick={() => fileRef.current?.click()}
          >
            <span className={styles.fileDropIcon}>📝</span>

            <strong>Choose the final quiz CSV</strong>

            <span>Columns: question, optionA-D, correctOptionIndex</span>

            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFile}
            />
          </div>

          {uploading && (
            <div className={styles.hint}>
              <span className={styles.spinner}></span> Uploading...
            </div>
          )}
        </div>
      </div>

      {/* =========================================
          TEMPLATE
      ========================================= */}

      <div className={styles.uploadSection}>
        <h4>📋 CSV Format</h4>

        <div className={styles.csvHint}>
          <span>ℹ️</span>

          <div>
            <p>
              Required columns: <code>question</code>, <code>optionA</code>,{" "}
              <code>optionB</code>, <code>optionC</code>, <code>optionD</code>,{" "}
              <code>correctOptionIndex</code> (0-3). The quiz must have between{" "}
              <strong>10 and 50</strong> rows.
            </p>

            <button className={styles.ghostBtn} onClick={downloadTemplate}>
              ⬇ Download Sample Quiz CSV
            </button>
          </div>
        </div>
      </div>

      {/* =========================================
          PREVIEW — live from refetched course
      ========================================= */}

      {quizCount > 0 && (
        <div className={styles.uploadSection}>
          <h4>👁 Preview ({quizCount} questions)</h4>

          <div className={styles.quizList}>
            {course.quiz.slice(0, 10).map((q, index) => (
              <div key={index} className={styles.quizItem}>
                <span>Q{index + 1}.</span>
                <div>{q.question}</div>
              </div>
            ))}

            {quizCount > 10 && (
              <div className={styles.stateBox}>
                +{quizCount - 10} more questions
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizStep;
