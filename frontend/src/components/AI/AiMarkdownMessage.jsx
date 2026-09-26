import { useState } from "react";
import {
  Copy,
  Check,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

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

export default AIMessageContent;
