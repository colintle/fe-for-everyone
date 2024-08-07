import React from 'react'
import { useEffect, useState, createContext } from 'react';
import {
  Outlet,
} from "react-router-dom";

import Navbar from './components/Navbar';
import Popup from './components/Popup';
import Loading from "./components/Loading"
import Form from './components/form/Form';

import refreshToken from './utils/refreshToken';

function App() {
  const isMobile = window.matchMedia("only screen and (max-width: 1024px)").matches;

  const [accessToken, setAccessToken] = useState("")
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(false)

  const accessTokenContext = createContext(accessToken)

  useEffect(() => {
    const token = refreshToken()
    if (token){
      setAccessToken(token)
    }
    else{
      setForm(true)
    }
    setLoading(false)
  }, [])

  if(isMobile){
    return(
      <Popup>
        <div className='h-full flex justify-center items-center'>
          <p>
            Sorry, this website is only available on desktop devices.
          </p>
        </div>
      </Popup>
    )
  }

  return (
    <accessTokenContext.Provider value={accessToken}>
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex-grow">
          {form ? <Form/> : <Outlet/>}
          {loading && <Loading/>}
        </div>
      </div>
    </accessTokenContext.Provider>
  )
}

export default App
