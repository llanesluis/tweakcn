"use client";

import React, { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
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
    ],
    editorProps: {
      attributes: {
        class:
          "min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50",
      },
    },
    onUpdate: ({ editor }) => {
      onContentChange(editor.getText(), editor.getJSON());
    },
  });

  return <EditorContent editor={editor} />;
};

export default CustomTextarea;
