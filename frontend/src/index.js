import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.js';
import "./index.css";

import Home from "./components/menu/Home";
import History from "./components/history/History";
import Code from './components/Code.js';
import EmptyPage from './components/EmptyPage.js';
import { MyProvider } from './MyProvider.js';

const router = createBrowserRouter([
    {
      path: "/",
      element:
      <MyProvider>
        <App/>
      </MyProvider>,
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
          path: "/code",
          element: 
            <Code/>
        },
      ]
    },
    {
      path: "*",
      element: <EmptyPage/>
    }
  ]);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <RouterProvider router={router}/>
);
