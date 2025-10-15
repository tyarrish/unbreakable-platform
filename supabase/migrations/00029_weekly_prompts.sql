-- Create weekly prompts table for guided check-ins

CREATE TABLE IF NOT EXISTS weekly_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INTEGER UNIQUE NOT NULL,
  main_question TEXT NOT NULL,
  commitment_prompt TEXT NOT NULL,
  reflection_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE weekly_prompts ENABLE ROW LEVEL SECURITY;

-- Anyone can read prompts
CREATE POLICY "Anyone can view prompts"
  ON weekly_prompts FOR SELECT
  USING (true);

-- Seed prompts for all 32 weeks (8 months x 4 weeks)
INSERT INTO weekly_prompts (week_number, main_question, commitment_prompt, reflection_prompt) VALUES
  -- Month 1: Personal Leadership Foundations
  (1, 'What is your primary leadership challenge right now?', 'What will you practice this week from Module 1?', 'What surprised you about the Container Concept?'),
  (2, 'How did your practice from last week go?', 'What leadership practice will you commit to this week?', 'How are you building your inner container?'),
  (3, 'What''s the biggest obstacle to your leadership growth?', 'What daily practice will you maintain this week?', 'What Stoic principle resonates most?'),
  (4, 'How has your self-awareness shifted this month?', 'What will you do differently in your leadership this week?', 'What have you learned about yourself?'),
  
  -- Month 2: Interpersonal Container
  (5, 'What conversation are you avoiding right now?', 'What difficult conversation will you have this week?', 'How do you show up in high-stakes dialogue?'),
  (6, 'How did that conversation go? What did you learn?', 'What will you practice in your next crucial conversation?', 'What''s your default pattern in conflict?'),
  (7, 'Where do you need to set clearer context?', 'What context will you set more clearly this week?', 'How well do you build trust with your team?'),
  (8, 'How are you creating conditions for others to thrive?', 'What support will you offer someone this week?', 'What recognition have you given lately?'),
  
  -- Month 3: Systems Leadership
  (9, 'What system needs your attention?', 'What one system will you improve this week?', 'How do you think systemically?'),
  (10, 'What patterns are you noticing in your organization?', 'What pattern will you interrupt this week?', 'Where are leverage points in your systems?'),
  (11, 'How are you building organizational capacity?', 'What capability will you develop in others this week?', 'What systems thinking have you applied?'),
  (12, 'What legacy are you creating?', 'What long-term investment will you make this week?', 'How are your systems evolving?'),
  
  -- Month 4: Strategic Leadership
  (13, 'What decision have you been postponing?', 'What decision will you make this week?', 'How do you navigate ambiguity?'),
  (14, 'How are you balancing urgent vs. important?', 'What important work will you prioritize this week?', 'What are you saying no to?'),
  (15, 'Where do you need strategic clarity?', 'What strategic question will you explore this week?', 'How aligned is your team?'),
  (16, 'How are you developing future leaders?', 'Who will you mentor or develop this week?', 'What leadership capacity are you building?'),
  
  -- Month 5: Cultural Leadership
  (17, 'What culture are you creating?', 'What cultural norm will you model this week?', 'How does your behavior shape culture?'),
  (18, 'Where is there misalignment in your team?', 'What alignment conversation will you have this week?', 'How do you address cultural issues?'),
  (19, 'What values need stronger emphasis?', 'What value will you explicitly reinforce this week?', 'How visible are your values?'),
  (20, 'How are rituals and practices shaping your culture?', 'What ritual or practice will you establish this week?', 'What culture do you want in 6 months?'),
  
  -- Month 6: Change Leadership
  (21, 'What change is needed in your organization?', 'What small change will you initiate this week?', 'How do you navigate resistance?'),
  (22, 'How are you managing the transition?', 'What transition support will you provide this week?', 'What''s your role in the change?'),
  (23, 'Where is there change fatigue?', 'How will you restore energy this week?', 'What''s working in the change process?'),
  (24, 'How are you sustaining the change?', 'What will you do this week to embed the change?', 'What evidence of change do you see?'),
  
  -- Month 7: Complexity Leadership
  (25, 'What complex challenge are you facing?', 'What experiment will you try this week?', 'How are you thinking about complexity?'),
  (26, 'What emerged from your experiment?', 'What will you adapt based on learning?', 'What patterns are emerging?'),
  (27, 'How are you enabling emergence?', 'What space will you create for innovation this week?', 'What complexity are you embracing?'),
  (28, 'What networks and connections matter most?', 'What relationship will you strengthen this week?', 'How connected is your system?'),
  
  -- Month 8: Integration & Impact
  (29, 'How have you grown as a leader?', 'What practice will you maintain going forward?', 'What''s your biggest leadership shift?'),
  (30, 'What impact are you creating?', 'What will you do this week to amplify impact?', 'How are you measuring success?'),
  (31, 'What will you continue after the program?', 'What commitment will you make to yourself?', 'What practices are now habits?'),
  (32, 'What''s your leadership legacy?', 'How will you support other leaders going forward?', 'What are you most proud of?');

