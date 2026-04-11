import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../utils/supabaseClient";
import { Toaster, toast } from "sonner";

const AddFriends = () => {
  const { user } = useUser();
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendships, setFriendships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, allUsers]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all users except current user
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("*")
        .neq("clerk_user_id", user.id);

      if (usersError) throw usersError;

      // Load friend requests
      const { data: requests, error: requestsError } = await supabase
        .from("friend_requests")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (requestsError) throw requestsError;

      // Load friendships
      const { data: friends, error: friendsError } = await supabase
        .from("friendships")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (friendsError) throw friendsError;

      setAllUsers(users || []);
      setFriendRequests(requests || []);
      setFriendships(friends || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Gabim gjatë ngarkimit të të dhënave");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers([]);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = allUsers.filter(u =>
        u.full_name?.toLowerCase().startsWith(searchLower)
      );
      setFilteredUsers(filtered);
    }
  };

  const getUserStatus = (userId) => {
    // Check if already friends
    const isFriend = friendships.some(f =>
      (f.user1_id === user.id && f.user2_id === userId) ||
      (f.user1_id === userId && f.user2_id === user.id)
    );

    if (isFriend) return { status: 'friend', text: 'Shok' };

    // Check for pending requests
    const sentRequest = friendRequests.find(r =>
      r.sender_id === user.id && r.receiver_id === userId && r.status === 'pending'
    );
    if (sentRequest) return { status: 'pending', text: 'Kërkesë e dërguar' };

    const receivedRequest = friendRequests.find(r =>
      r.sender_id === userId && r.receiver_id === user.id && r.status === 'pending'
    );
    if (receivedRequest) return { status: 'received', text: 'Prano kërkesën' };

    return { status: 'none', text: 'Dërgo kërkesë' };
  };

  const sendFriendRequest = async (receiverId) => {
    try {
      const { error } = await supabase
        .from("friend_requests")
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) throw error;

      toast.success("Kërkesa për miqësi u dërgua!");
      loadData(); // Refresh data
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Gabim gjatë dërgimit të kërkesës");
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

      toast.success("Kërkesa për miqësi u pranua!");
      loadData(); // Refresh data
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Gabim gjatë pranimit të kërkesës");
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast.success("Kërkesa për miqësi u refuzua");
      loadData(); // Refresh data
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast.error("Gabim gjatë refuzimit të kërkesës");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-xl">Duke ngarkuar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-black mb-8">Shto Shokë</h1>

        {/* Search Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Kërko përdoruesin..."
            className="w-full max-w-md mx-auto block px-4 py-2 rounded-lg bg-white text-black border-2 border-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Users List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((u) => {
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
                  <span className={`text-sm px-2 py-1 rounded ${
                    userStatus.status === 'friend' ? 'bg-green-100 text-green-800' :
                    userStatus.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    userStatus.status === 'received' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {userStatus.text}
                  </span>

                  {userStatus.status === 'none' && (
                    <button
                      onClick={() => sendFriendRequest(u.clerk_user_id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                    >
                      Dërgo kërkesë
                    </button>
                  )}

                  {userStatus.status === 'received' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const request = friendRequests.find(r =>
                            r.sender_id === u.clerk_user_id && r.receiver_id === user.id
                          );
                          acceptFriendRequest(request.id, u.clerk_user_id);
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                      >
                        Prano
                      </button>
                      <button
                        onClick={() => {
                          const request = friendRequests.find(r =>
                            r.sender_id === u.clerk_user_id && r.receiver_id === user.id
                          );
                          rejectFriendRequest(request.id);
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                      >
                        Refuzo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center text-gray-500 mt-8">
            {searchTerm ? "Nuk u gjet asnjë përdorues" : "Nuk ka përdorues të tjerë"}
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default AddFriends;