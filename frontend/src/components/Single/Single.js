import React, { useState, useEffect } from 'react';
import { StreamLanguage } from "@codemirror/language";
import { c } from "@codemirror/legacy-modes/mode/clike"; 
import { EditorView, minimalSetup } from "codemirror";
import { lineNumbers } from "@codemirror/view";
import { EditorState } from "@codemirror/state"; 
import { MdDownload, MdOutlineCheckCircle, MdOutlineCircle, MdPlayArrow, MdStop, MdOutlineExitToApp } from "react-icons/md";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { useNavigate } from 'react-router-dom';

import Download from './Download';
import Loading from '../Loading';  // Assuming this is the correct path for your Loading component

function Single({ problem }) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);  // Unified loading state
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("Run code to see output!"); 
  const [isCodeRunning, setIsCodeRunning] = useState(false); 
  const [editorContent, setEditorContent] = useState(""); // State to store editor content
  const [downloadModal, setDownloadModal] = useState(false);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const navigate = useNavigate();

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsRunning(false); // Pause the timer when it hits zero
    }
  }, [isRunning, timeLeft]);

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
              setEditorContent(update.state.doc.toString()); // Capture editor content
            }
          }),
          EditorView.theme({
            "&": {
              height: "100%", 
            },
            ".cm-scroller": {
              overflow: "auto",
            },
            ".cm-content": {
              fontSize: "16px", 
            },
          }),
        ],
        parent: editorParent, 
        doc: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
      });

      return () => {
        view.destroy(); 
      };
    }
  }, [isRunning]); 

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
      if (!isRunning && timeLeft === 0) {
        setTimeLeft(7200); // Reset the timer to 2 hours if it has hit zero
      }
      setIsRunning(!isRunning);
      setLoading(false);
    }, 1000);
  };

  const handleRunCode = () => {
    setLoading(true);
    setIsCodeRunning(true); 
    setTimeout(() => {
      setOutput(`Code executed successfully! Here is the output:\n${editorContent}`);
      setIsCodeRunning(false); 
      setLoading(false);
    }, 2000); 
  };

  const handleExit = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/"); // Navigate to the home page
    }, 1000);
  };

  const handleDownload = (filename) => {
    setLoading(true);
    setDownloadModal(false);
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob([editorContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${filename || 'code'}.c`;
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
      document.body.removeChild(element); // Clean up after download
      setLoading(false);
    }, 2000); // Simulate download delay
  };

  return (
    <div className="p-8 h-screen flex flex-col relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
          <Loading />
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={handleRunCode}
          className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200 ${
            !isRunning ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!isRunning} 
        >
          Run Code
        </button>
        <div className="flex-1 text-2xl text-center text-blue-600">
          {Math.floor(timeLeft / 3600)}:{Math.floor((timeLeft % 3600) / 60) < 10 ? `0${Math.floor((timeLeft % 3600) / 60)}` : Math.floor((timeLeft % 3600) / 60)}:{timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}
        </div>
        <div className="flex items-center">
          <div onClick={handleToggleCompletion} className="mr-2" title="Toggle Completion">
            {isCompleted ? <MdOutlineCheckCircle className="text-blue-600 text-2xl cursor-pointer" /> : <MdOutlineCircle className="text-blue-600 text-2xl cursor-pointer" />}
          </div>
          <div onClick={handleStartStopTimer} className="mr-2" title={isRunning ? "Stop Timer" : "Start Timer"}>
            {isRunning ? <MdStop className="text-blue-600 text-2xl cursor-pointer" /> : <MdPlayArrow className="text-blue-600 text-2xl cursor-pointer" />}
          </div>
          <MdDownload 
            onClick={() => setDownloadModal(true)} 
            className="text-blue-600 text-2xl cursor-pointer hover:text-blue-700 mr-2"
            title="Download Code"
          />
          <MdOutlineExitToApp 
            onClick={handleExit} 
            className="text-blue-600 text-2xl cursor-pointer hover:text-blue-700"
            title="Exit"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 flex-grow h-5/6">
        <div className="border rounded overflow-auto h-full" style={{ pointerEvents: isRunning ? 'auto' : 'none', opacity: isRunning ? 1 : 0.5 }}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <Viewer 
              fileUrl={`/${problem}.pdf`} 
              plugins={[defaultLayoutPluginInstance]}
            />
          </Worker>
        </div>

        <div className="flex flex-col gap-2">
          <div id="editor" className="border rounded overflow-auto" style={{ height: '43vh' }}>
          </div>

          <div 
            className="border rounded overflow-y-auto p-4" 
            style={{ height: '43vh', whiteSpace: 'pre-wrap', overflowX: 'hidden' }}
          >
            {isCodeRunning ? <Loading /> : output.split('\n').map((line, index) => (
              <div className='font-mono' key={index}>{line}</div>
            ))}
          </div>
        </div>
      </div>
      {downloadModal && <Download setClose={setDownloadModal} handleDownload={handleDownload}/>}
    </div>
  );
}

export default Single;
