import { supabase } from "./supabaseClient";

// WATCHLIST
export async function getWatchlist(userId) {
  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", userId)
    .order("inserted_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addToWatchlist(userId, movie) {
  const { data, error } = await supabase.from("watchlist").upsert([
    {
      user_id: userId,
      movie_id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      runtime: movie.runtime,
    },
  ]);
  if (error) throw error;
  return data;
}

export async function removeFromWatchlist(userId, movieId) {
  const { data, error } = await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", userId)
    .eq("movie_id", movieId);
  if (error) throw error;
  return data;
}

export async function addComment(userId, movieId, comment) {
  const { data, error } = await supabase
    .from("watchlist")
    .update({
      comments: supabase.array_append("comments", comment),
    })
    .eq("user_id", userId)
    .eq("movie_id", movieId);
  if (error) throw error;
  return data;
}

// WATCHLATER
export async function getWatchLater(userId) {
  const { data, error } = await supabase
    .from("watchlater")
    .select("*")
    .eq("user_id", userId)
    .order("inserted_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addToWatchLater(userId, movie) {
  const { data, error } = await supabase.from("watchlater").upsert([
    {
      user_id: userId,
      movie_id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      runtime: movie.runtime,
    },
  ]);
  if (error) throw error;
  return data;
}

export async function removeFromWatchLater(userId, movieId) {
  const { data, error } = await supabase
    .from("watchlater")
    .delete()
    .eq("user_id", userId)
    .eq("movie_id", movieId);
  if (error) throw error;
  return data;
}
