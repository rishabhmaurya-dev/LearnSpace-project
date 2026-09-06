import { useEffect, useRef, useState } from "react";

import {
  Bot,
  Send,
  X,
  Trash2,
  Sparkles,
  Maximize2,
  Copy,
  Check,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

import { streamAIMessage } from "../../services/ai.service";

import "./LearnSpaceAi.css";

const createMessage = (role, content) => ({
  id: crypto.randomUUID(),
  role,
  content,
});

const INITIAL_MESSAGE = createMessage(
  "assistant",
  "Hello 👋 I'm **LearnSpace AI**.\n\nHow can I help you today?",
);

const CopyButton = ({
  text,
  className = "",
  copiedText = "Copied",
  copyText = "Copy",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleCopy}
      title={copyText}
      aria-label={copyText}
    >
      {copied ? (
        <>
          <Check size={14} />
          {copiedText}
        </>
      ) : (
        <>
          <Copy size={14} />
          {copyText}
        </>
      )}
    </button>
  );
};

const CodeBlock = ({ language, code }) => {
  return (
    <div className="sf-ai-code-block">
      <div className="sf-ai-code-header">
        <span>{language || "code"}</span>

        <CopyButton
          text={code}
          className="sf-ai-copy-code-button"
          copiedText="Copied"
          copyText="Copy"
        />
      </div>

      <div className="sf-ai-code-content">
        <SyntaxHighlighter
          language={language || "text"}
          style={oneLight}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: "16px",
            background: "transparent",
            borderRadius: 0,
          }}
          codeTagProps={{
            style: {
              fontFamily: "var(--font-mono)",
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

const AIMessageContent = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="sf-ai-markdown-h1">{children}</h1>,

        h2: ({ children }) => <h2 className="sf-ai-markdown-h2">{children}</h2>,

        h3: ({ children }) => <h3 className="sf-ai-markdown-h3">{children}</h3>,

        h4: ({ children }) => <h4 className="sf-ai-markdown-h4">{children}</h4>,

        p: ({ children }) => <p className="sf-ai-markdown-p">{children}</p>,

        ul: ({ children }) => <ul className="sf-ai-markdown-ul">{children}</ul>,

        ol: ({ children }) => <ol className="sf-ai-markdown-ol">{children}</ol>,

        li: ({ children }) => <li className="sf-ai-markdown-li">{children}</li>,

        strong: ({ children }) => (
          <strong className="sf-ai-markdown-strong">{children}</strong>
        ),

        em: ({ children }) => <em className="sf-ai-markdown-em">{children}</em>,

        table: ({ children }) => (
          <div className="sf-ai-table-wrapper">
            <table className="sf-ai-table">{children}</table>
          </div>
        ),

        thead: ({ children }) => <thead>{children}</thead>,

        tbody: ({ children }) => <tbody>{children}</tbody>,

        tr: ({ children }) => <tr>{children}</tr>,

        th: ({ children }) => <th>{children}</th>,

        td: ({ children }) => <td>{children}</td>,

        blockquote: ({ children }) => (
          <blockquote className="sf-ai-blockquote">{children}</blockquote>
        ),

        hr: () => <hr className="sf-ai-hr" />,

        a: ({ children, href }) => (
          <a
            className="sf-ai-markdown-link"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),

        code: ({ inline, className, children }) => {
          const match = /language-([\w+-]+)/.exec(className || "");

          const code = String(children).replace(/\n$/, "");

          if (!inline && match) {
            return <CodeBlock language={match[1]} code={code} />;
          }

          if (!inline && code.includes("\n")) {
            return <CodeBlock language="text" code={code} />;
          }

          return <code className="sf-ai-inline-code">{children}</code>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

const LearnSpace = () => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [conversation, setConversation] = useState([INITIAL_MESSAGE]);

  const messagesEndRef = useRef(null);

  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [conversation, loading]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";

    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
  }, [message]);

  const handleSend = async (customMessage) => {
    const text = (customMessage || message).trim();

    if (!text || loading) {
      return;
    }

    const userMessage = createMessage("user", text);

    // exclude initial welcome message from API conversation
    const previousConversation = conversation
      .filter(
        (item) =>
          item.id !== INITIAL_MESSAGE.id &&
          (item.role === "user" || item.role === "assistant") &&
          item.content.trim(),
      )
      .slice(-4)
      .map((item) => ({
        role: item.role,
        content: item.content.slice(0, 500),
      }));

    setConversation((prev) => [...prev, userMessage]);

    setMessage("");

    setLoading(true);

    try {
      const assistantMessageId = crypto.randomUUID();

      setConversation((prev) => [
        ...prev,
        { id: assistantMessageId, role: "assistant", content: "" },
      ]);

      const updateAssistant = (partial) =>
        setConversation((prev) =>
          prev.map((item) =>
            item.id === assistantMessageId
              ? { ...item, content: item.content + partial }
              : item,
          ),
        );

      const patchErrorMessage = (text) =>
        setConversation((prev) =>
          prev.map((item) =>
            item.id === assistantMessageId ? { ...item, content: text } : item,
          ),
        );

      try {
        await streamAIMessage(
          {
            message: text,
            conversation: previousConversation,
          },
          {
            onDelta: (delta) => updateAssistant(delta),
            onError: (errorMsg) => {
              patchErrorMessage(`⚠️ **${errorMsg}**`);
            },
          },
        );

        setConversation((prev) =>
          prev.map((item) =>
            item.id === assistantMessageId && !item.content.trim()
              ? { ...item, content: "Sorry, I couldn't generate a response." }
              : item,
          ),
        );
      } catch (error) {
        console.error("LearnSpace AI Stream Error:", error);

        patchErrorMessage(
          "⚠️ **AI service is currently unavailable.**\n\nPlease try again.",
        );
      }
    } catch (error) {
      console.error("LearnSpace AI Error:", error);
    } finally {
      setLoading(false);

      window.setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();

      handleSend();
    }
  };

  const clearChat = () => {
    if (loading) return;

    setConversation([
      createMessage(
        "assistant",
        "Hello 👋 I'm **LearnSpace AI**.\n\nHow can I help you today?",
      ),
    ]);

    setMessage("");

    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const openFullAI = () => {
    setIsOpen(false);

    navigate("/ai");
  };

  const quickQuestions = [
    "Explain React useState",
    "MongoDB aggregation kya hai?",
    "JWT authentication kaise work karta hai?",
  ];

  const askQuickQuestion = (question) => {
    if (loading) return;

    handleSend(question);
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          className="sf-ai-floating-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open LearnSpace AI"
        >
          <Bot size={27} />

          <span className="sf-ai-online-dot" />
        </button>
      )}

      {isOpen && (
        <div className="sf-ai-container">
          <div className="sf-ai-header">
            <div className="sf-ai-header-info">
              <div className="sf-ai-logo">
                <Sparkles size={20} />
              </div>

              <div>
                <h3>LearnSpace AI</h3>

                <p>AI Learning Assistant</p>
              </div>
            </div>

            <div className="sf-ai-header-actions">
              <button
                type="button"
                onClick={openFullAI}
                title="Open full AI"
                aria-label="Open full AI"
              >
                <Maximize2 size={17} />
              </button>

              <button
                type="button"
                onClick={clearChat}
                title="Clear chat"
                aria-label="Clear chat"
                disabled={loading}
              >
                <Trash2 size={17} />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="sf-ai-body">
            {conversation.length === 1 && !loading && (
              <div className="sf-ai-welcome">
                <div className="sf-ai-welcome-icon">
                  <Bot size={28} />
                </div>

                <h2>How can I help?</h2>

                <p>
                  Ask me about programming, courses, debugging and technology.
                </p>

                <div className="sf-ai-quick-questions">
                  {quickQuestions.map((question) => (
                    <button
                      type="button"
                      key={question}
                      onClick={() => askQuickQuestion(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="sf-ai-messages">
              {conversation
                .filter(
                  (item) => item.role === "user" || item.content.trim(),
                )
                .map((item) => (
                <div
                  key={item.id}
                  className={`sf-ai-message-row ${
                    item.role === "user"
                      ? "sf-ai-user-row"
                      : "sf-ai-assistant-row"
                  }`}
                >
                  {item.role === "assistant" && (
                    <div className="sf-ai-avatar">
                      <Bot size={16} />
                    </div>
                  )}

                  <div
                    className={`sf-ai-message ${
                      item.role === "user"
                        ? "sf-ai-user-message"
                        : "sf-ai-assistant-message"
                    }`}
                  >
                    {item.role === "assistant" ? (
                      <>
                        <div className="sf-ai-markdown">
                          <AIMessageContent content={item.content} />
                        </div>

                        <CopyButton
                          text={item.content}
                          className="sf-ai-copy-response-button"
                          copiedText="Copied"
                          copyText="Copy response"
                        />
                      </>
                    ) : (
                      <div className="sf-ai-user-content">{item.content}</div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="sf-ai-message-row sf-ai-assistant-row">
                  <div className="sf-ai-avatar">
                    <Bot size={16} />
                  </div>

                  <div className="sf-ai-message sf-ai-assistant-message sf-ai-loading-message">
                    <div className="sf-ai-typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="sf-ai-input-wrapper">
            <div className="sf-ai-input-box">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask LearnSpace AI..."
                rows={1}
                disabled={loading}
              />

              <button
                type="button"
                className="sf-ai-send-button"
                onClick={() => handleSend()}
                disabled={!message.trim() || loading}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>

            <p className="sf-ai-disclaimer">
              LearnSpace AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default LearnSpace;
