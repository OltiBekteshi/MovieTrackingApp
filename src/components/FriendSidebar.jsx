import React, { useEffect, useMemo, useState } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import { supabase } from "../utils/supabaseClient";
import { toast } from "sonner";

const FriendSidebar = ({ user, show, onClose }) => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const searchLower = searchTerm.toLowerCase();
    return allUsers.filter((u) =>
      u.full_name?.toLowerCase().includes(searchLower)
    );
  }, [searchTerm, allUsers]);

  useEffect(() => {
    if (!user || !show) return;
    const loadData = async () => {
      try {
        setLoading(true);

        const { data: friendships, error: friendshipsError } = await supabase
          .from("friendships")
          .select("*")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
        if (friendshipsError) throw friendshipsError;

        const friendIds = (friendships || []).flatMap((f) =>
          f.user1_id === user.id ? [f.user2_id] : [f.user1_id]
        );

        const { data: friendsData, error: friendsError } = friendIds.length
          ? await supabase
              .from("users")
              .select("*")
              .in("clerk_user_id", friendIds)
          : { data: [], error: null };
        if (friendsError) throw friendsError;

        const { data: requests, error: requestsError } = await supabase
          .from("friend_requests")
          .select("*")
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .eq("status", "pending");
        if (requestsError) throw requestsError;

        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("*")
          .neq("clerk_user_id", user.id);
        if (usersError) throw usersError;

        setFriends(friendsData || []);
        setFriendRequests(requests || []);
        setAllUsers(usersData || []);
      } catch (error) {
        console.error("Error loading friend sidebar data:", error);
        toast.error("Failed to load friend sidebar data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, show]);

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
    if (receivedRequest) return {
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
        .select("*")
        .eq("clerk_user_id", senderId)
        .single();
      if (newFriend) {
        setFriends((prev) => [...prev, newFriend]);
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Failed to accept friend request.");
    } finally {
      setActionLoading(false);
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);
      if (error) throw error;
      toast.success("Friend request declined.");
      setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
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
      <aside className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[#1f2a2a] text-white shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div>
            <h2 className="text-xl font-bold">Friends</h2>
            <p className="text-sm text-gray-300">
              Friends, requests, and search.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 hover:cursor-pointer">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          <div className="rounded-3xl bg-white p-4 shadow-inner text-black">
            <label className="block text-sm text-gray-700 mb-2">Search users</label>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type a name..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-black outline-none focus:border-cyan-400"
            />
            {searchTerm && (
              <div className="mt-4 space-y-3">
                {filteredUsers.length === 0 ? (
                  <p className="text-sm text-gray-500">No users found.</p>
                ) : (
                  filteredUsers.slice(0, 8).map((userResult) => {
                    const status = getUserStatus(userResult.clerk_user_id);
                    return (
                      <div
                        key={userResult.clerk_user_id}
                        className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={userResult.image_url || "/default-avatar.png"}
                            alt={`${userResult.full_name} avatar`}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-black">{userResult.full_name}</p>
                            <p className="text-xs text-gray-500">{status.text}</p>
                          </div>
                        </div>
                        <button
                          disabled={status.status !== "none" || actionLoading}
                          onClick={() => sendFriendRequest(userResult.clerk_user_id)}
                          className={`rounded-full px-3 py-2 text-sm font-semibold border border-black transition duration-200 ease-in-out ${
                            status.status === "none"
                              ? "bg-white text-black border-black cursor-pointer"
                              : status.status === "pending"
                              ? "bg-green-700 text-white cursor-default"
                              : "bg-slate-200 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {status.status === "pending" ? (
                            <FiCheck size={16} />
                          ) : (
                            "+"
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white p-4 shadow-inner text-black">
            <h3 className="text-lg font-semibold mb-3">Pending requests</h3>
            {incomingRequests.length === 0 ? (
              <p className="text-sm text-gray-500">No requests at the moment.</p>
            ) : (
              incomingRequests.map((request) => {
                const sender = allUsers.find(
                  (u) => u.clerk_user_id === request.sender_id
                );
                return (
                  <div
                    key={request.id}
                    className="mb-3 rounded-2xl bg-slate-300 p-3 text-black"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={sender?.image_url || "/default-avatar.png"}
                          alt={`${sender?.full_name || "User"} avatar`}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{sender?.full_name || "User"}</p>
                          <p className="text-sm text-gray-500">Friend request</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptFriendRequest(request.id, request.sender_id)}
                          className="rounded-full bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-900 hover:cursor-pointer"
                          disabled={actionLoading}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => rejectFriendRequest(request.id)}
                          className="rounded-full bg-red-500 px-3 py-2 text-sm font-semibold hover:bg-red-400 hover:cursor-pointer text-white"
                          disabled={actionLoading}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="rounded-3xl bg-[#273737] p-4 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Friends</h3>
                <p className="text-sm text-gray-400">{friends.length} friends</p>
              </div>
            </div>
            {friends.length === 0 ? (
              <p className="text-sm text-gray-400">You don’t have friends yet.</p>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div key={friend.clerk_user_id} className="flex items-center gap-3 rounded-2xl bg-[#1c3232] p-3">
                    <img
                      src={friend.image_url || "/default-avatar.png"}
                      alt={`${friend.full_name} avatar`}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{friend.full_name}</p>
                      <p className="text-xs text-gray-400">Friend</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default FriendSidebar;
