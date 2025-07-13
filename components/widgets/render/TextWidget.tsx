"use client";

import React, { useCallback, useRef, useEffect } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import type { BlockNoteEditor } from "@blocknote/core";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Icon } from "@/common/Icon";
import type { TextWidget as TextWidgetType } from "@/types/widget";
import { useThemeStore } from "@/store/themeStore";
import { useGridStore } from "@/store/gridStore";

// Import BlockNote styles
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

interface TextWidgetProps {
  widget: TextWidgetType;
  isTextEditing?: boolean;
}

export const TextWidget: React.FC<TextWidgetProps> = ({
  widget,
  isTextEditing = false,
}) => {
  const { theme } = useThemeStore();
  const { updateWidget } = useGridStore();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize BlockNote editor
  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent:
      widget.config.blockNoteContent ||
      (widget.config.content
        ? // Convert plain text to BlockNote format
          widget.config.content.split("\n").map((line) => ({
            type: "paragraph" as const,
            content: line || "",
          }))
        : // Default empty paragraph
          [
            {
              type: "paragraph" as const,
              content: "",
            },
          ]),
  });

  const handleEditorChange = async () => {
    const blocks = editor.document;
    const markdown = await editor.blocksToMarkdownLossy(blocks);

    // Actualizar el estado local inmediatamente para mejor UX
    updateWidget(widget._id, {
      config: {
        content: markdown.trim(),
        blockNoteContent: blocks,
      },
    });
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Check if content is empty
  const isEmpty = !widget.config.content?.trim();

  const handleContentClick = useCallback(() => {
    // Only handle click if not in editing mode - let the floating toolbar handle edit activation
    if (!isTextEditing && isEmpty) {
      // Show some visual feedback for empty state
      return;
    }
  }, [isTextEditing, isEmpty]);

  if (isTextEditing) {
    return (
      <div className="text-widget__editor-container">
        <BlockNoteView
          editor={editor}
          className="text-widget__blocknote"
          onChange={handleEditorChange}
          theme={theme === "dark" ? "dark" : "light"}
          slashMenu={true}
          data-color-scheme={theme}
          style={{
            minHeight: "120px",
            fontSize: widget.config.fontSize || 16,
          }}
        />
      </div>
    );
  }

  return (
    // Read-only Mode
    <div
      className={`text-widget__content ${
        isEmpty ? "text-widget__content--empty" : ""
      }`}
      onClick={handleContentClick}
    >
      {isEmpty ? (
        <div className="text-widget__placeholder">
          <Icon name="type" size={24} />
          <span>Click "Edit text" in toolbar to add content</span>
        </div>
      ) : (
        <div className="text-widget__markdown">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom components for consistent styling
              h1: ({ children }) => (
                <h1 className="text-widget__markdown-h1">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-widget__markdown-h2">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-widget__markdown-h3">{children}</h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-widget__markdown-h4">{children}</h4>
              ),
              h5: ({ children }) => (
                <h5 className="text-widget__markdown-h5">{children}</h5>
              ),
              h6: ({ children }) => (
                <h6 className="text-widget__markdown-h6">{children}</h6>
              ),
              p: ({ children }) => (
                <p className="text-widget__markdown-p">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="text-widget__markdown-ul">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="text-widget__markdown-ol">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-widget__markdown-li">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="text-widget__markdown-blockquote">
                  {children}
                </blockquote>
              ),
              code: ({ children, className }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="text-widget__markdown-code-inline">
                    {children}
                  </code>
                ) : (
                  <code className="text-widget__markdown-code-block">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="text-widget__markdown-pre">{children}</pre>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="text-widget__markdown-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              strong: ({ children }) => (
                <strong className="text-widget__markdown-strong">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="text-widget__markdown-em">{children}</em>
              ),
            }}
          >
            {widget.config.content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};
