import React from 'react'

const Signup = () => {
return(
  <div className="flex justify-center items-center h-screen">
      <form className="bg-indigo-50 p-10 rounded-2xl shadow-md flex flex-col gb-6 w-80 ">
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
      </form>
    </div>
)
}

export default Signup