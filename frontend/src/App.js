import React from 'react'

function App() {
  const isMobile = window.matchMedia("only screen and (max-width: 1024px)").matches;

  if(isMobile){
    return <div>Sorry, this website is only available on desktop devices.</div>
  }
  return (
    <div className="text-3xl font-bold underline">
      Hello
    </div>
  )
}

export default App