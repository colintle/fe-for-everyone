import React, { useState } from 'react';
import Popup from '../Popup';
import SignUp from './SignUp';
import Login from './Login';

function Form() {
  const [signUp, setSignUp] = useState(true);

  return (
    <Popup>
      {signUp ? <SignUp /> : <Login />}
      <div className="text-center mt-4">
        {signUp ? (
          <p>
            Already have an account?{' '}
            <button
              className="text-blue-500 hover:underline"
              onClick={() => setSignUp(false)}
            >
              Log in
            </button>
          </p>
        ) : (
          <p>
            Don't have an account?{' '}
            <button
              className="text-blue-500 hover:underline"
              onClick={() => setSignUp(true)}
            >
              Sign up
            </button>
          </p>
        )}
      </div>
    </Popup>
  );
}

export default Form;
