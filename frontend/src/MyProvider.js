import React, { useState, createContext, useEffect } from 'react';

import { refreshToken, getUsernameFromToken, clearToken } from './utils/token';

const MyContext = createContext()

function MyProvider({children}) {
    const [loading, setLoading] = useState(true)
    const [single, setSingle] = useState(false)
    const [multi, setMulti] = useState(false)
    const [username, setUsername] = useState("")
    const [completedProblems, setCompletedProblems] = useState([])
    const [accessToken, setAccessToken] = useState("")
    const [logout, setLogout] = useState(false)
      
    const handleLogout = async () => {
      try {
        const cleared = await clearToken();
        if (!cleared) {
          throw new Error("Failed to clear token");
        }
        
        setLogout(true);
        setAccessToken("");
        setUsername("");
    
        return true;
      } catch (error) {
        throw error;
      }
    };
    
    
    useEffect(() => {
      const grabToken = async () => {
        setLoading(true);
        const token = await refreshToken();
        if (token) {
          setAccessToken(token);
          setUsername(getUsernameFromToken(token));
          setLoading(false);
        } else {
          await handleLogout();
          setLoading(false);
        }
      };
    
      grabToken();
      // eslint-disable-next-line
    }, []);
      

    return (
        <MyContext.Provider 
            value={{single, setSingle, multi, setMulti, accessToken, setAccessToken, completedProblems, setCompletedProblems, logout, loading, setLoading, handleLogout, username, setUsername}}>
            {children}
        </MyContext.Provider>
    )
}

export { MyContext, MyProvider };
