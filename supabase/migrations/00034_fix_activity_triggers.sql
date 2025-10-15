-- Fix activity triggers with better error handling
-- This updates the functions to handle missing data gracefully

-- Update lesson completion activity function
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

-- Update module completion check function
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

