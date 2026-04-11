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
import { Toaster, toast } from "sonner";
import {
  getUserMovieRating,
  saveMovieRating,
  getLastRatings,
} from "../utils/movieVotes";

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
  const [sentRecommendations, setSentRecommendations] = useState([]); // Track sent recommendations for this movie

  const navigate = useNavigate();

  const [personalRating, setPersonalRating] = useState(0);
  const [lastRatings, setLastRatings] = useState([]);

  const [avgRating, setAvgRating] = useState(null);
  const [totalVotes, setTotalVotes] = useState(null);
  const [showAverageBox, setShowAverageBox] = useState(false);

  const loadUsers = async () => {
    try {
      // Get friendships
      const { data: friendships, error: friendshipsError } = await supabase
        .from("friendships")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (friendshipsError) throw friendshipsError;

      if (!friendships || friendships.length === 0) {
        setAllUsers([]);
        return;
      }

      // Get friend details
      const friendIds = friendships.flatMap(f =>
        f.user1_id === user.id ? [f.user2_id] : [f.user1_id]
      );

      const { data: friendsData, error: friendsError } = await supabase
        .from("users")
        .select("*")
        .in("clerk_user_id", friendIds);

      if (friendsError) throw friendsError;

      setAllUsers(friendsData || []);
    } catch (error) {
      console.error("Error loading friends:", error);
      toast.error("Gabim gjatë ngarkimit të shokëve");
    }
  };

  const loadSentRecommendations = async () => {
    try {
      if (!selectedMovie) return;

      const { data, error } = await supabase
        .from("recommendations")
        .select("receiver_id")
        .eq("sender_id", user.id)
        .eq("movie_id", selectedMovie.id);

      if (error) throw error;

      setSentRecommendations(data ? data.map((r) => r.receiver_id) : []);
    } catch (error) {
      console.error("Error loading sent recommendations:", error);
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

    // Update sentRecommendations to include this user
    setSentRecommendations((prev) => [...prev, receiverId]);

    toast.success("Rekomandimi u dërgua me sukses!");
  };

  const getGenresForMovie = () => {
    if (!selectedMovie || !selectedMovie.genre_ids) return [];
    return genres.filter((g) => selectedMovie.genre_ids.includes(g.id));
  };

  const handleBackgroundClick = (e) => {
    if (e.target.id === "modal-background") {
      setShowAverageBox(false);
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
    if (!selectedMovie || !user) return;

    loadSentRecommendations();
  }, [selectedMovie, user]);

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

  useEffect(() => {
    if (!selectedMovie || !user) return;

    const loadRatingData = async () => {
      const r = await getUserMovieRating(selectedMovie.id, user.id);
      setPersonalRating(r || 0);

      const recent = await getLastRatings(selectedMovie.id);
      setLastRatings(recent);
    };

    loadRatingData();
  }, [selectedMovie, user]);

  useEffect(() => {
    if (!selectedMovie) return;
    setShowAverageBox(false);
  }, [selectedMovie]);

  useEffect(() => {
    if (!selectedMovie) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedMovie]);

  const fetchAverage = async () => {
    const { data, error } = await supabase
      .from("movie_votes")
      .select("rating, movie_id", { count: "exact" })
      .eq("movie_id", selectedMovie.id);

    if (error) {
      console.error("Error fetching avg:", error);
      return;
    }

    if (!data || data.length === 0) {
      setAvgRating(0);
      setTotalVotes(0);
      return;
    }

    const total = data.reduce((sum, r) => sum + r.rating, 0);
    const avg = total / data.length;

    setAvgRating(avg);
    setTotalVotes(data.length);
  };

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

  const handleRatingClick = async (rating) => {
    if (!user) {
      return toast.error("Kyqu për të vlerësuar filmin.");
    }

    setPersonalRating(rating);

    const saved = await saveMovieRating(selectedMovie.id, user.id, rating);

    if (!saved) {
      return toast.error("Gabim gjatë ruajtjes së vlerësimit.");
    }

    toast.success(`Ju vlerësuat filmin me ${rating} yje!`);

    const recent = await getLastRatings(selectedMovie.id);
    setLastRatings(recent);

    await fetchAverage();
  };

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

        {trailerKey && (
          <button
            onClick={() => setTrailerKey(null)}
            className="absolute top-6 left-3 font-bold text-red-500 cursor-pointer"
          >
            ← Kthehu prapa
          </button>
        )}

        {!trailerKey ? (
          <>
            <img
              src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
              className="w-full h-72 object-cover rounded-2xl mb-4"
            />

            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-bold flex">
                {selectedMovie.title}{" "}
                <p className="text-yellow-500 font-bold flex ml-2">
                  ⭐ {selectedMovie.vote_average.toFixed(1)}
                </p>
              </h2>

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
              Release date: {selectedMovie.release_date}
            </p>

            <p className="text-sm text-gray-600 mb-2">
              Runtime:{" "}
              {runtime
                ? `${Math.floor(runtime / 60)}h ${runtime % 60}m`
                : "N/A"}
            </p>

            <div className="flex items-center justify-between mt-4 mb-4">
              <div className="flex items-center gap-2">
                <p className="font-bold">Personal rating:</p>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => handleRatingClick(star)}
                    className={`cursor-pointer text-2xl ${
                      star <= personalRating
                        ? "text-yellow-500"
                        : "text-gray-400"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>

              <button
                className="text-blue-600  text-sm hover:cursor-pointer"
                onClick={async () => {
                  await fetchAverage();
                  setShowAverageBox(!showAverageBox);
                }}
              >
                See average ratings ↓
              </button>
            </div>

            {showAverageBox && (
              <div className="p-3 mb-4 bg-gray-100 rounded-lg shadow-inner">
                <p className="font-bold">
                  Average: ⭐ {avgRating?.toFixed(1)}
                </p>
                <p className="text-sm text-gray-700">
                  Total votes: {totalVotes}
                </p>

                <p className="mt-2 font-semibold"></p>
                {lastRatings.length === 0 ? (
                  <p className="text-sm text-gray-500"></p>
                ) : (
                  lastRatings.map((r, i) => (
                    <p key={i} className="text-sm">
                      ⭐ {r.rating}
                    </p>
                  ))
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleAddToWatchlist(selectedMovie)}
                className="bg-gray-600 p-3 text-white font-bold rounded-xl flex-1 hover:bg-gray-800 hover:cursor-pointer"
              >
                Add to watchlist
              </button>

              <button
                onClick={() => handleAddToWatchLater(selectedMovie)}
                className="bg-gray-600 p-3 text-white font-bold rounded-xl flex-1 hover:bg-gray-800 hover:cursor-pointer"
              >
                Watch later
              </button>
            </div>

            <button
              onClick={() => handleWatchTrailer(selectedMovie.id)}
              className="bg-red-600 p-3 w-full mt-3 text-white font-bold rounded-xl hover:bg-red-700 hover:cursor-pointer"
            >
              Watch trailer
            </button>

            <button
              onClick={async () => {
                await loadUsers();
                await loadSentRecommendations();
                setShowUsersModal(true);
              }}
              className="bg-green-600 p-3 w-full mt-3 text-white font-bold rounded-xl hover:bg-green-700 hover:cursor-pointer"
            >
              Rekomando filmin te një shok
            </button>

            <div className="mt-6">
              <h3 className="text-xl font-bold mb-3">Public Comments</h3>

              <div className="border-t border-black pt-3 pb-3 max-h-48 overflow-y-auto">
                {publicComments.length === 0 ? (
                  <p className="text-gray-400 text-sm">No comments yet</p>
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
          <div className="aspect-video mt-10">
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
            <h2 className="text-xl font-bold mb-4">Zgjidh një Shok</h2>

            {allUsers.length === 0 && (
              <p className="text-gray-500 text-center mb-4">
                Nuk keni shokë. Shtoni shokë nga faqja "Shto Shokë".
              </p>
            )}

            <div className="max-h-60 overflow-y-auto">
              {allUsers.map((u) => {
                const isRecommended = sentRecommendations.includes(u.clerk_user_id);
                return (
                  <div
                    key={u.id}
                    onClick={() => !isRecommended && sendRecommendation(u.clerk_user_id)}
                    className={`flex items-center gap-3 p-2 rounded ${
                      isRecommended
                        ? "bg-gray-100 cursor-not-allowed opacity-60"
                        : "hover:bg-gray-200 cursor-pointer"
                    }`}
                  >
                    <img
                      src={u.image_url}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <p className="font-bold flex-1">{u.full_name}</p>
                    {isRecommended && (
                      <span className="text-green-600 font-bold text-lg">✓</span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowUsersModal(false)}
              className="mt-4 w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-800 hover:cursor-pointer"
            >
                Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieModal;
