import React from 'react';
import { useState } from 'react';

import { IoIosEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";


function Login() {
  const [showPassword, setPassword] = useState(false)

  return (
    <div className="max-w-md mx-auto bg-white">
      <div className="flex justify-center mb-4">
        <img src="/logo.png" alt="Logo" className="h-24 w-auto" />
      </div>
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      <form>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="example.email@gmail.com"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
            >
              {!showPassword ? <IoIosEye/> : <IoIosEyeOff/>}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Log in
        </button>
      </form>
    </div>
  );
}

export default Login;
