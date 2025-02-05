import React, { useState, createContext } from 'react';

const MyContext = createContext()

function MyProvider({children}) {
    const [loading, setLoading] = useState(true)
    const [single, setSingle] = useState(false)
    const [multi, setMulti] = useState(false)
    const [completedProblems, setCompletedProblems] = useState([
        {
            "problemStatementPath": "Fall 2022",
            "date": "2023-08-12"
        },
        {
            "problemStatementPath": "Spring 2022",
            "date": "2023-08-13"
        }
    ])
    const [accessToken, setAccessToken] = useState("")
    const [logout, setLogout] = useState(false)

    const handleLogout = () => {
        setLoading(true);
        setTimeout(() => {
          setLogout(true);
          setLoading(false);
        }, 1000); // Simulate a short delay before logging out
      };
    return (
        <MyContext.Provider 
            value={{single, setSingle, multi, setMulti, accessToken, setAccessToken, completedProblems, setCompletedProblems, logout, loading, setLoading, handleLogout}}>
            {children}
        </MyContext.Provider>
    )
}

export { MyContext, MyProvider };