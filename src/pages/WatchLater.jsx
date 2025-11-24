import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { removeFromWatchLater } from "../utils/movieService";

const WatchLater = ({ watchlater, setWatchlater, userId }) => {
  const navigate = useNavigate();

  const handleRemove = async (movieId) => {
    if (!userId) {
      toast.error("Kyqu per te fshire filmin");
      return;
    }

    try {
      await removeFromWatchLater(userId, movieId);
      const updated = watchlater.filter((m) => m.movie_id !== movieId);
      setWatchlater(updated);
      toast.success("Filmi u fshi me sukses");
    } catch (err) {
      console.error(err);
      toast.error("Fshirja e filmit deshtoi");
    }
  };

  if (!watchlater || watchlater.length === 0) {
    return (
      <div className="bg-linear-to-r from-blue-500  to-green-900 shadow-md min-h-screen text-white flex flex-col items-center justify-center ">
        <h1 className="text-3xl font-bold mb-4 ">
          Lista e filmave per ti shikuar me vone eshte e thate
        </h1>
        <button
          className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer"
          onClick={() => navigate("/movies")}
        >
          Shfleto filma
        </button>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-r from-blue-500  to-green-900 shadow-md  min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 text-white text-center mt-20">
        Shiko me vone
      </h1>

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {watchlater.map((movie) => (
          <div
            key={movie.movie_id}
            className="bg-black text-white rounded-2xl shadow-md overflow-hidden flex flex-col "
          >
            <img
              src={
                movie.image ||
                `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              }
              alt={movie.title}
              className="w-full h-72 object-cover"
            />
            <div className="p-4 flex flex-col grow">
              <h3 className="font-semibold text-lg truncate">{movie.title}</h3>
              <p className="grow text-sm text-white line-clamp-3 sm:line-clamp-none">
                {movie.description || movie.overview}
              </p>

              <button
                className="bg-gray-700 p-2 text-white rounded-lg hover:bg-gray-800 mt-4 hover:cursor-pointer"
                onClick={() => handleRemove(movie.movie_id)}
              >
                Fshij
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchLater;
