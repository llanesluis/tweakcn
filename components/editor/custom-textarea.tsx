"use client";

import React, { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";
import { suggestion } from "@/components/editor/mention-suggestion"; // We'll create this next

interface CustomTextareaProps {
  onContentChange: (textContent: string, jsonContent: JSONContent) => void;
}

const CustomTextarea: React.FC<CustomTextareaProps> = ({ onContentChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: suggestion,
      }),
      Placeholder.configure({
        placeholder: "Describe your theme...",
        emptyEditorClass:
          "cursor-text before:content-[attr(data-placeholder)] before:absolute before:top-2 before:left-3 before:text-mauve-11 before:opacity-50 before-pointer-events-none",
      }),
    ],
    autofocus: true,
    editorProps: {
      attributes: {
        class:
          "min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50",
      },
    },
    onUpdate: ({ editor }) => {
      onContentChange(editor.getText(), editor.getJSON());
    },
  });

  return <EditorContent editor={editor} />;
};

export default CustomTextarea;
