import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.js';
import "./index.css";

import Home from "./components/menu/Home";
import History from "./components/history/History";
import MultiLanding from "./components/multi/MultiLanding";
import Problems from "./components/problems/Problems";

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

const router = createBrowserRouter([
    {
      path: "/",
      element: <App/>,
      children: [
        {
          path: "/",
          element: <Home/>
        },
        {
          path: "/history",
          element: <History/>
        },
        {
          path: "/problems",
          element: <Problems/>
        },
        {
          path: "/collab",
          element: <MultiLanding/>
        },
        {
          path: "*",
          element: <EmptyPage/>
        }
      ]
    }
  ]);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <RouterProvider router={router}/>
);
