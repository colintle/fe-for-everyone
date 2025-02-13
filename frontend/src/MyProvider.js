import React, { useState, createContext, useEffect } from 'react';

import { refreshToken, getUsernameFromToken } from './utils/token';

const MyContext = createContext()

function MyProvider({children}) {
    const [loading, setLoading] = useState(true)
    const [single, setSingle] = useState(false)
    const [multi, setMulti] = useState(false)
    const [username, setUsername] = useState("")
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
        console.log("inside handleLogout")
        setTimeout(() => {
          setLogout(true);
          setAccessToken("");
          setUsername("");

          // call "signout" endpoint
        }, 1000);
    };

    useEffect(() => {
        const grabToken = async () => {
            setLoading(true)
            const token = await refreshToken()
            if (token){
                setAccessToken(token)
                setUsername(getUsernameFromToken(token))
                setLoading(false)
            }
            else {
                handleLogout()
            }
        };

        grabToken()
    }, [])

    return (
        <MyContext.Provider 
            value={{single, setSingle, multi, setMulti, accessToken, setAccessToken, completedProblems, setCompletedProblems, logout, loading, setLoading, handleLogout, username, setUsername}}>
            {children}
        </MyContext.Provider>
    )
}

export { MyContext, MyProvider };