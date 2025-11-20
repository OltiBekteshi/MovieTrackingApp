import { supabase } from "./supabaseClient";

// Watchlist Functions
export async function getWatchlist(userId) {
  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", userId)
    .order("inserted_at", { ascending: false });
  if (error) throw error;
  return data;
}

// Add movie to watchlist with runtime
export async function addToWatchlist(userId, movie, runtime) {
  const { data, error } = await supabase.from("watchlist").upsert([
    {
      user_id: userId,
      movie_id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      runtime: runtime || 0, // store runtime
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

// Comments
export const saveComment = async (userId, movieId, comment) => {
  const { data, error } = await supabase
    .from("comments")
    .insert([{ user_id: userId, movie_id: movieId, comment }]);
  if (error) throw error;
  return data;
};

export const getComments = async (userId, movieId) => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("user_id", userId)
    .eq("movie_id", movieId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
};

// Watch Later Functions
export async function getWatchLater(userId) {
  const { data, error } = await supabase
    .from("watchlater")
    .select("*")
    .eq("user_id", userId)
    .order("inserted_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addToWatchLater(userId, movie, runtime) {
  const { data, error } = await supabase.from("watchlater").upsert([
    {
      user_id: userId,
      movie_id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      runtime: runtime || 0,
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
