import { useContext } from 'react';
import { MyContext } from '../../MyProvider';

export const useApi = () => {
  const { accessToken, setAccessToken, handleLogout } = useContext(MyContext);

  const callApi = async (endpoint, method = 'GET', payload = {}) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const url = `${process.env.REACT_APP_BACKEND_URL}${endpoint}`;

      const response = await fetch(url, {
        method,
        headers,
        body: method !== 'GET' ? JSON.stringify(payload) : null,
      });

      const data = await response.json();

      if (response.status === 401 && data.expired) {
        console.warn("Token expired, attempting to refresh...");

        const refreshResponse = await fetch(`${process.env.BACKEND_URL}/refresh`, {
          method: 'GET',
          credentials: 'include', // Cookies support
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setAccessToken(refreshData.token);

          headers['Authorization'] = `Bearer ${refreshData.token}`;
          const retryResponse = await fetch(url, { method, headers, body: method !== 'GET' ? JSON.stringify(payload) : null });
          return await retryResponse.json();

        } 
        else {
          handleLogout();
          return { error: 'Session expired. Please log in again.' };

        }
      }

      return response.ok ? { data } : { error: data.error || 'Request failed, please try again.' };

    } catch (error) {
      return { error: 'An error occurred. Please try again.' };
      
    }
  };

  return { callApi };
};
