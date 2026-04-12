-- Run once in Supabase SQL Editor: enables replies on public film discussion comments.
-- If your film_discussion.id is UUID (not BIGINT), change parent_id to UUID to match.

ALTER TABLE film_discussion
ADD COLUMN IF NOT EXISTS parent_id BIGINT REFERENCES film_discussion (id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_film_discussion_parent ON film_discussion (parent_id);
