import React from 'react'
import Navbar from './components/Navbar';

function App() {
  const isMobile = window.matchMedia("only screen and (max-width: 1024px)").matches;

  if(isMobile){
    return <div>Sorry, this website is only available on desktop devices.</div>
  }
  return (
    <div>
      <Navbar/>
    </div>
  )
}

export default App