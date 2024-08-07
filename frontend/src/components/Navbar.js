import React, { useState } from 'react';

const Navbar = () => {
  const [activeLink, setActiveLink] = useState('Home');

  const switchPage = (page) => {
    setActiveLink(page)
  }

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
              <button
                onClick={() => switchPage('Home')}
                className={`${
                  activeLink === 'Home'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Home
              </button>
              <button
                onClick={() => switchPage('Problems')}
                className={`${
                  activeLink === 'Problems'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Problems
              </button>
              <button
                onClick={() => switchPage('History')}
                className={`${
                  activeLink === 'History'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                History
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:font-bold">
              Join a Break Room
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
