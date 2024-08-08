import React from 'react';

function SignUp() {
  return (
    <div className="max-w-md mx-auto bg-white">
      <div className="flex justify-center mb-4">
        <img src="/logo.png" alt="Logo" className="h-24 w-auto" />
      </div>
      <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
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
              type="password"
              id="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter at least 8+ characters"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12l4.94-4.94M15 12l4.94 4.94M15 12l-4.94-4.94M15 12l-4.94 4.94M4 4h16v16H4z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Sign up
        </button>
      </form>
    </div>
  );
}

export default SignUp;
