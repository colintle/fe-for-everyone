import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CiLogout } from "react-icons/ci";
import { MyContext } from '../MyProvider';

const Navbar = ({ setJoin }) => {
  const {handleLogout, setLoading} = useContext(MyContext);
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  const switchPage = (page) => {
    setActiveLink(page);
  };
  
  return (
    <nav className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex justify-between h-12">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {/* Logo or Icon */}
              <img src="/logo.png" alt="Logo" className="h-24 w-auto" />
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* Navbar items */}
              <Link
                to="/"
                onClick={() => switchPage('/')}
                className={`${
                  activeLink === '/'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Home
              </Link>
              <Link
                to="/history"
                onClick={() => switchPage('/history')}
                className={`${
                  activeLink === '/history'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                History
              </Link>
              <a
                href="https://www.cs.ucf.edu/registration/exm/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${
                  activeLink === '/problems'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Problems
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
              <CiLogout
                onClick={async () => {
                  setLoading(true);
                  await handleLogout();
                  setLoading(false);
                }
              }
                className="text-blue-600 text-2xl cursor-pointer hover:text-blue-700 mr-2" title="Logout"
              />
            <button 
              onClick={() => setJoin(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Join/Leave a Room
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
