import React, { useState, createContext } from 'react';

const MyContext = createContext()

function MyProvider({children}) {
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

    return (
        <MyContext.Provider value={{single, setSingle, multi, setMulti, accessToken, setAccessToken, completedProblems, setCompletedProblems}}>
            {children}
        </MyContext.Provider>
    )
}

export { MyContext, MyProvider };