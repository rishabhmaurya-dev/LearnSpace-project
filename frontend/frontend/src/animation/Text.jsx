import { cn } from "@/lib/utils";
import { motion, useInView, AnimatePresence } from "framer-motion";
import * as React from "react";

export function LettersPullUp({ text, className = "" }) {
  const splittedText = text.split("");

  const pullupVariant = {
    initial: {
      y: 10,
      opacity: 0,
    },
    animate: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.05,
      },
    }),
  };

  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span ref={ref} className={cn("inline-block whitespace-nowrap", className)}>
      {splittedText.map((current, i) => (
        <motion.span
          key={`${current}-${i}`}
          variants={pullupVariant}
          initial="initial"
          animate={isInView ? "animate" : ""}
          custom={i}
          className={className}
        >
          {current === " " ? "\u00A0" : current}
        </motion.span>
      ))}
    </span>
  );
}

export function GradualSpacing({ text = "Gradual Spacing" }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span
      ref={ref}
      className="inline-flex space-x-1 justify-center whitespace-nowrap"
    >
      <AnimatePresence>
        {text.split("").map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            initial={{ opacity: 0, x: -18 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            exit={{ opacity: 0, x: -18 }}
            transition={{
              duration: 0.5,
              delay: i * 0.1,
            }}
            style={{
                color: "#ff3d00",
                textShadow: `
    0 0 5px rgba(255, 61, 0, 0.8),
    0 0 0px rgba(255, 61, 0, 0.6),
    0 0 0px rgba(255, 61, 0, 0.4)
  `,
            }}
            className={`inline-block `}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}
