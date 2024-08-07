import React from 'react'
import Navbar from './components/Navbar';
import Popup from './components/Popup';

function App() {
  const isMobile = window.matchMedia("only screen and (max-width: 1024px)").matches;

  if(isMobile){
    return <div>Sorry, this website is only available on desktop devices.</div>
  }
  return (
    // Parent Container
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
      </div>
    </div>
  )
}

export default App
