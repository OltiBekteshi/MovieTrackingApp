import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  getPublicComments,
  addPublicComment,
  deletePublicComment,
  subscribeToPublicComments,
} from "../utils/movieService";
import { formatTimeAgo } from "../utils/timeAgo";
import { supabase } from "../utils/supabaseClient";
import { Toaster, toast } from "sonner";
import {
  deleteUserMovieRating,
  getUserMovieRating,
  saveMovieRating,
} from "../utils/movieVotes";
import {
  FiBookmark,
  FiClock,
  FiMessageCircle,
  FiPlay,
  FiSend,
  FiTrash2,
  FiUserPlus,
} from "react-icons/fi";

const genres = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 53, name: "Thriller" },
  { id: 27, name: "Horror" },
  { id: 99, name: "Documentary" },
  { id: 9648, name: "Mystery" },
];

/** Build a tree of { ...row, replies } from flat rows with optional parent_id */
function nestDiscussionComments(items) {
  if (!items?.length) return [];
  const byParent = new Map();
  for (const c of items) {
    const p = c.parent_id ?? null;
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p).push(c);
  }
  for (const list of byParent.values()) {
    list.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }
  const build = (parentId) =>
    (byParent.get(parentId) || []).map((c) => ({
      ...c,
      replies: build(c.id),
    }));
  return build(null);
}

