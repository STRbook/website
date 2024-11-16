-- Add new columns if they don't exist
DO $$ 
BEGIN 
    -- Add religion column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='student_profile' AND column_name='religion') THEN
        ALTER TABLE student_profile ADD COLUMN religion VARCHAR(100);
    END IF;

    -- Add hobbies column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='student_profile' AND column_name='hobbies') THEN
        ALTER TABLE student_profile ADD COLUMN hobbies TEXT;
    END IF;

    -- Add profile_picture_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='student_profile' AND column_name='profile_picture_url') THEN
        ALTER TABLE student_profile ADD COLUMN profile_picture_url TEXT;
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='student_profile' AND column_name='updated_at') THEN
        ALTER TABLE student_profile ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='student_profile' AND column_name='created_at') THEN
        ALTER TABLE student_profile ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Add constraints
    BEGIN
        ALTER TABLE student_profile ADD CONSTRAINT student_profile_usn_key UNIQUE (usn);
    EXCEPTION 
        WHEN duplicate_table THEN 
        NULL;
    END;

    BEGIN
        ALTER TABLE student_profile ADD CONSTRAINT student_profile_email_key UNIQUE (email);
    EXCEPTION 
        WHEN duplicate_table THEN 
        NULL;
    END;
END $$;
