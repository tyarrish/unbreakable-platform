-- Fix the check_module_completion trigger
-- The issue is that we were checking is_published on lessons table, but that column doesn't exist
-- Only modules table has is_published column

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
      
      -- Count total lessons in module (removed is_published check since it's on modules, not lessons)
      SELECT COUNT(*) INTO total_lessons
      FROM lessons
      WHERE module_id = mod_id;
      
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

