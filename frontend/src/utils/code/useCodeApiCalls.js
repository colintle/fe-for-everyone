import { useApi } from "../api/useApi";
import { GET, POST } from "../api/methods";

export const useCodeApiCalls = () => {
    const { callApi } = useApi();

    const completeProblem = async (problemStatementPath) => {
        const response = await callApi(`/problem/complete`, POST, { problemStatementPath });
        if (response?.error) {
          return false;
        }
        return true;
    } 
    
    const uncompleteProblem = async (problemStatementPath) => {
        const response = await callApi(`/problem/remove`, POST, { problemStatementPath }); 
        if (response?.error) {
          return false;
        }
        return true;
    } 

    const getCompletedProblems = async () => {
        const response = await callApi(`/problem/`, GET);
        if (response?.error) {
          return null;
        }
        return response;
    }

    const runCode = async (code) => {
        const response = await callApi(`/code/execute`, POST, { code });
        if (response?.error) {
          return null;
        }
        return response?.output;
    }

    return {
        completeProblem,
        uncompleteProblem,
        getCompletedProblems,
        runCode
    };
};
