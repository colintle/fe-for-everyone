import { useContext } from 'react';
import { MyContext } from '../../MyProvider';

import { refreshToken } from '../token';

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
        credentials: "include",
        body: method !== 'GET' ? JSON.stringify(payload) : null,
      });

      const data = await response.json();

      if (response.status === 401 && data.expired) {

        const accessToken = await refreshToken();

        if (accessToken) {
          setAccessToken(accessToken);

          headers['Authorization'] = `Bearer ${accessToken}`;
          const retryResponse = await fetch(url, { method, headers, body: method !== 'GET' ? JSON.stringify(payload) : null });
          return await retryResponse.json();

        } 
        else {
          handleLogout();
          return { error: 'Session expired. Please log in again.' };
        }
      }

      return response.ok ?  data : { error: data.message || 'Request failed, please try again.' };

    } catch (error) {
      return { error: 'An error occurred. Please try again.' };
    }
  };

  return { callApi };
};
