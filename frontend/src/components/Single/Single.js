import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ControlPanel from '../editor/ControlPanel';
import PdfViewer from "../editor/PdfViewer"
import CodeEditor from "../editor/CodeEditor"
import CodeOutput from '../editor/CodeOutput';
import Loading from '../Loading'; 
import Download from '../Download'; 
import { MyContext } from '../../MyProvider';

function Single({ problem, completed }) {
  const [isCompleted, setIsCompleted] = useState(completed);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("Run code to see output!"); 
  const [editorContent, setEditorContent] = useState("");
  const [downloadModal, setDownloadModal] = useState(false);

  const [inviteModal, setInviteModal] = useState(false);
  const [membersModal, setMembersModal] = useState(false);

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

  const handleToggleCompletion = () => {
    setLoading(true);
    setTimeout(() => {
      if (!isCompleted) {
        setCompletedProblems([
          ...completedProblems,
          { problemStatementPath: problem, date: new Date().toISOString().split('T')[0] },
        ]);
      } else {
        setCompletedProblems(
          completedProblems.filter((problemItem) => problemItem.problemStatementPath !== problem)
        );
      }
  
      setIsCompleted(!isCompleted);
      setLoading(false);
    }, 1000);
  };

  const handleStartStopTimer = () => {
    setLoading(true);
    setTimeout(() => {
      if (!isRunning && timeLeft === 0) {
        setTimeLeft(7200); 
      }
      setIsRunning(!isRunning);
      setLoading(false);
    }, 1000);
  };

  const handleRunCode = () => {
    setLoading(true);
    setTimeout(() => {
      setOutput(`Code executed successfully! Here is the output:\n${editorContent}`);
      setLoading(false);
    }, 2000); 
  };

  const handleExit = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/"); 
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
      document.body.appendChild(element); 
      element.click();
      document.body.removeChild(element); 
      setLoading(false);
    }, 2000); 
  };

  return (
    <div className="p-8 h-screen flex flex-col relative">
      {loading && <Loading />} 
      <ControlPanel
        isRunning={isRunning}
        isCompleted={isCompleted}
        onRunCode={handleRunCode}
        onToggleCompletion={handleToggleCompletion}
        onStartStopTimer={handleStartStopTimer}
        onDownload={() => setDownloadModal(true)}
        onExit={handleExit}
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
      {downloadModal && <Download setClose={setDownloadModal} handleDownload={handleDownload} />}
    </div>
  );
}

export default Single;
