import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../utils/supabaseClient";
import { Toaster, toast } from "sonner";
import { useDebouncedValue } from "../utils/useDebouncedValue";
import {
  MIN_USER_SEARCH_LEN,
  USER_SEARCH_LIMIT,
  USER_SEARCH_DEBOUNCE_MS,
  sanitizeIlikePrefix,
} from "../utils/userSearch";

const AddFriends = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, USER_SEARCH_DEBOUNCE_MS);
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendships, setFriendships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const loadRelations = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);

      const [requestsRes, friendsRes] = await Promise.all([
        supabase
          .from("friend_requests")
          .select("id, sender_id, receiver_id, status")
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
        supabase
          .from("friendships")
          .select("user1_id, user2_id")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`),
      ]);

      if (requestsRes.error) throw requestsRes.error;
      if (friendsRes.error) throw friendsRes.error;

      setFriendRequests(requestsRes.data || []);
      setFriendships(friendsRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadRelations();
  }, [user, loadRelations]);

  useEffect(() => {
    if (!user) return;

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
        toast.error("Search failed");
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    runSearch();
  }, [user, debouncedSearch]);

  const getUserStatus = (userId) => {
    const isFriend = friendships.some(
      (f) =>
        (f.user1_id === user.id && f.user2_id === userId) ||
        (f.user1_id === userId && f.user2_id === user.id)
    );

    if (isFriend) return { status: "friend", text: "Friend" };

    const sentRequest = friendRequests.find(
      (r) =>
        r.sender_id === user.id &&
        r.receiver_id === userId &&
        r.status === "pending"
    );
    if (sentRequest) return { status: "pending", text: "Request sent" };

    const receivedRequest = friendRequests.find(
      (r) =>
        r.sender_id === userId &&
        r.receiver_id === user.id &&
        r.status === "pending"
    );
    if (receivedRequest)
      return { status: "received", text: "Accept request" };

    return { status: "none", text: "Send request" };
  };

  const sendFriendRequest = async (receiverId) => {
    try {
      const { error } = await supabase.from("friend_requests").insert({
        sender_id: user.id,
        receiver_id: receiverId,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Friend request sent!");
      loadRelations();
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Failed to send friend request");
    }
  };

  const acceptFriendRequest = async (requestId, senderId) => {
    try {
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
      loadRelations();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Failed to accept friend request");
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);

      if (error) throw error;

      toast.success("Friend request declined");
      loadRelations();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast.error("Failed to decline friend request");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const trimmed = searchTerm.trim();
  const showMinLengthHint =
    trimmed.length > 0 && trimmed.length < MIN_USER_SEARCH_LEN;
  const safeDebounced = sanitizeIlikePrefix(debouncedSearch);
  const canShowResults = safeDebounced.length >= MIN_USER_SEARCH_LEN;

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-black mb-8">
          Add friends
        </h1>

        <div className="mb-6">
          <input
            type="text"
            placeholder={`Search users (at least ${MIN_USER_SEARCH_LEN} characters)...`}
            className="w-full max-w-md mx-auto block px-4 py-2 rounded-lg bg-white text-black border-2 border-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {canShowResults &&
            searchResults.map((u) => {
              const userStatus = getUserStatus(u.clerk_user_id);

              return (
                <div key={u.id} className="bg-white rounded-xl p-4 shadow-md">
                  <div className="flex items-center mb-3">
                    <img
                      src={u.image_url || "/default-avatar.png"}
                      alt={u.full_name}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                    <div>
                      <h3 className="font-semibold text-black">{u.full_name}</h3>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        userStatus.status === "friend"
                          ? "bg-green-100 text-green-800"
                          : userStatus.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : userStatus.status === "received"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {userStatus.text}
                    </span>

                    {userStatus.status === "none" && (
                      <button
                        onClick={() => sendFriendRequest(u.clerk_user_id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                      >
                        Send request
                      </button>
                    )}

                    {userStatus.status === "received" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const request = friendRequests.find(
                              (r) =>
                                r.sender_id === u.clerk_user_id &&
                                r.receiver_id === user.id
                            );
                            acceptFriendRequest(request.id, u.clerk_user_id);
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => {
                            const request = friendRequests.find(
                              (r) =>
                                r.sender_id === u.clerk_user_id &&
                                r.receiver_id === user.id
                            );
                            rejectFriendRequest(request.id);
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {searching && (
          <div className="text-center text-gray-600 mt-6">Searching...</div>
        )}

        {!searching && trimmed.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            Enter at least {MIN_USER_SEARCH_LEN} characters to search for users.
          </div>
        )}

        {showMinLengthHint && (
          <div className="text-center text-gray-500 mt-8">
            Enter {MIN_USER_SEARCH_LEN - trimmed.length} more character
            {MIN_USER_SEARCH_LEN - trimmed.length === 1 ? "" : "s"} to start
            searching.
          </div>
        )}

        {!searching &&
          canShowResults &&
          searchResults.length === 0 &&
          !showMinLengthHint && (
            <div className="text-center text-gray-500 mt-8">
              No users found
            </div>
          )}
      </div>
      <Toaster />
    </div>
  );
};

export default AddFriends;
