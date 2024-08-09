import React, { useState, createContext } from 'react';

const MyContext = createContext()

function MyProvider({children}) {
    const [single, setSingle] = useState(false)
    const [multi, setMulti] = useState(false)
    const [accessToken, setAccessToken] = useState("")

    return (
        <MyContext.Provider value={{single, setSingle, multi, setMulti, accessToken, setAccessToken}}>
            {children}
        </MyContext.Provider>
    )
}

export { MyContext, MyProvider };