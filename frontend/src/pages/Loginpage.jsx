import React from 'react'
import LoginForm from '../components/LoginForm';
import { useContext } from 'react';
import userContext from '../contexts/UserContext/userContext';
import SignUp from '../components/SignUp';

const Login = () => {
  const { login } = useContext(userContext);

  return (
 <div className="min-h-screen flex flex-col justify-center items-center bg-[url('/darkbg.png')] bg-cover bg-center overflow-y-auto p-8">
  <div className="flex flex-col items-center w-full max-w-xl px-4">
    <img
      src="/Logo1.png"
      alt="Talkyy"
      className="rounded-full w-32 h-32 md:w-40 md:h-40 overflow-hidden z-5"
      style={{ marginBottom: -20 }}
    />
    {login ? <LoginForm /> : <SignUp />}
  </div>
</div>
  )
}

export default Login