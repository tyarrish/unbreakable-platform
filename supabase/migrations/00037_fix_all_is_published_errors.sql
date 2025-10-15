-- Fix ALL triggers that incorrectly reference is_published on lessons table
-- is_published only exists on modules table, NOT on lessons table

-- Fix the achievement trigger for module completion
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
    
    -- Check if module is complete (removed is_published check)
    SELECT COUNT(*) INTO total_lessons
    FROM lessons WHERE module_id = mod_id;
    
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
      
      -- All-In: Complete all modules (this is_published is correct, it's on modules table)
      SELECT COUNT(*) INTO total_modules FROM modules WHERE is_published = true;
      IF completed_modules >= total_modules THEN
        PERFORM award_achievement_if_new(NEW.user_id, 'All-In');
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

