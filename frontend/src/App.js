import React from 'react'
import { useEffect, useState, useContext } from 'react';
import {
  Outlet,
  useLocation
} from "react-router-dom";

import Navbar from './components/Navbar';
import Popup from './components/Popup';
import Loading from "./components/Loading"
import Form from './components/form/Form';
import Join from "./components/multi/Join"
import { MyContext } from './MyProvider';

function App() {
  const isMobile = window.matchMedia("only screen and (max-width: 1024px), (max-height: 768px)").matches;
  const [form, setForm] = useState(false)
  const [join, setJoin] = useState(false)
  const {setSingle, setMulti, logout, handleLogout, loading, accessToken} = useContext(MyContext)
  const location = useLocation()

  useEffect(() => {
    const renderForm = () => {
      if (logout){
        setForm(true)
      }
      else{
        setForm(false)
      }
    }
    renderForm()
  }, [logout, handleLogout])

  useEffect(() => {
    if (accessToken){
      setForm(false)
    }
  }, [accessToken])

  useEffect(() => {
    const handlePopState = () => {
        if (window.location.pathname === '/code') {
            window.location.reload();
        }
        else if (window.location.pathname === '/') {
          setSingle(false)
          setMulti(false)
        }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
        window.removeEventListener('popstate', handlePopState);
    };
}, [setSingle, setMulti]);

  if(isMobile){
    return(
      <Popup onClose={null}>
        <div className='h-full flex justify-center items-center'>
          <p>
            Sorry, this website is only available on desktop devices.
          </p>
        </div>
      </Popup>
    )
  }
  return (
    <div>    
      <div className="flex flex-col h-screen">
        {location.pathname !== "/code" && <Navbar setJoin={setJoin}/>}
        <div className="flex-grow">
          {form && <Form/>}
          {join && <Join setJoin={setJoin}/>}
          {!form && !join && <Outlet/>}
        </div>
      </div>
      {loading && <Loading/>}
    </div>
  )
}

export default App
