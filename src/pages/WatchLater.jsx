import React from "react";
import { useNavigate } from "react-router-dom";

const WatchLater = ({ watchlater, setWatchlater }) => {
  const navigate = useNavigate();

  const handleRemove = (id) => {
    setWatchlater(watchlater.filter((m) => m.id !== id));
  };

  if (!watchlater || watchlater.length === 0) {
    return (
      <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">
          Your Watch Later list is empty
        </h1>
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
    <>
      <div className="bg-black min-h-screen p-6">
        <h1 className="text-3xl font-bold mb-6 text-white text-center mt-20">
          Watch Later
        </h1>

        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {watchlater.map((movie) => (
            <div
              key={movie.id}
              className="bg-red-900 text-white rounded-2xl shadow-md overflow-hidden"
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-72 object-cover"
              />
              <div className="p-4 flex flex-col grow">
                <h3 className="font-semibold text-lg truncate">
                  {movie.title}
                </h3>
                <h3 className=" grow text-sm text-white line-clamp-3 sm:line-clamp-none">
                  {movie.overview}
                </h3>
                <button
                  className="bg-gray-700 p-2 text-white rounded-lg hover:bg-gray-800 mt-4 hover:cursor-pointer"
                  onClick={() => handleRemove(movie.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default WatchLater;
