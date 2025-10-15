-- Activity Feed Automation Triggers
-- These triggers automatically create activity feed entries when users complete actions

-- Function to create activity when lesson is completed
CREATE OR REPLACE FUNCTION create_lesson_completion_activity()
RETURNS TRIGGER AS $$
DECLARE
  lesson_title TEXT;
  module_title TEXT;
  mod_id UUID;
BEGIN
  -- Only create activity if status changed to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get lesson and module titles (with error handling)
    BEGIN
      SELECT l.title, m.title, l.module_id
      INTO lesson_title, module_title, mod_id
      FROM lessons l
      LEFT JOIN modules m ON l.module_id = m.id
      WHERE l.id = NEW.lesson_id;
      
      -- Only create activity if we have the necessary data
      IF lesson_title IS NOT NULL THEN
        INSERT INTO activity_feed (user_id, activity_type, title, description, link, metadata)
        VALUES (
          NEW.user_id,
          'lesson_completed',
          'Completed a lesson',
          COALESCE(lesson_title, 'Untitled Lesson'),
          CASE WHEN mod_id IS NOT NULL 
            THEN '/modules/' || mod_id || '/lessons/' || NEW.lesson_id
            ELSE '/modules'
          END,
          jsonb_build_object(
            'lesson_id', NEW.lesson_id, 
            'lesson_title', COALESCE(lesson_title, 'Untitled Lesson'), 
            'module_title', COALESCE(module_title, 'Unknown Module')
          )
        );
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but don't fail the trigger
        RAISE WARNING 'Failed to create lesson completion activity: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for lesson completion
DROP TRIGGER IF EXISTS trigger_lesson_completion_activity ON lesson_progress;
CREATE TRIGGER trigger_lesson_completion_activity
AFTER INSERT OR UPDATE ON lesson_progress
FOR EACH ROW
EXECUTE FUNCTION create_lesson_completion_activity();

-- Function to create activity when discussion post is created
CREATE OR REPLACE FUNCTION create_discussion_post_activity()
RETURNS TRIGGER AS $$
DECLARE
  thread_title TEXT;
BEGIN
  -- Get thread title
  SELECT title INTO thread_title
  FROM discussion_threads
  WHERE id = NEW.thread_id;
  
  -- Create activity
  INSERT INTO activity_feed (user_id, activity_type, title, description, link, metadata)
  VALUES (
    NEW.author_id,
    'discussion_post',
    'Posted in a discussion',
    thread_title,
    '/discussions/' || NEW.thread_id,
    jsonb_build_object('thread_id', NEW.thread_id, 'post_id', NEW.id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for discussion posts
DROP TRIGGER IF EXISTS trigger_discussion_post_activity ON discussion_posts;
CREATE TRIGGER trigger_discussion_post_activity
AFTER INSERT ON discussion_posts
FOR EACH ROW
EXECUTE FUNCTION create_discussion_post_activity();

-- Function to create activity when book is finished
CREATE OR REPLACE FUNCTION create_book_finished_activity()
RETURNS TRIGGER AS $$
DECLARE
  book_title TEXT;
BEGIN
  -- Only create activity if status changed to finished
  IF NEW.status = 'finished' AND (OLD.status IS NULL OR OLD.status != 'finished') THEN
    -- Get book title
    SELECT title INTO book_title
    FROM books
    WHERE id = NEW.book_id;
    
    -- Create activity
    INSERT INTO activity_feed (user_id, activity_type, title, description, link, metadata)
    VALUES (
      NEW.user_id,
      'book_progress',
      'Finished reading a book',
      book_title,
      '/library',
      jsonb_build_object('book_id', NEW.book_id, 'book_title', book_title, 'icon', '📚')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for book completion
DROP TRIGGER IF EXISTS trigger_book_finished_activity ON reading_progress;
CREATE TRIGGER trigger_book_finished_activity
AFTER INSERT OR UPDATE ON reading_progress
FOR EACH ROW
EXECUTE FUNCTION create_book_finished_activity();

-- Function to create activity when user registers for event
CREATE OR REPLACE FUNCTION create_event_registration_activity()
RETURNS TRIGGER AS $$
DECLARE
  event_title TEXT;
BEGIN
  -- Get event title
  SELECT title INTO event_title
  FROM events
  WHERE id = NEW.event_id;
  
  -- Create activity
  INSERT INTO activity_feed (user_id, activity_type, title, description, link, metadata)
  VALUES (
    NEW.user_id,
    'event_registered',
    'Registered for an event',
    event_title,
    '/calendar',
    jsonb_build_object('event_id', NEW.event_id, 'event_title', event_title)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for event registration (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'event_registrations') THEN
    DROP TRIGGER IF EXISTS trigger_event_registration_activity ON event_registrations;
    CREATE TRIGGER trigger_event_registration_activity
    AFTER INSERT ON event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION create_event_registration_activity();
  END IF;
END $$;

-- Function to check module completion
CREATE OR REPLACE FUNCTION check_module_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  module_title TEXT;
  mod_id UUID;
BEGIN
  -- Only check if a lesson was just completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    BEGIN
      -- Get module id
      SELECT module_id INTO mod_id
      FROM lessons
      WHERE id = NEW.lesson_id;
      
      IF mod_id IS NULL THEN
        RETURN NEW;
      END IF;
      
      -- Count total lessons in module
      SELECT COUNT(*) INTO total_lessons
      FROM lessons
      WHERE module_id = mod_id AND is_published = true;
      
      -- Count completed lessons for this user in this module
      SELECT COUNT(*) INTO completed_lessons
      FROM lesson_progress lp
      JOIN lessons l ON lp.lesson_id = l.id
      WHERE lp.user_id = NEW.user_id 
        AND l.module_id = mod_id 
        AND lp.status = 'completed';
      
      -- If all lessons completed, create module completion activity
      IF completed_lessons = total_lessons AND total_lessons > 0 THEN
        SELECT title INTO module_title
        FROM modules
        WHERE id = mod_id;
        
        INSERT INTO activity_feed (user_id, activity_type, title, description, link, metadata)
        VALUES (
          NEW.user_id,
          'module_completed',
          'Completed a module',
          COALESCE(module_title, 'Untitled Module'),
          '/modules/' || mod_id,
          jsonb_build_object('module_id', mod_id, 'module_title', COALESCE(module_title, 'Untitled Module'), 'icon', '🎓')
        );
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but don't fail the trigger
        RAISE WARNING 'Failed to check module completion: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for module completion check
DROP TRIGGER IF EXISTS trigger_check_module_completion ON lesson_progress;
CREATE TRIGGER trigger_check_module_completion
AFTER INSERT OR UPDATE ON lesson_progress
FOR EACH ROW
EXECUTE FUNCTION check_module_completion();

