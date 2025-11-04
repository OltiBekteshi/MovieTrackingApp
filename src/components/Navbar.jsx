import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className="flex flex-col md:flex-row items-center md:justify-between p-5 text-white font-bold gap-3 md:gap-0 bg-black">
      <Link
        to="/log-in"
        className="bg-white text-black px-4 py-2 rounded-2xl hover:bg-green-400"
      >
        Log in
      </Link>

      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 mt-2 md:mt-0">
        <Link
          to="/"
          className="bg-white text-black px-3 py-2 rounded-2xl hover:bg-gray-700"
        >
          Home
        </Link>
        <Link
          to="/about"
          className="bg-white text-black px-3 py-2 rounded-2xl hover:bg-gray-700"
        >
          About
        </Link>
        <Link
          to="/movies"
          className="bg-white text-black px-3 py-2 rounded-2xl hover:bg-gray-700"
        >
          Movies
        </Link>
        <Link
          to="/watchlist"
          className="bg-white text-black px-3 py-2 rounded-2xl hover:bg-gray-700"
        >
          Watchlist
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
