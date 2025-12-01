import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../utils/supabaseClient";

export default function Notifications() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    const { data } = await supabase
      .from("recommendations")
      .select("*")
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false });

    setNotifications(data);
  };

  useEffect(() => {
    if (!user) return;

    loadNotifications();

    const channel = supabase
      .channel("realtime-recommendations")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "recommendations",
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
    <div className="p-4 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-3">Rekomandimet</h2>

      {notifications.length === 0 ? (
        <p className="text-gray-500">Nuk ke rekomandime.</p>
      ) : (
        notifications.map((n) => (
          <div key={n.id} className="p-2 border-b">
            <p>{n.message}</p>
          </div>
        ))
      )}
    </div>
  );
}
