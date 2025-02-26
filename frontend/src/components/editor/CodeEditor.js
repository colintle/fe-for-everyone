import React, { useEffect } from 'react';
import { EditorView, minimalSetup } from "codemirror";
import { keymap, lineNumbers } from "@codemirror/view";
import { indentWithTab } from '@codemirror/commands';
import { StreamLanguage } from "@codemirror/language";
import { c } from "@codemirror/legacy-modes/mode/clike";
import { EditorState } from "@codemirror/state";

function CodeEditor({ isRunning, editorContent, setEditorContent }) {
  useEffect(() => {
    const editorParent = document.getElementById('editor');
    if (editorParent) {
      const view = new EditorView({
        extensions: [
          minimalSetup,
          keymap.of([indentWithTab]),
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
        doc: editorContent,
      });

      return () => {
        view.destroy();
      };
    }
  // eslint-disable-next-line
  }, [isRunning]);

  return <div id="editor" className="border rounded overflow-auto" style={{ height: '43vh' }} />;
}

export default CodeEditor;
