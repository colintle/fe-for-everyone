import React, { useState, useEffect } from 'react';
import { StreamLanguage } from "@codemirror/language";
import { c } from "@codemirror/legacy-modes/mode/clike"; 
import { EditorView, minimalSetup } from "codemirror";
import { lineNumbers } from "@codemirror/view";
import { EditorState } from "@codemirror/state"; // Import EditorState
import Loading from '../Loading';
import { MdOutlineCheckCircle, MdOutlineCircle, MdPlayArrow, MdStop } from "react-icons/md";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

function Single() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isRunning, setIsRunning] = useState(false);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isRunning, timeLeft]);

  useEffect(() => {
    const editorParent = document.getElementById('editor');
    if (editorParent) {
      let view = new EditorView({
        extensions: [
          minimalSetup, 
          StreamLanguage.define(c), // Define C language mode
          lineNumbers(), // Enable line numbers
          EditorState.readOnly.of(!isRunning), // Set readOnly based on isRunning
          EditorView.theme({
            "&": {
              height: "100%", // Stretch to fill parent container
            },
            ".cm-scroller": {
              overflow: "auto",
            },
            ".cm-content": {
              fontSize: "16px", // Increase the font size
            },
          }),
        ],
        parent: editorParent, // Attach editor to DOM element
        doc: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
      });

      return () => {
        view.destroy(); // Clean up the editor instance when the component unmounts
      };
    }
  }, [isRunning]); // Re-run this effect whenever isRunning changes

  const handleToggleCompletion = () => {
    setLoading(true);
    setTimeout(() => {
      setIsCompleted(!isCompleted);
      setLoading(false);
    }, 1000);
  };

  const handleStartStopTimer = () => {
    setLoading(true);
    setTimeout(() => {
      setIsRunning(!isRunning);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button 
          className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200 ${
            !isRunning ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!isRunning} // Disable when the timer is paused
        >
          Run Code
        </button>
        <div className="flex-1 text-2xl text-center text-blue-600">
          {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}
        </div>
        <div className="flex items-center">
          <button onClick={handleToggleCompletion} disabled={loading} className="mr-4">
            {loading ? <Loading /> : isCompleted ? <MdOutlineCheckCircle className="text-blue-600 text-2xl" /> : <MdOutlineCircle className="text-blue-600 text-2xl" />}
          </button>
          <button onClick={handleStartStopTimer} disabled={loading} className="mr-4">
            {loading ? <Loading /> : isRunning ? <MdStop className="text-blue-600 text-2xl" /> : <MdPlayArrow className="text-blue-600 text-2xl" />}
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Exit
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-2 flex-grow h-5/6">
        <div className="border rounded overflow-auto h-full" style={{ pointerEvents: isRunning ? 'auto' : 'none', opacity: isRunning ? 1 : 0.5 }}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <Viewer 
              fileUrl="/FE-May23.pdf" 
              plugins={[defaultLayoutPluginInstance]}
            />
          </Worker>
        </div>

        <div className="flex flex-col gap-2">
          {/* Code Editor */}
          <div id="editor" className="border rounded overflow-auto" style={{ height: '43vh' }}>
            {/* The editor will be rendered in this div */}
          </div>

          {/* Output and Test Cases */}
          <div 
            className="border rounded overflow-y-auto p-4" 
            style={{ height: '43vh', whiteSpace: 'pre-wrap', overflowX: 'hidden' }}
          >
            {"main.c: In function 'multiplyMatrices':\nmain.c:34:22: warning: implicit declaration of function 'createMatrx'; did you mean 'createMatrix'? [-Wimplicit-function-declaration]\n   34 |     Matrix *result = createMatrx(a->rows, b->cols);\n      |                      ^~~~~~~~~~~\n      |                      createMatrix\nmain.c:34:22: warning: initialization of 'Matrix *' from 'int' makes pointer from integer without a cast [-Wint-conversion]\n/usr/bin/ld: /tmp/ccF4ik20.o: in function `multiplyMatrices':\nmain.c:(.text+0x139): undefined reference to `createMatrx'\ncollect2: error: ld returned 1 exit status\nchmod: cannot access 'a.out': No such file or directory\n".split('\n').map((line, index) => (
              <div className='font-mono' key={index}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Single;
