import React from 'react'
import { Link } from 'react-router-dom'

const Signup = () => {
return(
  <div className="flex justify-center items-center h-screen bg-white">
      <form className="bg-indigo-100 p-10 rounded-2xl shadow-md flex flex-col gb-6 w-80 ">
         <p>Email:</p>
        <input
          type="email"
          placeholder="Name"
          className="border border-b-black p-2 rounded mb-5"
        />
        <p>Username:</p>
        <input
          type="text"
          placeholder="Name"
          className="border border-b-black p-2 rounded mb-5"
        />
        <p>Set a Password:</p>
        <input
          type="password"
          placeholder="Password"
          className="border border-b-black p-2 rounded mb-13"
        />
        <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Sign up
        </button>
        <p className='text-center underline text-blue-500 pt-5'><Link to="/log-in">You have an account? Log in here</Link></p>
      </form>
    </div>
)
}

export default Signup