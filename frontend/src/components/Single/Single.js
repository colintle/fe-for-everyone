import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ControlPanel from '../editor/ControlPanel';
import PdfViewer from "../editor/PdfViewer"
import CodeEditor from "../editor/CodeEditor"
import CodeOutput from '../editor/CodeOutput';
import Loading from '../Loading'; 
import Download from '../Download';

import { MyContext } from '../../MyProvider';
import { useCodeHandlers } from '../../utils/useCodeHandlers';

function Single({ problem, completed }) {
  const [isCompleted, setIsCompleted] = useState(completed);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(7200);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("Run code to see output!"); 
  const [editorContent, setEditorContent] = useState("");
  const [downloadModal, setDownloadModal] = useState(false);

  const {
    handleToggleCompletion,
    handleStartStopTimer,
    handleRunCode,
    handleExit,
    handleDownload,
    handleOpenModal,
  } = useCodeHandlers();

  const { completedProblems, setCompletedProblems } = useContext(MyContext);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsRunning(false); 
    }
  }, [isRunning, timeLeft]);

  const onToggleCompletion = async () => {
    return await handleToggleCompletion({
      isCompleted,
      setIsCompleted,
      setLoading,
      completedProblems,
      setCompletedProblems,
      problem,
    });
  };

  const onStartStopTimer = () => {
    handleStartStopTimer({
      isRunning,
      setIsRunning,
      timeLeft,
      setTimeLeft,
      setLoading,
    });
  };

  const onRunCode = () => {
    handleRunCode({
      setLoading,
      editorContent,
      setOutput,
    });
  };

  const onExit = () => {
    handleExit({
      setLoading,
      navigate,
    });
  };

  const onDownload = (filename) => {
    handleDownload({
      filename,
      editorContent,
      setLoading,
      setDownloadModal,
    });
  };

  return (
    <div className="p-8 h-screen flex flex-col relative">
      {loading && <Loading />} 
      <ControlPanel
        isRunning={isRunning}
        isCompleted={isCompleted}
        onRunCode={onRunCode}
        onToggleCompletion={onToggleCompletion}
        onStartStopTimer={onStartStopTimer}
        onDownload={() => handleOpenModal(setDownloadModal)}
        onMembers={null}
        onInvite={null}
        onExit={onExit}
        timeLeft={timeLeft}
        isMulti={false}
      />
      <div className="grid grid-cols-2 gap-2 flex-grow h-5/6">
        <PdfViewer problem={problem} isRunning={isRunning} />
        <div className="flex flex-col gap-2">
          <CodeEditor isRunning={isRunning} setEditorContent={setEditorContent} />
          <CodeOutput output={output} />
        </div>
      </div>
      {downloadModal && <Download setClose={setDownloadModal} handleDownload={onDownload} />}
    </div>
  );
}

export default Single;
