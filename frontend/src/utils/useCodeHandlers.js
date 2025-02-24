import { useCallback } from 'react';
import { useApi} from './api/useApi'

export const useCodeHandlers = () => {
  const { callApi } = useApi();

  const handleToggleCompletion = useCallback(
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
    },
    []
  );

  const handleStartStopTimer = useCallback(
    ({ isRunning, setIsRunning, timeLeft, setTimeLeft, setLoading }) => {
      setLoading(true);

      setTimeout(() => {
        if (!isRunning && timeLeft === 0) {
          setTimeLeft(7200);
        }
        setIsRunning(!isRunning);
        setLoading(false);
      }, 1000);
    },
    []
  );

  const handleRunCode = useCallback(
    ({ setLoading, editorContent, setOutput }) => {
      setLoading(true);

      setTimeout(() => {
        setOutput(
          `Code executed successfully! Here is the output:\n${editorContent}`
        );
        setLoading(false);
      }, 2000);
    },
    []
  );

  const handleExit = useCallback(
    ({ setLoading, navigate }) => {
      setLoading(true);

      setTimeout(() => {
        navigate('/');
      }, 1000);
    },
    []
  );

  const handleDownload = useCallback(
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
    },
    []
  );

  const handleOpenModal = useCallback((setModalFn) => {
    setModalFn(true);
  }, []);

  const completeProblem = async (problemStatementPath) => {
    const response = await callApi(`/problem/complete`, 'POST', { problemStatementPath });
    if (response?.error) {
      return false;
    }
    return true
  };

  const uncompleteProblem = async (problemStatementPath) => {
    const response = await callApi(`/problem/remove`, 'POST', { problemStatementPath });
    if (response?.error) {
      return false;
    }
    return true
  };

  return {
    handleToggleCompletion,
    handleStartStopTimer,
    handleRunCode,
    handleExit,
    handleDownload,
    handleOpenModal,
  }
};
