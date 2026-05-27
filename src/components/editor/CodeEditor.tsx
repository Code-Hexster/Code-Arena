"use client";

import { useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { OnMount, OnChange } from "@monaco-editor/react";

// Dynamic import — Monaco requires browser APIs
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-abyss rounded-lg flex items-center justify-center">
      <div className="flex items-center gap-3 text-mist">
        <div className="w-5 h-5 border-2 border-arcane-500 border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-sm">Loading editor...</span>
      </div>
    </div>
  ),
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
}

// Custom dark fantasy Monaco theme
const ARENA_THEME = {
  base: "vs-dark" as const,
  inherit: true,
  rules: [
    { token: "comment", foreground: "64748b", fontStyle: "italic" },
    { token: "keyword", foreground: "F4D068" },
    { token: "string", foreground: "FCD375" },
    { token: "number", foreground: "3B82F6" },
    { token: "type", foreground: "10B981" },
    { token: "function", foreground: "3B82F6" },
    { token: "variable", foreground: "e8dcc8" },
    { token: "operator", foreground: "94a3b8" },
    { token: "delimiter", foreground: "94a3b8" },
  ],
  colors: {
    "editor.background": "#010103",
    "editor.foreground": "#e8dcc8",
    "editor.lineHighlightBackground": "#F4D06808",
    "editor.selectionBackground": "#F4D06825",
    "editorCursor.foreground": "#F4D068",
    "editorLineNumber.foreground": "#475569",
    "editorLineNumber.activeForeground": "#F4D068",
    "editor.inactiveSelectionBackground": "#F4D06810",
    "editorWidget.background": "#010103",
    "editorWidget.border": "#D9B44A20",
    "editorSuggestWidget.background": "#010103",
    "editorSuggestWidget.border": "#D9B44A20",
    "editorSuggestWidget.selectedBackground": "#F4D06815",
    "scrollbarSlider.background": "#F4D06815",
    "scrollbarSlider.hoverBackground": "#F4D06830",
  },
};

export default function CodeEditor({
  value,
  onChange,
  language = "python",
  readOnly = false,
  height = "400px",
}: CodeEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    // Define custom theme
    monaco.editor.defineTheme("arena-dark", ARENA_THEME);
    monaco.editor.setTheme("arena-dark");

    // Focus editor
    editor.focus();
  }, []);

  const handleChange: OnChange = useCallback(
    (val) => {
      onChange(val || "");
    },
    [onChange]
  );

  return (
    <div className="rounded-lg overflow-hidden border border-energy/20 bg-void shadow-card h-full flex flex-col w-full">
      {/* Editor header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-void border-b border-energy/10 shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
        <span className="ml-2 text-smoke text-[10px] uppercase tracking-widest font-mono font-bold">
          {language === "html" ? "index.html" : language === "css" ? "style.css" : "solution.py"}
        </span>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0 relative w-full h-full">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={handleChange}
          onMount={handleMount}
          options={{
            fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          lineNumbers: "on",
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 12,
          lineNumbersMinChars: 3,
          renderLineHighlight: "line",
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          wordWrap: "on",
          tabSize: 4,
          readOnly,
          automaticLayout: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          bracketPairColorization: { enabled: true },
        }}
      />
      </div>
    </div>
  );
}
