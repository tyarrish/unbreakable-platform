-- RLTE Platform - Video & Resources Enhancement
-- Add video support, module attachments, and enhanced progress tracking

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add video fields to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_duration INTEGER,
ADD COLUMN IF NOT EXISTS video_thumbnail_url TEXT;

-- Add description field to lesson_attachments
ALTER TABLE lesson_attachments
ADD COLUMN IF NOT EXISTS description TEXT;

-- Create module_attachments table
CREATE TABLE IF NOT EXISTS module_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add enhanced progress tracking fields to lesson_progress
ALTER TABLE lesson_progress
ADD COLUMN IF NOT EXISTS video_watch_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS resources_downloaded JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS reflection_word_count INTEGER DEFAULT 0;

-- Enable RLS on module_attachments
ALTER TABLE module_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for module_attachments
CREATE POLICY "Everyone can view module attachments"
  ON module_attachments FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins and facilitators can manage module attachments"
  ON module_attachments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'facilitator')
  ));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS module_attachments_module_idx ON module_attachments(module_id);
CREATE INDEX IF NOT EXISTS lessons_video_url_idx ON lessons(video_url) WHERE video_url IS NOT NULL;

