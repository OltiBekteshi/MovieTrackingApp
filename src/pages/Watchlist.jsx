import React, { useState } from "react";
import { FaYelp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Watchlist = ({ watchlist, setWatchlist }) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState({});
  const [showInput, setShowInput] = useState({});
  const [newComment, setNewComment] = useState({});

  const handleRemove = (movieId) => {
    const filtered = watchlist.filter((m) => m.id !== movieId);
    setWatchlist(filtered);
    toast.message("Movie successfully removed");

    setComments((prev) => {
      const updated = { ...prev };
      delete updated[movieId];
      return updated;
    });
  };

  const handleAddComment = (movieId) => {
    setShowInput((prev) => ({ ...prev, [movieId]: !prev[movieId] }));
  };

  const handleSaveComment = (movieId) => {
    if (!newComment[movieId] || newComment[movieId].trim() === "") {
      toast.error("Comment cannot be empty");
      return;
    }

    setComments((prev) => ({
      ...prev,
      [movieId]: [...(prev[movieId] || []), newComment[movieId]],
    }));

    setNewComment((prev) => ({ ...prev, [movieId]: "" }));
    setShowInput((prev) => ({ ...prev, [movieId]: false }));
    toast.success("Comment added!");
  };

  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Your Watchlist is empty</h1>
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
      <h1 className="text-3xl font-bold mb-6 text-white text-center">
        Your Watchlist
      </h1>

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {watchlist.map((movie) => (
          <div
            key={movie.id}
            className="bg-red-900 text-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 flex flex-col"
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

              {comments[movie.id] && comments[movie.id].length > 0 && (
                <div className="mt-3 space-y-2">
                  {comments[movie.id].map((c, idx) => (
                    <p
                      key={idx}
                      className="bg-gray-800 p-2 rounded text-sm text-gray-200"
                    >
                      {c}
                    </p>
                  ))}
                </div>
              )}

              {showInput[movie.id] && (
                <div className="mt-3">
                  <textarea
                    value={newComment[movie.id] || ""}
                    onChange={(e) =>
                      setNewComment((prev) => ({
                        ...prev,
                        [movie.id]: e.target.value,
                      }))
                    }
                    placeholder="Write a comment..."
                    className="w-full p-2 rounded bg-gray-800 text-white text-sm"
                  />
                  <button
                    className="bg-green-700 p-2 rounded-lg mt-2 hover:bg-green-800 text-sm"
                    onClick={() => handleSaveComment(movie.id)}
                  >
                    Save Comment
                  </button>
                </div>
              )}

              <button
                className="bg-blue-700 p-2 text-white rounded-lg hover:bg-blue-800 mt-4 hover:cursor-pointer"
                onClick={() => handleAddComment(movie.id)}
              >
                {showInput[movie.id] ? "Cancel" : "Add Comment"}
              </button>

              <button
                className="bg-gray-700 p-2 text-white rounded-lg hover:bg-gray-800 mt-2 hover:cursor-pointer"
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
