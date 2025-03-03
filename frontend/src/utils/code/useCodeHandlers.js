import { useCodeApiCalls } from './useCodeApiCalls';

export const useCodeHandlers = () => {
  const { completeProblem, uncompleteProblem, runCode } = useCodeApiCalls();

  const handleToggleCompletion =
    async ({
      isCompleted,
      setIsCompleted,
      setLoading,
      completedProblems,
      setCompletedProblems,
      problem,
    }) => {
      setLoading(true);
      try {
        let success = false;
        if (!isCompleted) {
          success = await completeProblem(problem);
        } else {
          success = await uncompleteProblem(problem);
        }
  
        if (success) {
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
        }
      } catch (error) {
        console.error('Error toggling completion:', error);
      } finally {
        setLoading(false);
      }
  }

  const handleStartStopTimer =
    ({ isRunning, setIsRunning, timeLeft, setTimeLeft, setLoading }) => {
      setLoading(true);

      setTimeout(() => {
        if (!isRunning && timeLeft === 0) {
          setTimeLeft(7200);
        }
        setIsRunning(!isRunning);
        setLoading(false);
      }, 1000) 
  }

  const handleRunCode =
   async ({ setLoading, editorContent, setOutput }) => {
      setLoading(true);
      const output = await runCode(editorContent);
      if (output){
        setOutput(output);
      }
      else {
        setOutput('Error running code!');
      }
      setLoading(false);
  }

  const handleExit =
    ({ setLoading, navigate }) => {
      setLoading(true);

      setTimeout(() => {
        navigate('/');
      }, 1000);
    }

  const handleDownload =
    ({ filename, editorContent, setLoading, setDownloadModal }) => {
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

  const handleOpenModal = (setModalFn) => {
    setModalFn(true);
  }

  return {
    handleToggleCompletion,
    handleStartStopTimer,
    handleRunCode,
    handleExit,
    handleDownload,
    handleOpenModal,
  }
};
