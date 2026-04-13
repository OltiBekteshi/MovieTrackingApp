import React, { useEffect, useState, useCallback } from "react";
import { FiX, FiCheck, FiSearch, FiUserPlus } from "react-icons/fi";
import { supabase } from "../utils/supabaseClient";
import { toast } from "sonner";
import { useDebouncedValue } from "../utils/useDebouncedValue";
import {
  MIN_USER_SEARCH_LEN,
  USER_SEARCH_LIMIT,
  USER_SEARCH_DEBOUNCE_MS,
  sanitizeIlikePrefix,
} from "../utils/userSearch";

const FriendSidebar = ({ user, show, onClose }) => {
  const [sidebarTab, setSidebarTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [senderById, setSenderById] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, USER_SEARCH_DEBOUNCE_MS);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);

      const { data: friendships, error: friendshipsError } = await supabase
        .from("friendships")
        .select("user1_id, user2_id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
      if (friendshipsError) throw friendshipsError;

      const friendIds = (friendships || []).flatMap((f) =>
        f.user1_id === user.id ? [f.user2_id] : [f.user1_id]
      );

      const { data: friendsData, error: friendsError } = friendIds.length
        ? await supabase
            .from("users")
            .select("id, clerk_user_id, full_name, image_url")
            .in("clerk_user_id", friendIds)
        : { data: [], error: null };
      if (friendsError) throw friendsError;

      const { data: requests, error: requestsError } = await supabase
        .from("friend_requests")
        .select("id, sender_id, receiver_id, status")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("status", "pending");
      if (requestsError) throw requestsError;

      const incoming = (requests || []).filter(
        (r) => r.receiver_id === user.id && r.status === "pending"
      );
      const senderIds = [...new Set(incoming.map((r) => r.sender_id))];

      let sendersMap = {};
      if (senderIds.length > 0) {
        const { data: senders, error: sendersError } = await supabase
          .from("users")
          .select("id, clerk_user_id, full_name, image_url")
          .in("clerk_user_id", senderIds);
        if (sendersError) throw sendersError;
        sendersMap = Object.fromEntries(
          (senders || []).map((s) => [s.clerk_user_id, s])
        );
      }

      setFriends(friendsData || []);
      setFriendRequests(requests || []);
      setSenderById(sendersMap);
    } catch (error) {
      console.error("Error loading friend sidebar data:", error);
      toast.error("Failed to load friend sidebar data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user || !show) return;
    setSidebarTab("friends");
    loadData();
  }, [user, show, loadData]);

  useEffect(() => {
    if (!user || !show || sidebarTab !== "find") return;

    const runSearch = async () => {
      const safe = sanitizeIlikePrefix(debouncedSearch);
      if (safe.length < MIN_USER_SEARCH_LEN) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, full_name, image_url, clerk_user_id")
          .neq("clerk_user_id", user.id)
          .ilike("full_name", `${safe}%`)
          .limit(USER_SEARCH_LIMIT);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    runSearch();
  }, [user, show, sidebarTab, debouncedSearch]);

  const getUserStatus = (targetId) => {
    if (friends.some((friend) => friend.clerk_user_id === targetId)) {
      return { status: "friend", text: "Friend" };
    }

    const sentRequest = friendRequests.find(
      (request) =>
        request.sender_id === user.id && request.receiver_id === targetId
    );
    if (sentRequest) return { status: "pending", text: "Request sent" };

    const receivedRequest = friendRequests.find(
      (request) =>
        request.sender_id === targetId && request.receiver_id === user.id
    );
    if (receivedRequest)
      return {
        status: "received",
        text: "Accept request",
        requestId: receivedRequest.id,
      };

    return { status: "none", text: "Send request" };
  };

  const sendFriendRequest = async (receiverId) => {
    try {
      setActionLoading(true);
      const { error } = await supabase.from("friend_requests").insert({
        sender_id: user.id,
        receiver_id: receiverId,
        status: "pending",
      });
      if (error) throw error;
      toast.success("Friend request sent successfully!");
      setFriendRequests((prev) => [
        ...prev,
        { sender_id: user.id, receiver_id: receiverId, status: "pending" },
      ]);
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Failed to send friend request.");
    } finally {
      setActionLoading(false);
    }
  };

  const acceptFriendRequest = async (requestId, senderId) => {
    try {
      setActionLoading(true);
      const { error: updateError } = await supabase
        .from("friend_requests")
        .update({ status: "accepted" })
        .eq("id", requestId);
      if (updateError) throw updateError;

      const user1 = user.id < senderId ? user.id : senderId;
      const user2 = user.id < senderId ? senderId : user.id;
      const { error: friendshipError } = await supabase
        .from("friendships")
        .insert({ user1_id: user1, user2_id: user2 });
      if (friendshipError) throw friendshipError;

      toast.success("Friend request accepted!");
      setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
      const { data: newFriend } = await supabase
        .from("users")
        .select("id, clerk_user_id, full_name, image_url")
        .eq("clerk_user_id", senderId)
        .single();
      if (newFriend) {
        setFriends((prev) => [...prev, newFriend]);
        setSenderById((prev) => {
          const next = { ...prev };
          delete next[senderId];
          return next;
        });
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Failed to accept friend request.");
    } finally {
      setActionLoading(false);
    }
  };

  const rejectFriendRequest = async (requestId, senderId) => {
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);
      if (error) throw error;
      toast.success("Friend request declined.");
      setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
      setSenderById((prev) => {
        const next = { ...prev };
        delete next[senderId];
        return next;
      });
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast.error("Failed to decline friend request.");
    } finally {
      setActionLoading(false);
    }
  };

  const incomingRequests = friendRequests.filter(
    (request) => request.receiver_id === user.id
  );

  if (!show) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <aside className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-[#1f2a2a] text-white shadow-2xl">
        <div className="shrink-0 border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Friends</h2>
              <p className="text-sm text-gray-300">
                Your crew and new connections.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 hover:cursor-pointer"
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        <nav
          className="grid shrink-0 grid-cols-3 border-b border-white/10"
          aria-label="Friends sidebar sections"
        >
          <button
            type="button"
            onClick={() => setSidebarTab("friends")}
            className={`px-1 py-2.5 text-center text-xs font-semibold transition-colors sm:text-sm ${
              sidebarTab === "friends"
                ? "text-white border-b-2 border-cyan-400"
                : "text-gray-400 border-b-2 border-transparent hover:text-gray-200"
            }`}
          >
            Your friends
          </button>
          <button
            type="button"
            onClick={() => setSidebarTab("find")}
            className={`px-1 py-2.5 text-center text-xs font-semibold transition-colors sm:text-sm ${
              sidebarTab === "find"
                ? "text-white border-b-2 border-cyan-400"
                : "text-gray-400 border-b-2 border-transparent hover:text-gray-200"
            }`}
          >
            Find people
          </button>
          <button
            type="button"
            onClick={() => setSidebarTab("pending")}
            className={`px-1 py-2.5 text-center text-xs font-semibold transition-colors sm:text-sm ${
              sidebarTab === "pending"
                ? "text-white border-b-2 border-cyan-400"
                : "text-gray-400 border-b-2 border-transparent hover:text-gray-200"
            }`}
          >
            <span className="inline-flex flex-wrap items-center justify-center gap-1">
              <span>Pending</span>
              {incomingRequests.length > 0 && (
                <span className="inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold leading-none text-white sm:text-xs">
                  {incomingRequests.length}
                </span>
              )}
            </span>
          </button>
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {sidebarTab === "friends" && (
            <div className="rounded-2xl border border-white/10 bg-[#273737]/80 p-4 shadow-inner backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    Your friends
                  </h3>
                  <p className="text-sm text-gray-400">
                    {friends.length}{" "}
                    {friends.length === 1 ? "friend" : "friends"}
                  </p>
                </div>
              </div>
              {loading ? (
                <p className="text-sm text-gray-400">Loading...</p>
              ) : friends.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No friends yet. Open the{" "}
                  <button
                    type="button"
                    onClick={() => setSidebarTab("find")}
                    className="font-medium text-cyan-400 underline decoration-cyan-400/50 underline-offset-2 hover:text-cyan-300"
                  >
                    Find people
                  </button>{" "}
                  tab to search and send requests.
                </p>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <div
                      key={friend.clerk_user_id}
                      className="flex items-center gap-3 rounded-xl bg-[#1c3232] p-3 ring-1 ring-white/5"
                    >
                      <img
                        src={friend.image_url || "/default-avatar.png"}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {friend.full_name}
                        </p>
                        <p className="text-xs text-gray-400">Friend</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {sidebarTab === "find" && (
            <div className="group relative overflow-hidden rounded-2xl ring-1 ring-white/10">
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(45,212,191,0.12),transparent_50%)]"
                  aria-hidden
                />
                <div
                  className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal-400 via-cyan-500/70 to-teal-600/50"
                  aria-hidden
                />

                <div className="relative bg-gradient-to-br from-[#2d3d3d]/95 to-[#1a2424]/98 p-4 pl-5 backdrop-blur-sm">
                  <div className="flex gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/25 to-cyan-600/10 ring-1 ring-teal-400/20">
                      <FiUserPlus
                        className="h-5 w-5 text-teal-200/90"
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <h3 className="text-base font-semibold tracking-tight text-white">
                        Find someone new
                      </h3>
                      <p className="mt-0.5 text-sm leading-snug text-gray-400">
                        Look up by name, then send a request. Needs{" "}
                        {MIN_USER_SEARCH_LEN}+ letters.
                      </p>
                    </div>
                  </div>

                  <label className="sr-only" htmlFor="friend-sidebar-search">
                    Search by name
                  </label>
                  <div className="relative mt-4">
                    <FiSearch
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-300/40"
                      aria-hidden
                    />
                    <input
                      id="friend-sidebar-search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Try a name…"
                      className="w-full rounded-2xl border border-white/10 bg-black/25 py-3 pl-11 pr-4 text-sm text-white shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)] placeholder:text-gray-500 transition focus:border-teal-400/40 focus:outline-none focus:ring-2 focus:ring-teal-500/25"
                    />
                  </div>

                  {searchTerm.trim().length === 0 && (
                    <p className="mt-2 text-center text-[11px] italic text-gray-500">
                      Start typing to search
                    </p>
                  )}

                  {searchTerm.trim().length > 0 &&
                    searchTerm.trim().length < MIN_USER_SEARCH_LEN && (
                      <p className="mt-2 text-xs text-teal-200/50">
                        {MIN_USER_SEARCH_LEN - searchTerm.trim().length} more
                        letter
                        {MIN_USER_SEARCH_LEN - searchTerm.trim().length === 1
                          ? ""
                          : "s"}{" "}
                        to search.
                      </p>
                    )}
                  {searching && (
                    <p className="mt-2 text-xs font-medium text-teal-300/70">
                      Searching…
                    </p>
                  )}

                  {searchTerm.trim().length >= MIN_USER_SEARCH_LEN &&
                    !searching && (
                      <div className="mt-4 space-y-2">
                        {searchResults.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-white/10 bg-black/20 py-6 text-center text-sm text-gray-500">
                            No matches — try another spelling.
                          </p>
                        ) : (
                          searchResults.slice(0, 8).map((userResult) => {
                            const status = getUserStatus(
                              userResult.clerk_user_id
                            );
                            return (
                              <div
                                key={userResult.clerk_user_id}
                                className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-black/20 p-2.5 transition hover:border-teal-500/20 hover:bg-teal-950/20"
                              >
                                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                  <img
                                    src={
                                      userResult.image_url ||
                                      "/default-avatar.png"
                                    }
                                    alt=""
                                    className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-teal-500/15"
                                  />
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-white">
                                      {userResult.full_name}
                                    </p>
                                    <p className="text-[11px] text-gray-500">
                                      {status.text}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  disabled={
                                    status.status !== "none" || actionLoading
                                  }
                                  onClick={() =>
                                    sendFriendRequest(userResult.clerk_user_id)
                                  }
                                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm transition ${
                                    status.status === "none"
                                      ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-400 hover:to-cyan-500"
                                      : status.status === "pending"
                                        ? "cursor-default bg-emerald-900/90 text-emerald-100"
                                        : "cursor-not-allowed bg-white/5 text-gray-500"
                                  }`}
                                >
                                  {status.status === "pending" ? (
                                    <FiCheck className="h-3.5 w-3.5" />
                                  ) : (
                                    "Add"
                                  )}
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                </div>
              </div>
          )}

          {sidebarTab === "pending" && (
            <div className="rounded-2xl border border-white/10 bg-[#273737]/80 p-4 shadow-inner backdrop-blur-sm">
              <h3 className="mb-1 text-lg font-semibold tracking-tight text-white">
                Pending requests
              </h3>
              <p className="mb-4 text-sm text-gray-400">
                People who want to connect with you.
              </p>
              {loading ? (
                <p className="text-sm text-gray-400">Loading...</p>
              ) : incomingRequests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-black/20 px-4 py-6 text-center">
                  <p className="text-sm text-gray-400">
                    No pending requests at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {incomingRequests.map((request) => {
                    const sender = senderById[request.sender_id];
                    return (
                      <div
                        key={request.id}
                        className="rounded-xl border border-white/5 bg-[#1c3232] p-3 ring-1 ring-white/5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={sender?.image_url || "/default-avatar.png"}
                              alt=""
                              className="h-11 w-11 rounded-full object-cover ring-2 ring-cyan-500/15"
                            />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-white">
                                {sender?.full_name || "User"}
                              </p>
                              <p className="text-xs text-gray-400">
                                Wants to be friends
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                acceptFriendRequest(
                                  request.id,
                                  request.sender_id
                                )
                              }
                              className="rounded-full bg-gradient-to-r from-emerald-600 to-green-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:from-emerald-500 hover:to-green-500 hover:cursor-pointer disabled:opacity-50"
                              disabled={actionLoading}
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                rejectFriendRequest(
                                  request.id,
                                  request.sender_id
                                )
                              }
                              className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-gray-200 transition hover:bg-red-500/80 hover:text-white hover:cursor-pointer disabled:opacity-50"
                              disabled={actionLoading}
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default FriendSidebar;