function DiscussionComment({ node, user, onReply, onDelete, isNested }) {
  const initial =
    node.username && node.username.length > 0
      ? node.username.trim()[0].toUpperCase()
      : "?";

  return (
    <li
      className={
        isNested
          ? "pt-2 first:pt-0"
          : "border-b border-slate-100/80 px-3 py-3 last:border-b-0"
      }
    >
      <div className="flex gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-bold text-slate-600"
          aria-hidden
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="text-sm font-medium text-gray-900">
                {node.username}
              </span>
              {node.created_at && (
                <p className="text-xs text-gray-400">{formatTimeAgo(node.created_at)}</p>
              )}
            </div>
            {user?.id === node.user_id && (
              <button
                type="button"
                onClick={() => onDelete(node.id)}
                className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Delete comment"
              >
                <FiTrash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </div>
          <p className="mt-0.5 text-sm leading-relaxed text-gray-600">
            {node.comment}
          </p>
          <button
            type="button"
            onClick={() => onReply(node)}
            className="mt-2 text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            Reply
          </button>
        </div>
      </div>
      {node.replies?.length > 0 && (
        <ul className="mt-3 ml-2 list-none space-y-0 border-l border-slate-200 pl-3">
          {node.replies.map((r) => (
            <DiscussionComment
              key={r.id}
              node={r}
              user={user}
              onReply={onReply}
              onDelete={onDelete}
              isNested
            />
          ))}
        </ul>
      )}
    </li>
  );
}

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
  /** When set, the next post is a reply to this comment id */
  const [replyingTo, setReplyingTo] = useState(null);

  const [showUsersModal, setShowUsersModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [sentRecommendations, setSentRecommendations] = useState([]); // Track sent recommendations for this movie

  const navigate = useNavigate();

  const [personalRating, setPersonalRating] = useState(0);

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
        .select("id, clerk_user_id, full_name, image_url")
        .in("clerk_user_id", friendIds);

      if (friendsError) throw friendsError;

      setAllUsers(friendsData || []);
    } catch (error) {
      console.error("Error loading friends:", error);
      toast.error("Failed to load friends");
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
      title: "New movie recommendation",
      message: `${user.fullName} recommended the movie "${selectedMovie.title}".`,
      movie_id: selectedMovie.id,
    });
  };

  const sendRecommendation = async (receiverId) => {
    await supabase.from("recommendations").insert({
      sender_id: user.id,
      receiver_id: receiverId,
      movie_id: selectedMovie.id,
      message: `${user.fullName} recommended the movie "${selectedMovie.title}".`,
    });

    await sendNotification(receiverId);

    // Update sentRecommendations to include this user
    setSentRecommendations((prev) => [...prev, receiverId]);

    toast.success("Recommendation sent!");
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
    setReplyingTo(null);
  }, [selectedMovie?.id]);

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
          const removedId = payload.old.id;
          setPublicComments((prev) => {
            const drop = new Set([removedId]);
            let growing = true;
            while (growing) {
              growing = false;
              for (const c of prev) {
                if (
                  c.parent_id != null &&
                  drop.has(c.parent_id) &&
                  !drop.has(c.id)
                ) {
                  drop.add(c.id);
                  growing = true;
                }
              }
            }
            return prev.filter((c) => !drop.has(c.id));
          });
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
    };

    loadRatingData();
  }, [selectedMovie, user]);

  useEffect(() => {
    if (!selectedMovie) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedMovie]);

  const handleSendPublicComment = async () => {
    if (!commentInput.trim()) return;
    if (!user) {
      toast.error("Sign in to comment.");
      return;
    }

    const parent = replyingTo;

    await addPublicComment(
      user.id,
      user.fullName || user.username || "Anon",
      selectedMovie.id,
      commentInput.trim(),
      parent ? parent.id : null
    );

    if (
      parent?.userId &&
      parent.userId !== user.id
    ) {
      const replierName = user.fullName || user.username || "Someone";
      const { error: notifError } = await supabase.from("notifications").insert({
        receiver_id: parent.userId,
        title: "Reply to your comment",
        message: `${replierName} replied to your comment on "${selectedMovie.title}".`,
        movie_id: selectedMovie.id,
      });
      if (notifError) {
        console.error("Failed to notify comment author:", notifError);
      }
    }

    setCommentInput("");
    setReplyingTo(null);
  };

  const handleReplyClick = (comment) => {
    if (!user) {
      toast.error("Sign in to reply.");
      return;
    }
    setReplyingTo({
      id: comment.id,
      username: comment.username,
      userId: comment.user_id,
    });
  };

  const nestedDiscussion = useMemo(
    () => nestDiscussionComments(publicComments),
    [publicComments]
  );

  if (!selectedMovie) return null;

  const handleRatingClick = async (rating) => {
    if (!user) {
      return toast.error("Sign in to rate this movie.");
    }

    setPersonalRating(rating);

    const saved = await saveMovieRating(selectedMovie.id, user.id, rating);

    if (!saved) {
      return toast.error("Failed to save your rating.");
    }

    toast.success(`You rated this movie ${rating} star${rating === 1 ? "" : "s"}!`);
  };

  const handleClearRating = async () => {
    if (!user) {
      return toast.error("Sign in to change your rating.");
    }

    const ok = await deleteUserMovieRating(selectedMovie.id, user.id);

    if (!ok) {
      return toast.error("Couldn't remove your rating.");
    }

    setPersonalRating(0);
    toast.success("Rating removed");
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
            ← Back
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

            <div className="mt-5 mb-5 border-b border-gray-100 pb-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-5">
                  <span className="shrink-0 text-sm text-gray-500">Your rating</span>
                  <div
                    className="flex items-center gap-0.5"
                    role="group"
                    aria-label="Rate from 1 to 5 stars"
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(star)}
                        className={`flex h-11 w-10 items-center justify-center rounded-md text-[1.65rem] leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 ${
                          star <= personalRating
                            ? "text-amber-400"
                            : "text-gray-300 hover:text-gray-400"
                        }`}
                        aria-label={`${star} star${star === 1 ? "" : "s"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                {personalRating > 0 && (
                  <button
                    type="button"
                    onClick={handleClearRating}
                    className="shrink-0 self-start text-sm text-gray-400 underline-offset-2 hover:text-gray-700 hover:underline sm:self-center"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleAddToWatchlist(selectedMovie)}
                className="flex min-h-[48px] min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-gray-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-gray-800 hover:cursor-pointer"
              >
                <FiBookmark className="h-5 w-5 shrink-0" aria-hidden />
                <span className="text-center leading-tight">
                  Add to watchlist
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleAddToWatchLater(selectedMovie)}
                className="flex min-h-[48px] min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-gray-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-gray-800 hover:cursor-pointer"
              >
                <FiClock className="h-5 w-5 shrink-0" aria-hidden />
                <span className="text-center leading-tight">Watch later</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleWatchTrailer(selectedMovie.id)}
              className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 hover:cursor-pointer"
            >
              <FiPlay className="h-5 w-5 shrink-0" aria-hidden />
              Watch trailer
            </button>

            <button
              type="button"
              onClick={async () => {
                await loadUsers();
                await loadSentRecommendations();
                setShowUsersModal(true);
              }}
              className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 hover:cursor-pointer"
            >
              <FiUserPlus className="h-5 w-5 shrink-0" aria-hidden />
              Recommend movie to a friend
            </button>

            <section
              className="mt-8 rounded-2xl bg-gradient-to-br from-slate-200/70 via-slate-100/80 to-indigo-200/50 p-[1px] shadow-[0_4px_24px_-12px_rgba(15,23,42,0.15)]"
              aria-label="Public comments"
            >
              <div className="rounded-[15px] bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <FiMessageCircle className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Discussion
                  </h3>
                  <p className="text-xs text-gray-500">Public to everyone</p>
                </div>
              </div>

              <ul className="max-h-48 list-none space-y-0 overflow-y-auto rounded-xl border border-slate-100/90 bg-slate-50/30">
                {nestedDiscussion.length === 0 ? (
                  <li className="px-3 py-10 text-center text-sm text-gray-400">
                    No comments yet.
                  </li>
                ) : (
                  nestedDiscussion.map((node) => (
                    <DiscussionComment
                      key={node.id}
                      node={node}
                      user={user}
                      onReply={handleReplyClick}
                      onDelete={(id) => user && deletePublicComment(id, user.id)}
                      isNested={false}
                    />
                  ))
                )}
              </ul>

              <div className="mt-4 flex flex-col gap-2">
                {replyingTo && (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    <span>
                      Replying to{" "}
                      <span className="font-semibold text-slate-900">
                        {replyingTo.username}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="shrink-0 font-medium text-slate-500 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <label className="sr-only" htmlFor="public-comment-input">
                    Write a public comment
                  </label>
                  <input
                    id="public-comment-input"
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendPublicComment();
                    }}
                    placeholder={
                      replyingTo
                        ? `Reply to ${replyingTo.username}…`
                        : "Say something…"
                    }
                    className="min-h-[44px] w-full flex-1 rounded-xl border border-gray-200 bg-gray-50/80 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleSendPublicComment}
                    disabled={!commentInput.trim()}
                    className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 text-sm font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 sm:min-w-[7.5rem]"
                    aria-label="Post comment"
                  >
                    <FiSend className="h-4 w-4 opacity-90" aria-hidden />
                    Post
                  </button>
                </div>
              </div>
              </div>
            </section>
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
            <h2 className="text-xl font-bold mb-4">Choose a friend</h2>

            {allUsers.length === 0 && (
              <p className="text-gray-500 text-center mb-4">
                You don&apos;t have any friends yet. Add friends from the &quot;Add friends&quot; page.
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
