import React from 'react'
import { Link } from 'react-router-dom'

const Login = () => {
  return (
    <>
    <div className="flex justify-center items-center h-screen ">
      <form className="bg-indigo-50 p-10 rounded-2xl shadow-md flex flex-col gb-6 w-80 ">
        <p>Username:</p>
        <input
          type="text"
          placeholder="Name"
          className="border border-b-black p-2 rounded mb-5"
        />
        <p>Password:</p>
        <input
          type="password"
          placeholder="Password"
          className="border border-b-black p-2 rounded mb-13"
        />
        <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Log in
        </button>
        <p className='text-[13px]'>Dont have an account? <span className='text-blue-500 underline'><Link to="/sign-up">Sign up here</Link></span></p>
      </form>
    </div>
</> 
  )
}

export default Login
