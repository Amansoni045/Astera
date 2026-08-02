"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("markdown-body text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300 space-y-4", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-8 mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800 leading-snug">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-7 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-6 mb-2.5">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-5 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-3 leading-relaxed text-zinc-700 dark:text-zinc-300">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-4 space-y-2 list-disc list-outside pl-5 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 space-y-2 list-decimal list-outside pl-5 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-1 leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 pl-4 border-l-4 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 py-2.5 pr-4 rounded-r-xl italic text-[15px] text-zinc-700 dark:text-zinc-300">
              {children}
            </blockquote>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline = !codeClassName;
            if (isInline) {
              return (
                <code
                  className="rounded-md bg-zinc-100 dark:bg-zinc-800/80 px-1.5 py-0.5 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <div className="my-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-md">
                <pre className="overflow-x-auto p-4 font-mono text-xs text-zinc-100 leading-relaxed">
                  <code className={codeClassName} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          table: ({ children }) => (
            <div className="my-6 w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900/60">
              <table className="w-full text-left text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 divide-y divide-zinc-200 dark:divide-zinc-800">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-100/90 dark:bg-zinc-800/90 text-xs uppercase font-semibold text-zinc-900 dark:text-zinc-100 tracking-wider">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 leading-snug">{children}</td>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline inline-items-center gap-0.5"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-6 border-zinc-200 dark:border-zinc-800" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
