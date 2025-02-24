import { useApi } from "../api/useApi"

export const useCodeApiCalls = () => {
    const { callApi } = useApi()

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
        completeProblem,
        uncompleteProblem
    }
}
