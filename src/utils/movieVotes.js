import { supabase } from "./supabaseClient";

export async function getUserMovieRating(movieId, userId) {
  const { data, error } = await supabase
    .from("movie_votes")
    .select("rating")
    .eq("movie_id", movieId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return null;
  return data?.rating || null;
}

export async function saveMovieRating(movieId, userId, rating) {
  const { data, error } = await supabase
    .from("movie_votes")
    .upsert(
      {
        movie_id: movieId,
        user_id: userId,
        rating,
      },
      { onConflict: "movie_id,user_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Error saving movie rating:", error);
    return null;
  }

  return data;
}

export async function getLastRatings(movieId) {
  const { data, error } = await supabase
    .from("movie_votes")
    .select(
      `
      id,
      rating,
      created_at,
      users:user_id (
        full_name
      )
    `
    )
    .eq("movie_id", movieId)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error loading last ratings:", error);
    return [];
  }

  return data.map((r) => ({
    id: r.id,
    rating: r.rating,
    user_full_name: r.users?.full_name || "Përdorues anonim",
  }));
}

export async function getAverageRating(movieId) {
  const { data, error } = await supabase.from("movie_votes").select("rating");

  if (error) {
    console.error("Error loading avg rating:", error);
    return null;
  }

  const movieVotes = data.filter((v) => v.movie_id === movieId);

  if (movieVotes.length === 0) {
    return { average: 0, count: 0 };
  }

  const total = movieVotes.reduce((sum, v) => sum + v.rating, 0);
  const avg = total / movieVotes.length;

  return { average: avg, count: movieVotes.length };
}
