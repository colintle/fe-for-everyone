import React, { useState } from 'react';
import { IoIosEye, IoIosEyeOff } from "react-icons/io";

function Login() {
  const [showPassword, setPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();

    const formErrors = {};
    const email = event.target.email.value.trim();
    const password = event.target.password.value.trim();

    // Example validation
    if (!email) {
      formErrors.email = "Email is required";
    }
    if (!password) {
      formErrors.password = "Password is required";
    }

    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      // Proceed with form submission or further validation
      console.log('Form submitted');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="flex justify-center mb-4">
        <img src="/logo.png" alt="Logo" className="h-24 w-auto" />
      </div>
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className={`block mb-2 ${errors.email ? 'text-red-500' : 'text-gray-700'}`}
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-600'
            }`}
            placeholder="example.email@gmail.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className={`block mb-2 ${errors.password ? 'text-red-500' : 'text-gray-700'}`}
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-600'
              }`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
            >
              {!showPassword ? <IoIosEye className="h-5 w-5"/> : <IoIosEyeOff className="h-5 w-5"/>}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
