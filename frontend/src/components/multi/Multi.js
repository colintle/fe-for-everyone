import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ControlPanel from '../editor/ControlPanel';
import PdfViewer from "../editor/PdfViewer";
import CodeEditor from "../editor/CodeEditor";
import CodeOutput from '../editor/CodeOutput';
import Loading from '../Loading'; 
import Download from '../Download';
import Invite from './Invite';
import Members from './Members';

import { MyContext } from '../../MyProvider';

import {
  handleToggleCompletion,
  handleStartStopTimer,
  handleRunCode,
  handleExit,
  handleDownload,
  handleOpenModal,
} from '../../utils/codeEditorUtils';

function Multi({ problem, completed, inviteLink }) {
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

  const onToggleCompletion = () => {
    handleToggleCompletion({
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

  const onOpenDownloadModal = () => handleOpenModal(setDownloadModal);
  const onOpenInviteModal = () => handleOpenModal(setInviteModal);
  const onOpenMembersModal = () => handleOpenModal(setMembersModal);


  // Will need to filter socket messages for intial metadata, user_joined, and user_left,
  const members = [
    {userID: 1, username: "Alice"}, {userID: 2, username: "Bob"}, {userID: 3, username: "Charlie"}, {userID: 4, username: "David"}, {userID: 5, username: "Eve"}, {userID: 6, username: "Frank"}
  ]

  return (
    <div className="p-8 h-screen flex flex-col relative">
      {loading && <Loading />}

      <ControlPanel
        isRunning={isRunning}
        isCompleted={isCompleted}
        onRunCode={onRunCode}
        onToggleCompletion={onToggleCompletion}
        onStartStopTimer={onStartStopTimer}
        onDownload={onOpenDownloadModal}
        onMembers={onOpenMembersModal}
        onInvite={onOpenInviteModal}
        onExit={onExit}
        timeLeft={timeLeft}
        isMulti={true}
      />

      <div className="grid grid-cols-2 gap-2 flex-grow h-5/6">
        <PdfViewer problem={problem} isRunning={isRunning} />
        <div className="flex flex-col gap-2">
          <CodeEditor isRunning={isRunning} setEditorContent={setEditorContent} />
          <CodeOutput output={output} />
        </div>
      </div>

      {downloadModal && (
        <Download
          setClose={setDownloadModal}
          handleDownload={onDownload}
        />
      )}

      {inviteModal && (
        <Invite
          setClose={setInviteModal}
          inviteLink={inviteLink}
        />
      )}

      {membersModal && (
        <Members
          setClose={setMembersModal}
          members={members}
          admin={{id: 0, username: "Admin"}}
        />
      )}
    </div>
  );
}

export default Multi;
