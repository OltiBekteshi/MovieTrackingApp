import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../utils/supabaseClient";

const Notifications = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);

  // Load notifications
  useEffect(() => {
    if (!user) return;

    const loadNotifs = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false });

      setNotifications(data);
    };

    loadNotifs();
  }, [user]);

  // REALTIME listener
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Njoftimet</h2>

      {notifications.length === 0 && (
        <p className="text-gray-500">Nuk ke njoftime.</p>
      )}

      {notifications.map((n) => (
        <div
          key={n.id}
          className="p-4 bg-white border-l-4 border-green-600 rounded-lg shadow mb-3"
        >
          <h3 className="font-semibold">{n.title}</h3>
          <p className="text-gray-700">{n.message}</p>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
