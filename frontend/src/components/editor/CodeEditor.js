import React, { useEffect } from 'react';
import { EditorView, minimalSetup } from "codemirror";
import { StreamLanguage } from "@codemirror/language";
import { c } from "@codemirror/legacy-modes/mode/clike";
import { lineNumbers } from "@codemirror/view";
import { EditorState } from "@codemirror/state";

function CodeEditor({ isRunning, setEditorContent }) {
  useEffect(() => {
    const editorParent = document.getElementById('editor');
    if (editorParent) {
      const view = new EditorView({
        extensions: [
          minimalSetup, 
          StreamLanguage.define(c), 
          lineNumbers(),
          EditorState.readOnly.of(!isRunning), 
          EditorView.updateListener.of((update) => {
            if (update.changes) {
              setEditorContent(update.state.doc.toString());
            }
          }),
          EditorView.theme({
            "&": { height: "100%" },
            ".cm-scroller": { overflow: "auto" },
            ".cm-content": { fontSize: "16px" },
          }),
        ],
        parent: editorParent, 
        doc: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
      });

      return () => {
        view.destroy();
      };
    }
  }, [isRunning, setEditorContent]);

  return <div id="editor" className="border rounded overflow-auto" style={{ height: '43vh' }} />;
}

export default CodeEditor;
