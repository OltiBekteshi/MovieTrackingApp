import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  getPublicComments,
  addPublicComment,
  deletePublicComment,
  subscribeToPublicComments
} from "../utils/movieService";
import { supabase } from "../utils/supabaseClient";

const genres = [
  { id: 28, name: "Aksion" },
  { id: 35, name: "Komedi" },
  { id: 53, name: "Thriller" },
  { id: 27, name: "Horror" },
  { id: 99, name: "Dokumentar" },
  { id: 9648, name: "Mister" },
];

const MovieModal = ({
  selectedMovie,
  setSelectedMovie,
  trailerKey,
  setTrailerKey,
  handleAddToWatchlist,
  handleAddToWatchLater,
  handleWatchTrailer,
  apiKey,
}) => {
  const [runtime, setRuntime] = useState(null);
  const { user } = useUser();
  const [publicComments, setPublicComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");

  const getGenresForMovie = () => {
    if (!selectedMovie || !selectedMovie.genre_ids) return [];
    return genres.filter((g) => selectedMovie.genre_ids.includes(g.id));
  };

  const handleBackgroundClick = (e) => {
    if (e.target.id === "modal-background") {
      setSelectedMovie(null);
      setTrailerKey(null);
    }
  };

  useEffect(() => {
    if (!selectedMovie) return;

    const fetchRuntime = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${selectedMovie.id}?api_key=${apiKey}&language=en-US`
        );
        const data = await res.json();
        setRuntime(data.runtime);
      } catch {
        setRuntime(null);
      }
    };

    fetchRuntime();
  }, [selectedMovie, apiKey]);

  useEffect(() => {
    if (!selectedMovie) return;

    const loadComments = async () => {
      const data = await getPublicComments(selectedMovie.id);
      setPublicComments(data);
    };

    loadComments();
  }, [selectedMovie]);

  useEffect(() => {
    if (!selectedMovie) return;

    const subscription = subscribeToPublicComments(
      selectedMovie.id,
      (payload) => {
        if (payload.eventType === "INSERT") {
          setPublicComments((prev) => [...prev, payload.new]);
        }
        if (payload.eventType === "DELETE") {
          setPublicComments((prev) =>
            prev.filter((c) => c.id !== payload.old.id)
          );
        }
      }
    );

    return () => supabase.removeChannel(subscription);
  }, [selectedMovie]);

  const handleSendPublicComment = async () => {
    if (!commentInput.trim()) return;

    await addPublicComment(
      user.id,
      user.fullName || user.username || "Anon",
      selectedMovie.id,
      commentInput
    );

    setCommentInput("");
  };

  if (!selectedMovie) return null;

  return (
    <div
      id="modal-background"
      onClick={handleBackgroundClick}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-white rounded-xl max-w-lg w-full p-15 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          onClick={() => {
            setSelectedMovie(null);
            setTrailerKey(null);
          }}
          className="absolute top-3 right-3 text-gray-700 font-bold text-3xl hover:text-red-500"
        >
          &times;
        </button>

        {!trailerKey ? (
          <>
            <img
              src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
              className="w-full h-72 object-cover rounded-2xl mb-4"
            />

            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-bold">{selectedMovie.title}</h2>

              <div className="flex flex-wrap gap-2 justify-end">
                {getGenresForMovie().map((g) => (
                  <span
                    key={g.id}
                    className="text-xs bg-black text-white px-2 py-1 rounded-md"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            </div>

            <p className="mb-4">{selectedMovie.overview}</p>

            <p className="text-sm text-gray-600 mb-2">
              Data publikimit: {selectedMovie.release_date}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Kohezgjatja:{" "}
              {runtime ? `${Math.floor(runtime / 60)}h ${runtime % 60}m` : "N/A"}
            </p>
            <p className="text-yellow-500 font-bold mb-4">
              ⭐ {selectedMovie.vote_average.toFixed(1)}
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleAddToWatchlist(selectedMovie)}
                className="bg-gray-600 p-3 text-white font-bold rounded-xl flex-1 hover:bg-gray-800 hover:cursor-pointer"
              >
                Shto ne listen e filmave te shikuar
              </button>

              <button
                onClick={() => handleAddToWatchLater(selectedMovie)}
                className="bg-gray-600 p-3 text-white font-bold rounded-xl flex-1 hover:bg-gray-800 hover:cursor-pointer"
              >
                Shiko me vone
              </button>
            </div>

            <button
              onClick={() => handleWatchTrailer(selectedMovie.id)}
              className="bg-red-600 p-3 w-full mt-3 text-white font-bold rounded-xl hover:bg-red-700 hover:cursor-pointer"
            >
              Shiko trailerin
            </button>

            <div className="mt-6">
              <h3 className="text-xl font-bold mb-3">Komentet e përdoruesve</h3>

              <div className="border-t border-black p-3 max-h-48 overflow-y-auto">

                {publicComments.length === 0 ? (
                  <p className="text-gray-400 text-sm">Nuk ka komente ende.</p>
                ) : (
                  publicComments.map((c) => (
                    <div
                      key={c.id}
                      className="relative mb-3 p-2 bg-white rounded-lg shadow"
                    >
                      <p className="text-xs text-gray-500 mb-1">{c.username}</p>
                      <p className="text-sm text-black">{c.comment}</p>

                      {user?.id === c.user_id && (
                        <button
                          onClick={() => deletePublicComment(c.id, user.id)}
                          className="text-red-500 text-xs absolute top-4 right-2 hover:cursor-pointer "
                        >
                            ❌
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <input
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Shkruaj një koment publik..."
                  className="flex-1 p-2 border rounded-lg"
                />
                <button
                  onClick={handleSendPublicComment}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 hover:cursor-pointer"
                >
                  Dërgo
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="aspect-video">
            <iframe
              width="100%"
              height="415"
              src={`https://www.youtube.com/embed/${trailerKey}`}
              title="Trailer"
              allowFullScreen
              className="rounded-xl"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieModal;
