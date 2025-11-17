import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { removeFromWatchlist } from "../utils/movieService";

const Watchlist = ({ watchlist, setWatchlist, userId }) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState({});
  const [showInput, setShowInput] = useState({});
  const [newComment, setNewComment] = useState({});

  const handleRemove = async (movieId) => {
    if (!userId) {
      toast.error("Kyqu per te fshire filmin");
      return;
    }

    try {
      await removeFromWatchlist(userId, movieId);
      const updated = watchlist.filter((m) => m.movie_id !== movieId);
      setWatchlist(updated);
      toast.success("Filmi u fshi me sukses");

      setComments((prev) => {
        const updatedComments = { ...prev };
        delete updatedComments[movieId];
        return updatedComments;
      });
    } catch (err) {
      console.error(err);
      toast.error("Fshirja e filmit deshtoi");
    }
  };

  const handleAddComment = (movieId) => {
    setShowInput((prev) => ({ ...prev, [movieId]: !prev[movieId] }));
  };

  const handleSaveComment = (movieId) => {
    if (!newComment[movieId] || newComment[movieId].trim() === "") {
      toast.error("Hapesira per koment nuk duhet te jete boshe");
      return;
    }

    setComments((prev) => ({
      ...prev,
      [movieId]: [...(prev[movieId] || []), newComment[movieId]],
    }));

    setNewComment((prev) => ({ ...prev, [movieId]: "" }));
    setShowInput((prev) => ({ ...prev, [movieId]: false }));
    toast.success("Komenti i shtua");
  };

  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">
          Lista e filmave te shikuar eshte e thate
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
        Lista e filmave te shikuara
      </h1>

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {watchlist.map((movie) => (
          <div
            key={movie.movie_id}
            className="bg-black text-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 flex flex-col"
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
              <h3 className="font-semibold text-lg mb-2">{movie.title}</h3>

              <p className="grow text-sm text-white line-clamp-3 sm:line-clamp-none">
                {movie.description || movie.overview}
              </p>

              {comments[movie.movie_id] &&
                comments[movie.movie_id].length > 0 && (
                  <div className="mt-3 space-y-2">
                    {comments[movie.movie_id].map((c, idx) => (
                      <p
                        key={idx}
                        className="bg-gray-800 p-2 rounded text-sm text-gray-200"
                      >
                        {c}
                      </p>
                    ))}
                  </div>
                )}

              {showInput[movie.movie_id] && (
                <div className="mt-3">
                  <textarea
                    value={newComment[movie.movie_id] || ""}
                    onChange={(e) =>
                      setNewComment((prev) => ({
                        ...prev,
                        [movie.movie_id]: e.target.value,
                      }))
                    }
                    placeholder="Write a comment..."
                    className="w-full p-2 rounded bg-gray-800 text-white text-sm"
                  />
                  <button
                    className="bg-green-700 p-2 rounded-lg mt-2 hover:bg-green-800 text-sm"
                    onClick={() => handleSaveComment(movie.movie_id)}
                  >
                    Ruaj komentin
                  </button>
                </div>
              )}

              <button
                className="bg-blue-700 p-2 text-white rounded-lg hover:bg-blue-800 mt-4 hover:cursor-pointer"
                onClick={() => handleAddComment(movie.movie_id)}
              >
                {showInput[movie.movie_id] ? "Anulo" : "Shto komentin"}
              </button>

              <button
                className="bg-gray-700 p-2 text-white rounded-lg hover:bg-gray-800 mt-2 hover:cursor-pointer"
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

export default Watchlist;
