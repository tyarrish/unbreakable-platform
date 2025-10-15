-- Achievement Automation Triggers
-- These triggers automatically check and award achievements when users complete milestones

-- Helper function to award an achievement if not already earned
CREATE OR REPLACE FUNCTION award_achievement_if_new(p_user_id UUID, p_achievement_name TEXT)
RETURNS VOID AS $$
DECLARE
  v_achievement_id UUID;
  v_achievement_icon TEXT;
  v_achievement_desc TEXT;
BEGIN
  -- Get achievement details
  SELECT id, icon, description 
  INTO v_achievement_id, v_achievement_icon, v_achievement_desc
  FROM achievements 
  WHERE name = p_achievement_name;
  
  -- Check if user already has this achievement
  IF NOT EXISTS (
    SELECT 1 FROM user_achievements 
    WHERE user_id = p_user_id AND achievement_id = v_achievement_id
  ) THEN
    -- Award the achievement
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (p_user_id, v_achievement_id);
    
    -- Create notification
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
      p_user_id,
      'achievement',
      'Achievement Unlocked: ' || p_achievement_name || '!',
      v_achievement_desc,
      '/profile',
      jsonb_build_object('achievement_id', v_achievement_id)
    );
    
    -- Create activity
    INSERT INTO activity_feed (user_id, activity_type, title, description, link, metadata)
    VALUES (
      p_user_id,
      'achievement_earned',
      'Earned "' || p_achievement_name || '" achievement',
      v_achievement_desc,
      '/profile',
      jsonb_build_object('achievement_id', v_achievement_id, 'icon', v_achievement_icon)
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Check achievements when lesson is completed
CREATE OR REPLACE FUNCTION check_lesson_achievements()
RETURNS TRIGGER AS $$
DECLARE
  completed_count INTEGER;
  hour_of_day INTEGER;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Count total completed lessons
    SELECT COUNT(*) INTO completed_count
    FROM lesson_progress
    WHERE user_id = NEW.user_id AND status = 'completed';
    
    -- First Steps: Complete first lesson
    IF completed_count = 1 THEN
      PERFORM award_achievement_if_new(NEW.user_id, 'First Steps');
    END IF;
    
    -- Early Bird: Complete lesson before 8 AM
    hour_of_day := EXTRACT(HOUR FROM NEW.updated_at AT TIME ZONE 'America/Los_Angeles');
    IF hour_of_day < 8 THEN
      PERFORM award_achievement_if_new(NEW.user_id, 'Early Bird');
    END IF;
    
    -- Night Owl: Complete lesson after 10 PM
    IF hour_of_day >= 22 THEN
      PERFORM award_achievement_if_new(NEW.user_id, 'Night Owl');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_lesson_achievements ON lesson_progress;
CREATE TRIGGER trigger_check_lesson_achievements
AFTER INSERT OR UPDATE ON lesson_progress
FOR EACH ROW
EXECUTE FUNCTION check_lesson_achievements();

-- Check achievements when module is completed
CREATE OR REPLACE FUNCTION check_module_achievements()
RETURNS TRIGGER AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  mod_id UUID;
  total_modules INTEGER;
  completed_modules INTEGER;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get module id
    SELECT module_id INTO mod_id FROM lessons WHERE id = NEW.lesson_id;
    
    -- Check if module is complete
    SELECT COUNT(*) INTO total_lessons
    FROM lessons WHERE module_id = mod_id AND is_published = true;
    
    SELECT COUNT(*) INTO completed_lessons
    FROM lesson_progress lp
    JOIN lessons l ON lp.lesson_id = l.id
    WHERE lp.user_id = NEW.user_id AND l.module_id = mod_id AND lp.status = 'completed';
    
    -- If module just completed
    IF completed_lessons = total_lessons THEN
      -- Module Master: Complete first module
      SELECT COUNT(DISTINCT l.module_id) INTO completed_modules
      FROM lesson_progress lp
      JOIN lessons l ON lp.lesson_id = l.id
      WHERE lp.user_id = NEW.user_id AND lp.status = 'completed';
      
      IF completed_modules = 1 THEN
        PERFORM award_achievement_if_new(NEW.user_id, 'Module Master');
      END IF;
      
      -- All-In: Complete all modules
      SELECT COUNT(*) INTO total_modules FROM modules WHERE is_published = true;
      IF completed_modules >= total_modules THEN
        PERFORM award_achievement_if_new(NEW.user_id, 'All-In');
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_module_achievements ON lesson_progress;
CREATE TRIGGER trigger_check_module_achievements
AFTER INSERT OR UPDATE ON lesson_progress
FOR EACH ROW
EXECUTE FUNCTION check_module_achievements();

-- Check achievements when discussion post is created
CREATE OR REPLACE FUNCTION check_discussion_achievements()
RETURNS TRIGGER AS $$
DECLARE
  post_count INTEGER;
BEGIN
  -- Count total discussion posts by user
  SELECT COUNT(*) INTO post_count
  FROM discussion_posts
  WHERE author_id = NEW.author_id;
  
  -- Discussion Starter: Create first discussion post
  IF post_count = 1 THEN
    PERFORM award_achievement_if_new(NEW.author_id, 'Discussion Starter');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_discussion_achievements ON discussion_posts;
CREATE TRIGGER trigger_check_discussion_achievements
AFTER INSERT ON discussion_posts
FOR EACH ROW
EXECUTE FUNCTION check_discussion_achievements();

-- Check achievements when book is finished
CREATE OR REPLACE FUNCTION check_book_achievements()
RETURNS TRIGGER AS $$
DECLARE
  finished_count INTEGER;
BEGIN
  IF NEW.status = 'finished' AND (OLD.status IS NULL OR OLD.status != 'finished') THEN
    -- Count finished books
    SELECT COUNT(*) INTO finished_count
    FROM reading_progress
    WHERE user_id = NEW.user_id AND status = 'finished';
    
    -- Book Lover: Finish first book
    IF finished_count = 1 THEN
      PERFORM award_achievement_if_new(NEW.user_id, 'Book Lover');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_book_achievements ON reading_progress;
CREATE TRIGGER trigger_check_book_achievements
AFTER INSERT OR UPDATE ON reading_progress
FOR EACH ROW
EXECUTE FUNCTION check_book_achievements();

-- Check achievements when user gets a follower
CREATE OR REPLACE FUNCTION check_follower_achievements()
RETURNS TRIGGER AS $$
DECLARE
  follower_count INTEGER;
BEGIN
  -- Count total followers
  SELECT COUNT(*) INTO follower_count
  FROM user_follows
  WHERE following_id = NEW.following_id;
  
  -- Community Builder: Get 10 followers
  IF follower_count >= 10 THEN
    PERFORM award_achievement_if_new(NEW.following_id, 'Community Builder');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_follower_achievements ON user_follows;
CREATE TRIGGER trigger_check_follower_achievements
AFTER INSERT ON user_follows
FOR EACH ROW
EXECUTE FUNCTION check_follower_achievements();

-- Check achievements for reflections
CREATE OR REPLACE FUNCTION check_reflection_achievements()
RETURNS TRIGGER AS $$
DECLARE
  reflection_count INTEGER;
BEGIN
  -- Only check if reflection was added/updated and is not empty
  IF NEW.reflection IS NOT NULL AND NEW.reflection != '' AND 
     (OLD.reflection IS NULL OR OLD.reflection = '' OR OLD.reflection != NEW.reflection) THEN
    
    -- Count reflections
    SELECT COUNT(*) INTO reflection_count
    FROM lesson_progress
    WHERE user_id = NEW.user_id 
      AND reflection IS NOT NULL 
      AND reflection != '';
    
    -- Reflection Writer: Write 10 reflections
    IF reflection_count >= 10 THEN
      PERFORM award_achievement_if_new(NEW.user_id, 'Reflection Writer');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_reflection_achievements ON lesson_progress;
CREATE TRIGGER trigger_check_reflection_achievements
AFTER INSERT OR UPDATE ON lesson_progress
FOR EACH ROW
EXECUTE FUNCTION check_reflection_achievements();

-- Check streak achievements (to be called by a cron job or on login)
CREATE OR REPLACE FUNCTION check_streak_achievements(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  current_streak INTEGER;
BEGIN
  -- Get current streak from user_engagement
  SELECT COALESCE(current_streak, 0) INTO current_streak
  FROM user_engagement
  WHERE user_id = p_user_id
  ORDER BY date DESC
  LIMIT 1;
  
  -- Consistency Champion: 7-day streak
  IF current_streak >= 7 THEN
    PERFORM award_achievement_if_new(p_user_id, 'Consistency Champion');
  END IF;
  
  -- Dedication Master: 30-day streak
  IF current_streak >= 30 THEN
    PERFORM award_achievement_if_new(p_user_id, 'Dedication Master');
  END IF;
END;
$$ LANGUAGE plpgsql;

