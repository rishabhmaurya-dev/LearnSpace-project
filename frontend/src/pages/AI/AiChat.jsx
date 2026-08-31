import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Send,
  Trash2,
  Sparkles,
  User,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import { sendAIMessage } from "../../services/ai.service";
import { useNavigate } from "react-router-dom";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import "./AiChat.css";

const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    "Hello 👋 I'm LearnSpace AI. I'm here to help you learn, debug code, and understand your course concepts in depth.",
};

/* =========================================================
   COPY BUTTON
========================================================= */

const CopyButton = ({ text, className = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleCopy}
      title="Copy response"
    >
      {copied ? (
        <>
          <Check size={14} /> Copied
        </>
      ) : (
        <>
          <Copy size={14} /> Copy
        </>
      )}
    </button>
  );
};

/* =========================================================
   CODE BLOCK
========================================================= */

const CodeBlock = ({ language, code }) => {
  return (
    <div className="sf-ai-page-code-block">
      <div className="sf-ai-page-code-header">
        <span>{language || "code"}</span>
        <CopyButton text={code} className="sf-ai-page-copy-code-btn" />
      </div>
      <div className="sf-ai-page-code-content">
        <SyntaxHighlighter
          language={language || "text"}
          style={oneDark}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: "16px",
            background: "transparent",
            borderRadius: 0,
          }}
          codeTagProps={{ style: { fontFamily: "var(--font-mono)" } }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

/* =========================================================
   AI MARKDOWN MESSAGE
========================================================= */

const AIMessageContent = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="sf-ai-md-h1">{children}</h1>,

        h2: ({ children }) => <h2 className="sf-ai-md-h2">{children}</h2>,

        h3: ({ children }) => <h3 className="sf-ai-md-h3">{children}</h3>,

        h4: ({ children }) => <h4 className="sf-ai-md-h4">{children}</h4>,

        p: ({ children }) => <p className="sf-ai-md-p">{children}</p>,

        ul: ({ children }) => <ul className="sf-ai-md-ul">{children}</ul>,

        ol: ({ children }) => <ol className="sf-ai-md-ol">{children}</ol>,

        li: ({ children }) => <li className="sf-ai-md-li">{children}</li>,

        strong: ({ children }) => (
          <strong className="sf-ai-md-strong">{children}</strong>
        ),

        em: ({ children }) => <em className="sf-ai-md-em">{children}</em>,

        table: ({ children }) => (
          <div className="sf-ai-md-table-wrapper">
            <table className="sf-ai-md-table">{children}</table>
          </div>
        ),

        thead: ({ children }) => (
          <thead className="sf-ai-md-thead">{children}</thead>
        ),

        tbody: ({ children }) => (
          <tbody className="sf-ai-md-tbody">{children}</tbody>
        ),

        tr: ({ children }) => <tr className="sf-ai-md-tr">{children}</tr>,

        th: ({ children }) => <th className="sf-ai-md-th">{children}</th>,

        td: ({ children }) => <td className="sf-ai-md-td">{children}</td>,

        blockquote: ({ children }) => (
          <blockquote className="sf-ai-md-blockquote">{children}</blockquote>
        ),

        hr: () => <hr className="sf-ai-md-hr" />,

        a: ({ children, href }) => (
          <a
            className="sf-ai-md-link"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),

        code: ({ className, children, ...props }) => {
          const code = String(children).replace(/\n$/, "");

          const match = /language-([\w+-]+)/.exec(className || "");

          /*
          =================================================
          CODE BLOCK
          =================================================
          */

          const isCodeBlock =
            match ||
            props.node?.position?.start.line !== props.node?.position?.end.line;

          if (isCodeBlock) {
            return <CodeBlock language={match?.[1] || "text"} code={code} />;
          }

          /*
          =================================================
          INLINE CODE
          =================================================
          */

          return <code className="sf-ai-md-inline-code">{children}</code>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

const AIChat = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([INITIAL_MESSAGE]);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  /* Auto Scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, loading]);

  /* Send Message */
  const handleSend = async () => {
    const text = message.trim();
    if (!text || loading) return;

    const history = conversation
      .filter((item) => item.role === "user" || item.role === "assistant")
      .slice(-4)
      .map((item) => ({
        role: item.role,
        content: item.content.slice(0, 500),
      }));

    setConversation((prev) => [...prev, { role: "user", content: text }]);

    setMessage("");
    setLoading(true);

    try {
      const data = await sendAIMessage({
        message: text,
        conversation: history,
      });

      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "No response received.",
        },
      ]);
    } catch (error) {
      console.error("AI PAGE ERROR:", error);
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Unable to connect with AI. Please check your network and try again.",
        },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  /* Enter key handling */
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  /* Clear Chat */
  const clearChat = () => {
    setConversation([INITIAL_MESSAGE]);
    setMessage("");
  };

  /* Quick Prompts */
  const quickQuestions = [
    "Explain React hooks with real-world examples",
    "MongoDB aggregation pipeline explain karo",
    "How does JWT authentication work step-by-step?",
    "Help me review and debug my JavaScript code",
  ];

  const askQuestion = (question) => {
    setMessage(question);
    textareaRef.current?.focus();
  };

  return (
    <>
      <div className="sf-ai-page">
        {/* ================= HEADER ================= */}
        <header className="sf-ai-page-header">
          <div className="sf-ai-page-title">
            <div className="sf-ai-page-icon">
              <Sparkles size={20} />
            </div>
            <div>
              <h1>LearnSpace AI</h1>
              <p>Your interactive AI learning companion</p>
            </div>
          </div>

          <div className="sf-ai-header-actions">
            {conversation.length > 1 && (
              <button
                type="button"
                className="sf-ai-clear-btn"
                onClick={clearChat}
                title="Reset conversation"
              >
                <Trash2 size={16} />
                <span>Clear Chat</span>
              </button>
            )}

            <button
              type="button"
              className="sf-ai-back-btn"
              onClick={() => navigate(-1)}
              aria-label="Close AI Chat"
              title="Go back"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          </div>
        </header>

        {/* ================= CHAT VIEWPORT ================= */}
        <main className="sf-ai-page-chat">
          {conversation.length === 1 && (
            <section className="sf-ai-page-welcome">
              <div className="sf-ai-big-icon">
                <Bot size={36} />
              </div>

              <h2>How can I assist your learning today?</h2>
              <p>
                Ask concepts about your courses, debug complex errors, or
                prepare for technical assessments.
              </p>

              <div className="sf-ai-page-suggestions">
                {quickQuestions.map((question) => (
                  <button
                    type="button"
                    key={question}
                    className="sf-ai-suggestion-chip"
                    onClick={() => askQuestion(question)}
                  >
                    <span>✨</span> {question}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* MESSAGES STREAM */}
          <div className="sf-ai-page-messages">
            {conversation.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`sf-ai-page-message-row ${item.role}`}
              >
                <div className="sf-ai-page-message-inner">
                  <div className={`sf-ai-page-avatar ${item.role}`}>
                    {item.role === "user" ? (
                      <User size={16} />
                    ) : (
                      <Bot size={16} />
                    )}
                  </div>

                  <div className="sf-ai-page-message-content">
                    <span className="sf-ai-author">
                      {item.role === "user" ? "You" : "LearnSpace AI"}
                    </span>
                    {item.role === "user" ? (
                      <div className="sf-ai-page-bubble-text user">
                        {item.content}
                      </div>
                    ) : (
                      <div className="sf-ai-page-bubble-text assistant">
                        <AIMessageContent content={item.content} />
                        <CopyButton
                          text={item.content}
                          className="sf-ai-page-copy-response-btn"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* TYPING LOADER */}
            {loading && (
              <div className="sf-ai-page-message-row assistant">
                <div className="sf-ai-page-message-inner">
                  <div className="sf-ai-page-avatar assistant">
                    <Bot size={16} />
                  </div>
                  <div className="sf-ai-page-message-content">
                    <span className="sf-ai-author">LearnSpace AI</span>
                    <div className="sf-ai-typing-indicator">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </main>

        {/* ================= INPUT FOOTER ================= */}
        <footer className="sf-ai-page-input-section">
          <div className="sf-ai-input-neumorphic-box">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask LearnSpace AI anything (Shift + Enter for new line)..."
              rows={1}
              disabled={loading}
            />

            <button
              type="button"
              className="sf-ai-send-btn"
              onClick={handleSend}
              disabled={!message.trim() || loading}
              aria-label="Send query"
            >
              <Send size={16} />
            </button>
          </div>

          <p className="sf-ai-disclaimer">
            LearnSpace AI provides AI-assisted guidance. Always double-check
            critical project code and syntax.
          </p>
        </footer>
      </div>
    </>
  );
};

export default AIChat;
