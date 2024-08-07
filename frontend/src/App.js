import React from 'react'
import {
  Outlet,
} from "react-router-dom";

import Navbar from './components/Navbar';
import Loading from './components/Loading';

function App() {
  const isMobile = window.matchMedia("only screen and (max-width: 1024px)").matches;

  if(isMobile){
    return <div>Sorry, this website is only available on desktop devices.</div>
  }

  return (
    // Parent Container
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-grow">
        <Outlet/>
      </div>
    </div>
  )
}

export default App
