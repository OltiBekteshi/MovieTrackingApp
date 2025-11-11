import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4 text-black">
        <Link
          to="/"
          className="text-xl font-bold hover:opacity-80 flex items-center"
        >
          <img src="/movie.png" alt="Movie Logo" className="h-7 w-7 mr-1" />
          MovieTracker
        </Link>

        <div className="hidden md:flex items-center gap-5">
          <Link to="/" className="px-3 py-2 rounded-2xl hover:bg-gray-200">
            Home
          </Link>
          <Link
            to="/movies"
            className="px-3 py-2 rounded-2xl hover:bg-gray-200"
          >
            Movies
          </Link>
          <Link
            to="/watchlist"
            className="px-3 py-2 rounded-2xl hover:bg-gray-200"
          >
            Watchlist
          </Link>
          <Link
            to="/watch-later"
            className="px-3 py-2 rounded-2xl hover:bg-gray-200"
          >
            Watch later
          </Link>
          <Link
            to="/log-in"
            className="bg-black text-white px-4 py-2 rounded-2xl hover:bg-gray-800"
          >
            Log in
          </Link>
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-2xl focus:outline-none"
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white shadow-md">
          <Link
            to="/"
            className="block px-4 py-3 hover:bg-gray-200"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/movies"
            className="block px-4 py-3 hover:bg-gray-200"
            onClick={() => setIsOpen(false)}
          >
            Movies
          </Link>
          <Link
            to="/watchlist"
            className="block px-4 py-3 hover:bg-gray-200"
            onClick={() => setIsOpen(false)}
          >
            Watchlist
          </Link>
          <Link
            to="/watch-later"
            className="block px-4 py-3 hover:bg-gray-200"
            onClick={() => setIsOpen(false)}
          >
            Watch later
          </Link>
          <Link
            to="/log-in"
            className="block px-4 py-3 bg-black text-white rounded-lg m-2 text-center hover:bg-gray-800"
            onClick={() => setIsOpen(false)}
          >
            Log in
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
