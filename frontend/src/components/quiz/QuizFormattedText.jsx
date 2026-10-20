import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const FUNCTION_ATOM =
  String.raw`(?:\\?(?:log|ln|sin|cos|tan|cot|sec|csc|sqrt)\s*(?:_\{?[A-Za-z0-9]+\}?|_[A-Za-z0-9]+)?\s*\([^()\n]+\)|[A-Za-z]\s*(?:\^\{?[A-Za-z0-9]+\}?|_[A-Za-z0-9]+)|\d+(?:\.\d+)?\s*\^\s*\{?\d+\}?)`;
const PLAIN_MATH_EXPRESSION = new RegExp(
  `${FUNCTION_ATOM}(?:\\s*(?:[+−*/=×]|\\b(?:plus|minus|times)\\b)\\s*${FUNCTION_ATOM})*`,
  "gi",
);

function formatLegacyMath(text) {
  const normalizedDelimiters = text
    .replace(/\\\[/g, () => "$$")
    .replace(/\\\]/g, () => "$$")
    .replace(/\\\(/g, () => "$")
    .replace(/\\\)/g, () => "$");

  if (normalizedDelimiters.includes("$")) return normalizedDelimiters;

  return normalizedDelimiters.replace(PLAIN_MATH_EXPRESSION, (expression) => {
    const latex = expression
      .replace(/\b(log|ln|sin|cos|tan|cot|sec|csc)\b/gi, (_, name) => `\\${name.toLowerCase()}`)
      .replace(/\bsqrt\b/gi, "\\sqrt")
      .replace(/\bdegrees?\b/gi, "^\\circ")
      .replace(/\*/g, "\\times");
    return `$${latex}$`;
  });
}

const markdownComponents = {
  p: ({ children }) => <span>{children}</span>,
  h1: ({ children }) => <span className="font-bold">{children}</span>,
  h2: ({ children }) => <span className="font-bold">{children}</span>,
  h3: ({ children }) => <span className="font-bold">{children}</span>,
  h4: ({ children }) => <span className="font-bold">{children}</span>,
  h5: ({ children }) => <span className="font-bold">{children}</span>,
  h6: ({ children }) => <span className="font-bold">{children}</span>,
};

export default function QuizFormattedText({ children, className = "" }) {
  const text = typeof children === "string" ? formatLegacyMath(children) : "";

  return (
    <span className={`quiz-formatted-text ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={markdownComponents}
      >
        {text}
      </ReactMarkdown>
    </span>
  );
}
