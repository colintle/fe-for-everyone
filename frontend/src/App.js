import React from 'react'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Navbar from './components/Navbar';
import Home from "./components/menu/Home";
import History from "./components/history/History";
import MultiLanding from "./components/multi/MultiLanding";

function App() {
  const isMobile = window.matchMedia("only screen and (max-width: 1024px)").matches;

  if(isMobile){
    return <div>Sorry, this website is only available on desktop devices.</div>
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home/>
    },
    {
      path: "/history",
      element: <History/>
    },
    {
      path: "/collab",
      element: <MultiLanding/>
    },
    {
      path: "*",
      element: <EmptyPage/>
    }
  ]);


  return (
    // Parent Container
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-grow">
        <RouterProvider router={router}/>
      </div>
    </div>
  )
}

const EmptyPage = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="p-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">Oops!</h1>
          <p className="text-lg mb-2">Sorry, an unexpected error has occurred.</p>
          <p className="text-gray-500 italic">Not Found</p>
        </div>
      </div>
    </div>
  );
};

export default App
