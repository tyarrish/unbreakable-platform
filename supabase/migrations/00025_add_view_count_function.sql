-- Add function to increment thread view count
CREATE OR REPLACE FUNCTION increment_thread_views(thread_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE discussion_threads
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_thread_views(UUID) TO authenticated, anon;

