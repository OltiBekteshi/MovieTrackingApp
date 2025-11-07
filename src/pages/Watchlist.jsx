import React from "react";
import { useNavigate } from "react-router-dom";

const Watchlist = ({ watchlist, setWatchlist }) => {
  const navigate = useNavigate();

  
  const handleRemove = (movieId) => {
    const filtered = watchlist.filter((m) => m.id !== movieId);
    alert("Are you sure you want to remove this movie?")
    setWatchlist(filtered);
  };

  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Your Watchlist is empty </h1>
        <button
          className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer"
          onClick={() => navigate("/movies")}
        >
          Browse Movies
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 text-white text-center">Your Watchlist</h1>

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {watchlist.map((movie) => (
          <div
            key={movie.title}
            className="bg-red-900 text-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300"
          >
            <img
              src={movie.image || `https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-72 object-cover"
            />
            <div className="p-4 flex flex-col gap-2">
              <h3 className="font-semibold text-lg truncate">{movie.title}</h3>
              <p className="truncate">{movie.description || movie.overview}</p>
              <button
                className="bg-gray-700 p-2 text-white rounded-lg hover:bg-gray-800 mt-2"
                onClick={() => handleRemove(movie.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watchlist;
