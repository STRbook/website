-- Add profile_picture_url column to student_profiles table
ALTER TABLE student_profiles
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Update existing rows with null profile_picture_url
UPDATE student_profiles
SET profile_picture_url = NULL
WHERE profile_picture_url IS NULL;
