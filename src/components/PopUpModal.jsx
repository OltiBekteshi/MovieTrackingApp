import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  getPublicComments,
  addPublicComment,
  deletePublicComment,
  subscribeToPublicComments,
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

  const [showUsersModal, setShowUsersModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  const navigate = useNavigate();

  const loadUsers = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (!error) {
      setAllUsers(data.filter((u) => u.clerk_user_id !== user.id));
    }
  };

  const sendNotification = async (receiverId) => {
    await supabase.from("notifications").insert({
      receiver_id: receiverId,
      title: "Rekomandim i ri filmi",
      message: `${user.fullName} ju rekomandoi filmin "${selectedMovie.title}".`,
      movie_id: selectedMovie.id,
    });
  };

  const sendRecommendation = async (receiverId) => {
    await supabase.from("recommendations").insert({
      sender_id: user.id,
      receiver_id: receiverId,
      movie_id: selectedMovie.id,
      message: `${user.fullName} ju rekomandoi filmin "${selectedMovie.title}".`,
    });

    await sendNotification(receiverId);

    setShowUsersModal(false);
    alert("Rekomandimi u dërgua me sukses!");
  };

  const getGenresForMovie = () => {
    if (!selectedMovie || !selectedMovie.genre_ids) return [];
    return genres.filter((g) => selectedMovie.genre_ids.includes(g.id));
  };

  const handleBackgroundClick = (e) => {
    if (e.target.id === "modal-background") {
      setSelectedMovie(null);
      setTrailerKey(null);
      navigate("/movies", { replace: true });
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
            navigate("/movies", { replace: true });
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
                    className="text-xs text-black px-2 py-1 rounded-md"
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
              {runtime
                ? `${Math.floor(runtime / 60)}h ${runtime % 60}m`
                : "N/A"}
            </p>

            <p className="text-yellow-500 font-bold mb-4">
              ⭐ {selectedMovie.vote_average.toFixed(1)}
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleAddToWatchlist(selectedMovie)}
                className="bg-gray-600 p-3 text-white font-bold rounded-xl flex-1 hover:bg-gray-800 hover:cursor-pointer"
              >
                Shto në listë
              </button>

              <button
                onClick={() => handleAddToWatchLater(selectedMovie)}
                className="bg-gray-600 p-3 text-white font-bold rounded-xl flex-1 hover:bg-gray-800 hover:cursor-pointer"
              >
                Shiko më vonë
              </button>
            </div>

            <button
              onClick={() => handleWatchTrailer(selectedMovie.id)}
              className="bg-red-600 p-3 w-full mt-3 text-white font-bold rounded-xl hover:bg-red-700 hover:cursor-pointer"
            >
              Shiko trailerin
            </button>

            <button
              onClick={() => {
                loadUsers();
                setShowUsersModal(true);
              }}
              className="bg-green-600 p-3 w-full mt-3 text-white font-bold rounded-xl hover:bg-green-700 hover:cursor-pointer"
            >
              Rekomando filmin te një shok/shoqe
            </button>

            <div className="mt-6">
              <h3 className="text-xl font-bold mb-3">Komentet e shikuesve</h3>

              <div className="border-t border-black pt-3 pb-3 max-h-48 overflow-y-auto">
                {publicComments.length === 0 ? (
                  <p className="text-gray-400 text-sm">Nuk ka komente ende.</p>
                ) : (
                  publicComments.map((c) => (
                    <div
                      key={c.id}
                      className="relative mb-3 p-2 bg-white rounded-lg shadow w-full"
                    >
                      <p className="text-xs text-gray-500 mb-1">{c.username}</p>
                      <p className="text-sm text-black">{c.comment}</p>

                      {user?.id === c.user_id && (
                        <button
                          onClick={() => deletePublicComment(c.id, user.id)}
                          className="text-red-500 text-xs absolute top-5 right-2 hover:cursor-pointer"
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
                  className="text-black px-3 hover:cursor-pointer"
                >
                  ➤
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

      {showUsersModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60">
          <div className="bg-white w-96 p-5 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Zgjidh një përdorues</h2>

            {allUsers.length === 0 && (
              <p className="text-gray-500 text-center mb-4">
                Nuk u gjet asnjë përdorues.
              </p>
            )}

            <div className="max-h-60 overflow-y-auto">
              {allUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => sendRecommendation(u.clerk_user_id)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded cursor-pointer"
                >
                  <img
                    src={u.image_url}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <p className="font-bold">{u.full_name}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowUsersModal(false)}
              className="mt-4 w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-800 hover:cursor-pointer"
            >
              Mbyll
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieModal;
