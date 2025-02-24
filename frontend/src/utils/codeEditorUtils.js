import { useApi } from "./api/useApi";

const {callApi} = useApi();

export function handleToggleCompletion({
    isCompleted,
    setIsCompleted,
    setLoading,
    completedProblems,
    setCompletedProblems,
    problem,
}) {
    setLoading(true);
  
    setTimeout(() => {
      if (!isCompleted) {
        setCompletedProblems([
          ...completedProblems,
          {
            problemStatementPath: problem,
            date: new Date().toISOString().split('T')[0],
          },
        ]);
      } else {
        setCompletedProblems(
          completedProblems.filter(
            (problemItem) => problemItem.problemStatementPath !== problem
          )
        );
      }
  
      setIsCompleted(!isCompleted);
      setLoading(false);
    }, 1000);
  }
  
export function handleStartStopTimer({
    isRunning,
    setIsRunning,
    timeLeft,
    setTimeLeft,
    setLoading,
}) {
setLoading(true);

setTimeout(() => {
    if (!isRunning && timeLeft === 0) {
    setTimeLeft(7200);
    }
    setIsRunning(!isRunning);
    setLoading(false);
}, 1000);
}

export function handleRunCode({
    setLoading,
    editorContent,
    setOutput,
}) {
    setLoading(true);

    setTimeout(() => {
        setOutput(`Code executed successfully! Here is the output:\n${editorContent}`);
        setLoading(false);
    }, 2000);
}
  
export function handleExit({
setLoading,
navigate,
}) {
    setLoading(true);

    setTimeout(() => {
        navigate('/');
    }, 1000);
}
  
export function handleDownload({
    filename,
    editorContent,
    setLoading,
    setDownloadModal,
}) {
    setLoading(true);
    setDownloadModal(false);

    setTimeout(() => {
        const element = document.createElement('a');
        const file = new Blob([editorContent], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${filename || 'code'}.c`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        setLoading(false);
    }, 2000);
}

export function handleOpenModal(setModalFn) {
    setModalFn(true);
}

async function completeProblem(problemStatementPath){
  const response = await callApi(`/complete`, 'POST', { problemStatementPath });

  if (response.ok){
    return true;
  }
  else {
    return false;
  }
}
  