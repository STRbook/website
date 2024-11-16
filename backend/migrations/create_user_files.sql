-- Create enum for file types
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'file_type_enum') THEN
        CREATE TYPE file_type_enum AS ENUM ('profile_picture', 'mooc_certificate');
    END IF;
END $$;

-- Create user_files table
CREATE TABLE IF NOT EXISTS user_files (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    file_type file_type_enum NOT NULL,
    semester INTEGER CHECK (semester BETWEEN 1 AND 8),
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    --  only one profile picture per user
    CONSTRAINT unique_profile_picture 
        UNIQUE (user_id, file_type) 
        WHERE file_type = 'profile_picture',
    
    -- only one certificate per semester per user
    CONSTRAINT unique_certificate_per_semester 
        UNIQUE (user_id, file_type, semester) 
        WHERE file_type = 'mooc_certificate'
);

--  index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON user_files(user_id);
CREATE INDEX IF NOT EXISTS idx_user_files_type ON user_files(file_type);

--  update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- trigger to automatically update timestamp
DROP TRIGGER IF EXISTS update_user_files_updated_at ON user_files;
CREATE TRIGGER update_user_files_updated_at
    BEFORE UPDATE ON user_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
