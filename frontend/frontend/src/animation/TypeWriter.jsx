import { useEffect, useState } from "react";

import styles from "./TypeWriter.module.css";

const Typewriter = ({
  texts = ["Admin Dashboard", "Student Management", "Capstone Review"],
  typingSpeed = 85,
  deletingSpeed = 50,
  pauseTime = 1400,
}) => {
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];

    let timer;

    // ================================
    // TYPING
    // ================================
    if (!isDeleting && displayText.length < currentText.length) {
      timer = setTimeout(() => {
        setDisplayText(currentText.slice(0, displayText.length + 1));
      }, typingSpeed);
    }

    // ================================
    // PAUSE
    // ================================
    else if (!isDeleting && displayText.length === currentText.length) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, pauseTime);
    }

    // ================================
    // DELETING
    // ================================
    else if (isDeleting && displayText.length > 0) {
      timer = setTimeout(() => {
        setDisplayText(currentText.slice(0, displayText.length - 1));
      }, deletingSpeed);
    }

    // ================================
    // NEXT TEXT
    // ================================
    else if (isDeleting && displayText.length === 0) {
      timer = setTimeout(() => {
        setTextIndex((prev) => (prev + 1) % texts.length);

        setIsDeleting(false);
      }, 350);
    }

    return () => clearTimeout(timer);
  }, [
    displayText,
    isDeleting,
    textIndex,
    texts,
    typingSpeed,
    deletingSpeed,
    pauseTime,
  ]);

  return (
    <span
      className={`${styles.Typewriter} ${
        isDeleting ? styles.deleting : styles.typing
      }`}
    >
      <span className={styles.textWrapper}>
        <span className={styles.text}>{displayText}</span>
      </span>

      <span className={styles.cursor} aria-hidden="true" />
    </span>
  );
};

export default Typewriter;
