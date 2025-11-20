import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  removeFromWatchlist,
  saveComment,
  getComments,
  deleteComment,
} from "../utils/movieService";

const Watchlist = ({ watchlist, setWatchlist, userId }) => {
  const navigate = useNavigate();

  const [comments, setComments] = useState({});
  const [showInput, setShowInput] = useState({});
  const [newComment, setNewComment] = useState({});

  const totalMinutes = watchlist.reduce(
    (sum, movie) => sum + (movie.runtime || 0),
    0
  );
  const totalHours = Math.floor(totalMinutes / 60);
  const totalRemainingMinutes = totalMinutes % 60;

  useEffect(() => {
    if (!userId || !watchlist) return;

    const loadComments = async () => {
      const allComments = {};

      for (const movie of watchlist) {
        const result = await getComments(userId, movie.movie_id);

        allComments[movie.movie_id] = result;
      }

      setComments(allComments);
    };

    loadComments();
  }, [userId, watchlist]);

  const handleRemove = async (movieId) => {
    if (!userId) {
      toast.error("Duhet të jeni të kycur për të fshirë filmin");
      return;
    }

    try {
      await removeFromWatchlist(userId, movieId);

      const updated = watchlist.filter((m) => m.movie_id !== movieId);
      setWatchlist(updated);

      const updatedComments = { ...comments };
      delete updatedComments[movieId];
      setComments(updatedComments);

      toast.success("Filmi u fshi me sukses");
    } catch (err) {
      console.error(err);
      toast.error("Fshirja e filmit dështoi");
    }
  };

  const handleAddComment = (movieId) => {
    setShowInput((prev) => ({ ...prev, [movieId]: !prev[movieId] }));
  };

  const handleSaveComment = async (movieId) => {
    if (!newComment[movieId] || newComment[movieId].trim() === "") {
      toast.error("Komenti nuk mund të jetë bosh");
      return;
    }

    try {
      const saved = await saveComment(userId, movieId, newComment[movieId]);

      const savedComment = saved[0];

      setComments((prev) => ({
        ...prev,
        [movieId]: [...(prev[movieId] || []), savedComment],
      }));

      setNewComment((prev) => ({ ...prev, [movieId]: "" }));
      setShowInput((prev) => ({ ...prev, [movieId]: false }));

      toast.success("Komenti u ruajt me sukses!");
    } catch (err) {
      console.error(err);
      toast.error("Ruajtja e komentit dështoi");
    }
  };

  const handleDeleteComment = async (movieId, commentId) => {
    try {
      await deleteComment(userId, commentId);

      setComments((prev) => ({
        ...prev,
        [movieId]: (prev[movieId] || []).filter((c) => c.id !== commentId),
      }));

      toast.success("Komenti u fshi me sukses!");
    } catch (err) {
      console.error(err);
      toast.error("Fshirja e komentit dështoi");
    }
  };

  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">
          Lista e filmave të shikuar është bosh
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
    <div className="bg-linear-to-r from-blue-500 to-green-900 shadow-md min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 text-white text-center mt-20">
        Lista e filmave të shikuara
      </h1>

      <div className="text-white text-xl font-bold text-center mb-6">
        Totali i orëve të shikuara: {totalHours}h {totalRemainingMinutes}m
      </div>

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

              <p className="text-sm text-gray-300 mb-2">
                ⏱ Kohezgjatja:{" "}
                {movie.runtime
                  ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
                  : "N/A"}
              </p>

              <p className="grow text-sm text-white line-clamp-3 sm:line-clamp-none">
                {movie.description || movie.overview}
              </p>

              {comments[movie.movie_id] &&
                comments[movie.movie_id].length > 0 && (
                  <div className="mt-3 space-y-2">
                    {comments[movie.movie_id].map((c) => (
                      <div
                        key={c.id}
                        className="bg-gray-800 p-2 rounded text-sm text-gray-200 flex justify-between items-center gap-2"
                      >
                        <span>{c.comment}</span>
                        <button
                          className="text-xs bg-red-600 px-2 py-1 rounded hover:bg-red-700 hover:cursor-pointer"
                          onClick={() =>
                            handleDeleteComment(movie.movie_id, c.id)
                          }
                        >
                          Fshij
                        </button>
                      </div>
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
                    placeholder="Shkruaj një koment..."
                    className="w-full p-2 rounded bg-gray-800 text-white text-sm"
                  />
                  <button
                    className="bg-green-700 p-2 rounded-lg mt-2 hover:bg-green-800 text-sm hover:cursor-pointer"
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
                {showInput[movie.movie_id] ? "Anulo" : "Shto koment"}
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
