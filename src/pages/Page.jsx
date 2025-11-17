import React, { useState, useEffect } from "react";
import { supabase } from "./../utils/supabaseClient";
import { useUser } from "@clerk/clerk-react";

function Page() {
  const { user } = useUser();
  const userId = user?.id;

  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const getTodos = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", userId);

      if (error) console.error(error);
      else setTodos(data);
    };
    getTodos();
  }, [userId]);

  return (
    <div>
      <h1>My Todos</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default Page;
