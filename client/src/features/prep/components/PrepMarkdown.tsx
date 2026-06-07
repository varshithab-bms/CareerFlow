import ReactMarkdown from "react-markdown";

interface PrepMarkdownProps {
  content: string;
}

export function PrepMarkdown({ content }: PrepMarkdownProps) {
  return (
    <ReactMarkdown
      className="prep-md max-w-none text-slate-700"
      components={{
        h2: ({ children }) => (
          <h2 className="mt-10 border-b border-slate-200 pb-2 text-xl font-semibold text-slate-900 first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-6 text-lg font-semibold text-slate-900">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="mt-3 leading-relaxed text-slate-700">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-700">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => (
          <strong className="font-semibold text-slate-900">{children}</strong>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="font-medium text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
            target="_blank"
            rel="noreferrer noopener"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
