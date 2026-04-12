import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../utils/supabaseClient";
import { Toaster, toast } from "sonner";

const Friends = () => {
  const { user } = useUser();
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [requestsUsers, setRequestsUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadFriends();
  }, [user]);

  const loadFriends = async () => {
    try {
      setLoading(true);

      // Get friendships
      const { data: friendships, error: friendshipsError } = await supabase
        .from("friendships")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (friendshipsError) throw friendshipsError;

      if (!friendships || friendships.length === 0) {
        setFriends([]);
      } else {
        // Get friend details
        const friendIds = friendships.flatMap(f =>
          f.user1_id === user.id ? [f.user2_id] : [f.user1_id]
        );

        const { data: friendsData, error: friendsError } = await supabase
          .from("users")
          .select("id, clerk_user_id, full_name, image_url")
          .in("clerk_user_id", friendIds);

        if (friendsError) throw friendsError;

        setFriends(friendsData || []);
      }

      // Get pending friend requests
      const { data: requests, error: requestsError } = await supabase
        .from("friend_requests")
        .select("*")
        .eq("receiver_id", user.id)
        .eq("status", "pending");

      if (requestsError) throw requestsError;

      setFriendRequests(requests || []);

      // Get details of users who sent requests
      if (requests && requests.length > 0) {
        const senderIds = requests.map(r => r.sender_id);
        const { data: sendersData, error: sendersError } = await supabase
          .from("users")
          .select("id, clerk_user_id, full_name, image_url")
          .in("clerk_user_id", senderIds);

        if (sendersError) throw sendersError;
        setRequestsUsers(sendersData || []);
      } else {
        setRequestsUsers([]);
      }
    } catch (error) {
      console.error("Error loading friends:", error);
      toast.error("Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendId) => {
    try {
      // Find and delete the friendship
      const { error } = await supabase
        .from("friendships")
        .delete()
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${friendId}),and(user1_id.eq.${friendId},user2_id.eq.${user.id})`);

      if (error) throw error;

      toast.success("Friend removed from your list");
      loadFriends(); // Refresh the list
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error("Failed to remove friend");
    }
  };

  const acceptFriendRequest = async (requestId, senderId) => {
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from("friend_requests")
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Create friendship
      const user1 = user.id < senderId ? user.id : senderId;
      const user2 = user.id < senderId ? senderId : user.id;

      const { error: friendshipError } = await supabase
        .from("friendships")
        .insert({ user1_id: user1, user2_id: user2 });

      if (friendshipError) throw friendshipError;

      toast.success("Friend request accepted!");
      loadFriends(); // Refresh data
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Failed to accept friend request");
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast.success("Friend request declined");
      loadFriends(); // Refresh data
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

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-black mb-8">My friends</h1>

        {/* Pending Friend Requests Section */}
        {friendRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">Pending friend requests</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {requestsUsers.map((requester) => {
                const request = friendRequests.find(r => r.sender_id === requester.clerk_user_id);
                return (
                  <div key={requester.id} className="bg-white rounded-xl p-4 shadow-md border-2 border-blue-500">
                    <div className="flex items-center mb-3">
                      <img
                        src={requester.image_url || "/default-avatar.png"}
                        alt={requester.full_name}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      <div>
                        <h3 className="font-semibold text-black">{requester.full_name}</h3>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptFriendRequest(request.id, requester.clerk_user_id)}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => rejectFriendRequest(request.id)}
                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Friends List Section */}
        <div>
          <h2 className="text-2xl font-bold text-black mb-4">Friends</h2>
          {friends.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-xl mb-4">You don&apos;t have any friends yet</p>
              <p>Go to &quot;Add friends&quot; to add new friends</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {friends.map((friend) => (
                <div key={friend.id} className="bg-white rounded-xl p-4 shadow-md">
                  <div className="flex items-center mb-3">
                    <img
                      src={friend.image_url || "/default-avatar.png"}
                      alt={friend.full_name}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                    <div>
                      <h3 className="font-semibold text-black">{friend.full_name}</h3>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFriend(friend.clerk_user_id)}
                    className="w-full bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
                  >
                    Remove friend
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Friends;